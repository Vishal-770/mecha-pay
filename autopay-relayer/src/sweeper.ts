import { createPublicClient, createWalletClient, http, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getDb } from "./db.js";
import { AutoPaySetting } from "./types.js";
import {
  arcTestnet,
  ARC_RPC_URL,
  SUBSCRIPTION_GATEWAY_ADDRESS,
  ARC_USDC_ADDRESS
} from "./config.js";

// ERC-20 standard ABI snippet for checking USDC balance/allowance
export const erc20Abi = [
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
export const gatewayAbi = [
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

// Core Relayer sweep logic
export async function runAutoPaySweep() {
  console.log(`[Sweep] Commencing AutoPay renewal scan at ${new Date().toISOString()}...`);
  
  try {
    const db = await getDb();
    const nowInSeconds = Math.floor(Date.now() / 1000);

    // Fetch enabled pre-authorizations where cycle expiration has passed
    const dueSettings = await db
      .collection<AutoPaySetting>("autopay_settings")
      .find({
        enabled: true,
        currentExpiresAt: { $lte: nowInSeconds },
        $expr: { $lt: ["$executedCycles", "$maxCycles"] },
      })
      .toArray();

    console.log(`[Sweep] Found ${dueSettings.length} due subscription(s) for renewal.`);

    if (dueSettings.length === 0) {
      return { executed: 0, results: [] };
    }

    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: http(ARC_RPC_URL),
    });

    const sweepResults = [];

    for (const setting of dueSettings) {
      const logPrefix = `[Sweep][Subscriber: ${setting.subscriberAddress}][Plan: ${setting.planId}]`;
      console.log(`${logPrefix} Sweeping subscription...`);

      try {
        if (!setting.sessionPrivateKey) {
          throw new Error("Missing sessionPrivateKey in database record.");
        }

        // Initialize Session Key account and wallet client
        const account = privateKeyToAccount(setting.sessionPrivateKey as Hex);
        const walletClient = createWalletClient({
          account,
          chain: arcTestnet,
          transport: http(ARC_RPC_URL),
        });

        // 1. Fetch Plan details from smart contract
        console.log(`${logPrefix} Querying plan details from contract...`);
        const plan = await publicClient.readContract({
          address: SUBSCRIPTION_GATEWAY_ADDRESS,
          abi: gatewayAbi,
          functionName: "plans",
          args: [setting.planId as Hex],
        });

        const [seller, duration, ipfsHash, planActive, tierCount] = plan;

        if (!planActive) {
          throw new Error("Plan has been deactivated on-chain.");
        }

        // 2. Fetch Pricing Tier details
        const tier = await publicClient.readContract({
          address: SUBSCRIPTION_GATEWAY_ADDRESS,
          abi: gatewayAbi,
          functionName: "getTier",
          args: [setting.planId as Hex, BigInt(setting.tierId)],
        });

        const [price, label, tierActive] = tier;

        if (!tierActive) {
          throw new Error("Pricing tier has been deactivated on-chain.");
        }

        // 3. Verify balance and allowance
        const balance = await publicClient.readContract({
          address: ARC_USDC_ADDRESS,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [setting.subscriberAddress as Hex],
        });

        if (balance < price) {
          throw new Error(`Insufficient balance. Required: ${price}, Current: ${balance}`);
        }

        const allowance = await publicClient.readContract({
          address: ARC_USDC_ADDRESS,
          abi: erc20Abi,
          functionName: "allowance",
          args: [setting.subscriberAddress as Hex, SUBSCRIPTION_GATEWAY_ADDRESS],
        });

        if (allowance < price) {
          throw new Error(`Insufficient allowance. Required: ${price}, Current: ${allowance}`);
        }

        console.log(`${logPrefix} Security pre-flights passed. Broadcasting transaction...`);

        // 4. Submit contract transaction on-chain
        const hash = await walletClient.writeContract({
          address: SUBSCRIPTION_GATEWAY_ADDRESS,
          abi: gatewayAbi,
          functionName: "subscribeWithSignature",
          args: [
            setting.subscriberAddress as Hex,
            setting.sessionPublicKey as Hex,
            setting.planId as Hex,
            BigInt(setting.tierId),
            BigInt(setting.maxCycles),
            BigInt(setting.deadline),
            setting.signature as Hex,
            setting.buyerData || "",
          ],
        });

        console.log(`${logPrefix} Broadcast successful. Transaction Hash: ${hash}. Waiting for block receipt...`);
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status !== "success") {
          throw new Error("Transaction execution reverted on-chain.");
        }

        // 5. Update Database Record
        const nextExpiresAt = nowInSeconds + duration;
        const newExecutedCycles = (setting.executedCycles || 0) + 1;
        const isCompleted = newExecutedCycles >= setting.maxCycles;

        await db.collection("autopay_settings").updateOne(
          { _id: setting._id },
          {
            $set: {
              executedCycles: newExecutedCycles,
              currentExpiresAt: nextExpiresAt,
              enabled: !isCompleted,
              lastTxHash: hash,
              updatedAt: new Date(),
            },
          }
        );

        console.log(`${logPrefix} RENEWAL SUCCESS! New Expiry: ${nextExpiresAt}. Cycles: ${newExecutedCycles}/${setting.maxCycles}`);

        sweepResults.push({
          subscriberAddress: setting.subscriberAddress,
          planId: setting.planId,
          success: true,
          txHash: hash,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`${logPrefix} Sweep failed:`, errorMsg);
        
        sweepResults.push({
          subscriberAddress: setting.subscriberAddress,
          planId: setting.planId,
          success: false,
          error: errorMsg,
        });
      }
    }

    return { executed: dueSettings.length, results: sweepResults };
  } catch (err) {
    console.error("[Sweep] Sweeper failed:", err);
    throw err;
  }
}
