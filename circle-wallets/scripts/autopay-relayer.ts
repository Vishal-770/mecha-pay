import { MongoClient } from "mongodb";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcTestnet } from "../lib/bridge_config";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "mecha-pay";
const SUBSCRIPTION_GATEWAY_ADDRESS = "0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2";
const ARC_USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const ARC_RPC_URL = "https://rpc.testnet.arc.network";

// ERC-20 standard ABI snippet for checking USDC balance/allowance
const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// SubscriptionGateway ABI snippet for plan details & signature execution
const gatewayAbi = [
  {
    name: "plans",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [
      { name: "seller", type: "address" },
      { name: "duration", type: "uint32" },
      { name: "ipfsHash", type: "string" },
      { name: "active", type: "bool" },
      { name: "tierCount", type: "uint256" },
    ],
  },
  {
    name: "getTier",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "planId", type: "bytes32" },
      { name: "tierId", type: "uint256" },
    ],
    outputs: [
      { name: "price", type: "uint256" },
      { name: "label", type: "string" },
      { name: "active", type: "bool" },
    ],
  },
  {
    name: "subscribeWithSignature",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "subscriber", type: "address" },
      { name: "sessionPublicKey", type: "address" },
      { name: "planId", type: "bytes32" },
      { name: "tierId", type: "uint256" },
      { name: "maxCycles", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "signature", type: "bytes" },
      { name: "buyerData", type: "string" },
    ],
    outputs: [],
  },
] as const;

async function runRelayer() {
  if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in the environment.");
    process.exit(1);
  }

  console.log("--------------------------------------------------");
  console.log(`[AutoPay Relayer] Starting run at ${new Date().toISOString()}`);
  console.log("Connecting to MongoDB...");
  const mongoClient = await MongoClient.connect(MONGODB_URI);
  const db = mongoClient.db(MONGODB_DB);

  try {
    const nowInSeconds = Math.floor(Date.now() / 1000);

    // 1. Fetch enabled AutoPay pre-authorizations that are due for renewal
    const dueSettings = await db
      .collection("autopay_settings")
      .find({
        enabled: true,
        currentExpiresAt: { $lte: nowInSeconds },
        $expr: { $lt: ["$executedCycles", "$maxCycles"] },
      })
      .toArray();

    console.log(`Found ${dueSettings.length} due subscription(s) for renewal.`);

    if (dueSettings.length === 0) {
      console.log("No work to be done. Exiting.");
      await mongoClient.close();
      return;
    }

    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: http(ARC_RPC_URL),
    });

    for (const setting of dueSettings) {
      const logPrefix = `[Subscriber: ${setting.subscriberAddress}][Plan: ${setting.planId}]`;
      console.log(`\n${logPrefix} Processing renewal...`);

      try {
        if (!setting.sessionPrivateKey) {
          throw new Error("Missing sessionPrivateKey in database record.");
        }

        // 2. Initialize Session Key Wallet
        const account = privateKeyToAccount(setting.sessionPrivateKey as `0x${string}`);
        const walletClient = createWalletClient({
          account,
          chain: arcTestnet,
          transport: http(ARC_RPC_URL),
        });

        // 3. Query Plan & Pricing Tier on-chain
        console.log(`${logPrefix} Querying plan details from contract...`);
        const plan = await publicClient.readContract({
          address: SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`,
          abi: gatewayAbi,
          functionName: "plans",
          args: [setting.planId as `0x${string}`],
        });

        const [seller, duration, ipfsHash, planActive, tierCount] = plan;

        if (!planActive) {
          throw new Error("Target plan has been deactivated by the seller.");
        }

        const tier = await publicClient.readContract({
          address: SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`,
          abi: gatewayAbi,
          functionName: "getTier",
          args: [setting.planId as `0x${string}`, BigInt(setting.tierId)],
        });

        const [price, label, tierActive] = tier;

        if (!tierActive) {
          throw new Error("Target pricing tier has been deactivated by the seller.");
        }

        // 4. Pre-flight Balance and Allowance Checks
        console.log(`${logPrefix} Verifying subscriber USDC balance & gateway allowance...`);
        const balance = await publicClient.readContract({
          address: ARC_USDC_ADDRESS as `0x${string}`,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [setting.subscriberAddress as `0x${string}`],
        });

        if (balance < price) {
          throw new Error(`Insufficient subscriber USDC balance. Required: ${price.toString()}, Current: ${balance.toString()}`);
        }

        const allowance = await publicClient.readContract({
          address: ARC_USDC_ADDRESS as `0x${string}`,
          abi: erc20Abi,
          functionName: "allowance",
          args: [setting.subscriberAddress as `0x${string}`, SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`],
        });

        if (allowance < price) {
          throw new Error(`Insufficient gateway contract USDC spending allowance. Required: ${price.toString()}, Current: ${allowance.toString()}`);
        }

        // 5. Submit Transaction
        console.log(`${logPrefix} Executing subscribeWithSignature transaction on Arc Testnet...`);
        const hash = await walletClient.writeContract({
          address: SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`,
          abi: gatewayAbi,
          functionName: "subscribeWithSignature",
          args: [
            setting.subscriberAddress as `0x${string}`,
            setting.sessionPublicKey as `0x${string}`,
            setting.planId as `0x${string}`,
            BigInt(setting.tierId),
            BigInt(setting.maxCycles),
            BigInt(setting.deadline),
            setting.signature as `0x${string}`,
            setting.buyerData || "",
          ],
        });

        console.log(`${logPrefix} Broadcast successful. Transaction Hash: ${hash}. Waiting for receipt...`);
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status !== "success") {
          throw new Error("Transaction execution reverted on-chain.");
        }

        // 6. Update database on successful execution
        const nextExpiresAt = nowInSeconds + duration;
        const newExecutedCycles = (setting.executedCycles || 0) + 1;
        const isCompleted = newExecutedCycles >= setting.maxCycles;

        await db.collection("autopay_settings").updateOne(
          { _id: setting._id },
          {
            $set: {
              executedCycles: newExecutedCycles,
              currentExpiresAt: nextExpiresAt,
              enabled: !isCompleted, // Disable if max cycles fully reached
              lastTxHash: hash,
              updatedAt: new Date(),
            },
          }
        );

        console.log(`${logPrefix} SUCCESS! Renewed successfully. Executed Cycles: ${newExecutedCycles}/${setting.maxCycles}. New Expiration: ${nextExpiresAt}`);
      } catch (err) {
        console.error(`${logPrefix} FAILED:`, err instanceof Error ? err.message : String(err));
      }
    }
  } catch (err) {
    console.error("Relayer execution encountered a fatal error:", err);
  } finally {
    await mongoClient.close();
    console.log("\n[AutoPay Relayer] Run finished. Database connection closed.");
    console.log("--------------------------------------------------");
  }
}

// Run the relayer
runRelayer().catch((error) => {
  console.error("Unhandled relayer error:", error);
  process.exit(1);
});
