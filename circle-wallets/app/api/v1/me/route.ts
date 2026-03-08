import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json({ error: "x-api-key header is required" }, { status: 400 });
    }

    try {
      // 1. Validate API Key and resolve identity
      const { merchantAddress } = await validateApiKey(apiKey);
      
      if (!merchantAddress) {
        return NextResponse.json({ 
          error: "Merchant address not found. Please ensure your active wallet is connected when generating keys." 
        }, { status: 400 });
      }

      // 2. Return the wallet address as requested
      return NextResponse.json({
        walletAddress: merchantAddress
      });

    } catch (authError) {
      return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 });
    }
  } catch (err) {
    console.error("[GET /api/v1/me]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
