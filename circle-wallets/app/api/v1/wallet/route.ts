import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json({ error: "Missing x-api-key header" }, { status: 401 });
    }

    const { merchantAddress } = await validateApiKey(apiKey);

    if (!merchantAddress) {
      return NextResponse.json({ error: "No wallet address associated with this key" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      walletAddress: merchantAddress 
    });
  } catch (err: unknown) {
    console.error("[GET /api/v1/wallet]", err);
    const message = err instanceof Error ? err.message : "";
    if (message === "Invalid or revoked API key") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
