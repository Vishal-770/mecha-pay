"use server";

import { BridgeKit } from "@circle-fin/bridge-kit";
import { ArcTestnet, BaseSepolia, EthereumSepolia, ArbitrumSepolia } from "@circle-fin/bridge-kit/chains";
// import { CCTPV2BridgingProvider } from "@circle-fin/provider-cctp-v2";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";

const chainMap: Record<string, any> = {
  "Arc_Testnet": ArcTestnet,
  "Base_Sepolia": BaseSepolia,
  "Ethereum_Sepolia": EthereumSepolia,
  "Arbitrum_Sepolia": ArbitrumSepolia,
};

/**
 * Fetches the developer wallet details for Arc Testnet to provide better error messages.
 */
async function getDeveloperWalletDetails(apiKey: string): Promise<{ address: string; balance: string } | null> {
  try {
    const baseUrl = "https://api-sandbox.circle.com"; 
    const url = new URL(`${baseUrl}/v1/w3s/wallets`);
    url.searchParams.append("custodyType", "DEVELOPER");

    const response = await fetch(url.toString(), {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log("[Server] Raw Wallets Response:", JSON.stringify(data, null, 2));
    
    // Some Circle accounts use "ARC" and some "ARC-TESTNET"
    const wallets = data.data?.wallets || [];
    const arcWallet = wallets.find((w: any) => 
      w.blockchain === "ARC-TESTNET" || w.blockchain === "ARC"
    );
    
    if (!arcWallet) return null;

    // Fetch balance
    const balanceResponse = await fetch(`${baseUrl}/v1/w3s/wallets/${arcWallet.id}/balances`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    const balanceData = await balanceResponse.json();
    const usdcBalance = balanceData.data?.tokenBalances?.find((b: any) => b.token.symbol === "USDC");

    return {
      address: arcWallet.address,
      balance: usdcBalance?.amount || "0.00",
    };
  } catch (err) {
    console.error("[Server] Failed to fetch developer wallet details:", err);
    return null;
  }
}

/**
 * Completes a CCTP bridge operation on the server side.
 */
export async function completeBridgeOnCircle(params: {
  burnTxHash: string;
  sourceChain: string;
  destinationAddress: string;
  amount: string;
}) {
  const { burnTxHash, sourceChain, destinationAddress, amount } = params;
  console.log(`[Server] Completing bridge for burnTxHash: ${burnTxHash} on ${sourceChain}`);

  try {
    const apiKey = process.env.CIRCLE_API_KEY!;
    const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

    // Check developer wallet details first
    const details = await getDeveloperWalletDetails(apiKey);
    console.log(`[Server] Developer Wallet: ${details?.address}, Balance: ${details?.balance} USDC`);

    if (!details) {
      throw new Error("No Developer-Controlled Wallet found for your API key. To complete the bridge on the server, you MUST have a developer wallet with USDC (native gas) on the Arc Testnet. Please create one in the Circle Console.");
    }

    if (parseFloat(details.balance) < 0.05) {
       throw new Error(`Your Developer-Controlled Wallet (${details.address}) has insufficient funds (Balance: ${details.balance} USDC). On Arc Testnet, USDC is used for gas. Please add at least 0.10 USDC to your developer wallet to complete the bridge.`);
    }

    if (!entitySecret) {
      throw new Error("CIRCLE_ENTITY_SECRET is not defined in your environment variables. Please add it to your .env.local file.");
    }

    // Initialize kit. BridgeKit 1.7.0 includes CCTPV2BridgingProvider by default.
    const kit = new BridgeKit();

    const adapter = createCircleWalletsAdapter({
      apiKey: apiKey,
      entitySecret: entitySecret,
    });

    const sourceChainDef = chainMap[sourceChain] || EthereumSepolia;
    const destChainDef = ArcTestnet;

    const partialResult: any = {
      amount,
      token: "USDC",
      state: "error",
      provider: "CCTPV2BridgingProvider",
      source: { address: "0x0", chain: sourceChainDef },
      destination: {
        address: destinationAddress,
        chain: destChainDef,
        recipientAddress: destinationAddress,
      },
      steps: [
        { name: "approve", state: "success" },
        { name: "burn", state: "success", txHash: burnTxHash },
        { name: "fetchAttestation", state: "pending" },
      ],
      invocationMeta: {
        from: "server",
        timestamp: Date.now(),
      }
    };

    console.log("[Server] Resuming bridge operation...");
    const result = await kit.retry(partialResult, { from: adapter, to: adapter });

    if (result.state === "success") {
      console.log("[Server] Bridge completed successfully!");
      return {
        success: true,
        txHash: result.steps.find((s: any) => s.name === "mint")?.txHash,
      };
    } else {
      const errorStep = result.steps.find((s: any) => s.state === "error");
      const errorMessage = errorStep?.errorMessage || "Bridge failed after retry";
      
      console.error(`[Server] Bridge failed at step: ${errorStep?.name}`, errorMessage);

      if (errorMessage.toLowerCase().includes("gas") || errorMessage.toLowerCase().includes("funds")) {
        return {
          success: false,
          error: `${errorMessage}. Note: On Arc Testnet, USDC is the native gas token. Your DEVELOPER WALLET (${details?.address || "associated with your API key"}) currently has ${details?.balance || "0.00"} USDC.`,
        };
      }

      return { success: false, error: errorMessage };
    }
  } catch (error: any) {
    console.error("[Server] Critical error in completeBridgeOnCircle:", error);
    let errorMessage = error.message || "An unexpected error occurred on the server";
    
    // Helpfully suggest adding the entity secret if that's the issue
    if (errorMessage.includes("entitySecret")) {
       errorMessage = "CIRCLE_ENTITY_SECRET is missing or invalid. Please ensure it is set in your server-side environment (.env.local).";
    }

    if (errorMessage.toLowerCase().includes("gas") || errorMessage.toLowerCase().includes("funds")) {
      const details = await getDeveloperWalletDetails(process.env.CIRCLE_API_KEY!);
      errorMessage = `${errorMessage}. On Arc Testnet, USDC is the native gas token. Your DEVELOPER WALLET (${details?.address || "associated with your API key"}) currently has ${details?.balance || "0.00"} USDC.`;
    }

    return { success: false, error: errorMessage };
  }
}
