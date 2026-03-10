import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { corsResponse, handleCorsPreFlight } from "@/lib/cors";

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
      // 1. Validate API Key and resolve identity
      const { merchantAddress } = await validateApiKey(apiKey);
      
      if (!merchantAddress) {
        return corsResponse({ 
          error: "Merchant address not found. Please ensure your active wallet is connected when generating keys." 
        }, { status: 400 });
      }

      // 2. Return the wallet address as requested
      return corsResponse({
        walletAddress: merchantAddress
      });

    } catch (authError) {
      return corsResponse({ error: "Invalid or revoked API key" }, { status: 401 });
    }
  } catch (err) {
    console.error("[GET /api/v1/me]", err);
    return corsResponse({ error: "Internal Server Error" }, { status: 500 });
  }
}
