import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { createPublicClient, http, formatUnits } from "viem";
import { arcTestnet } from "@/lib/privy_config";
import { corsResponse, handleCorsPreFlight } from "@/lib/cors";

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
] as const;

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreFlight();
}

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return corsResponse({ error: "x-api-key header is required" }, { status: 400 });
    }

    try {
      // 1. Validate API Key and resolve merchant identity
      const { merchantAddress } = await validateApiKey(apiKey);
      
      if (!merchantAddress) {
        return corsResponse({ 
          error: "Merchant address not found. Please ensure your active wallet is connected when generating keys." 
        }, { status: 400 });
      }

      // 2. Query On-chain Balance via Viem
      const client = createPublicClient({
        chain: arcTestnet,
        transport: http()
      });

      const balance = await client.readContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [merchantAddress as `0x${string}`]
      });

      // 3. Format and return
      return corsResponse({
        walletAddress: merchantAddress,
        balance: formatUnits(balance, 6),
        rawBalance: balance.toString(),
        symbol: "USDC",
        chainId: arcTestnet.id
      });

    } catch (authError) {
      return corsResponse({ error: "Invalid or revoked API key" }, { status: 401 });
    }
  } catch (err) {
    console.error("[GET /api/v1/balance]", err);
    return corsResponse({ error: "Internal Server Error" }, { status: 500 });
  }
}
