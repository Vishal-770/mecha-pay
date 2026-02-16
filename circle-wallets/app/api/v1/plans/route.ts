import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { querySubgraph, toLowerHex } from "@/lib/subgraph";

const sellerPlansQuery = `
  query SellerPlans($seller: Bytes!, $first: Int!, $skip: Int!) {
    plans(
      where: { seller_: { id: $seller } }
      first: $first
      skip: $skip
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      price
      duration
      ipfsHash
      active
      subscriptionCount
      totalGrossVolume
      totalFeesCollected
      lastSubscriptionAt
    }
  }
`;

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json({ error: "x-api-key header is required" }, { status: 400 });
    }

    try {
      const { userId, merchantAddress } = await validateApiKey(apiKey);
      
      if (!merchantAddress) {
        return NextResponse.json({ 
          error: "Merchant address not found for this API key. please create a new key while having an active wallet in the dashboard." 
        }, { status: 400 });
      }

      const sellerId = toLowerHex(merchantAddress);

      const first = Math.min(Number(req.nextUrl.searchParams.get("first") ?? "100"), 200);
      const skip = Math.max(Number(req.nextUrl.searchParams.get("skip") ?? "0"), 0);

      const data = await querySubgraph<{ plans: any[] }>(sellerPlansQuery, {
        seller: sellerId,
        first,
        skip
      });

      return NextResponse.json({
        planIds: (data.plans ?? []).map(p => p.id)
      });
    } catch (authError) {
      return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 });
    }
  } catch (err) {
    console.error("[GET /api/v1/plans]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
