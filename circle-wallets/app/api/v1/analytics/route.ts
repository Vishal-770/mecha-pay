import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { querySubgraph, toLowerHex } from "@/lib/subgraph";

interface SellerAnalytics {
  id: string;
  planCount: number;
  activePlanCount: number;
  subscriptionCount: number;
  totalGrossRevenue: string;
  totalNetRevenue: string;
  totalFeeContributed: string;
}

const sellerQuery = `
  query SellerMetrics($id: Bytes!) {
    seller(id: $id) {
      id
      planCount
      activePlanCount
      subscriptionCount
      totalGrossRevenue
      totalNetRevenue
      totalFeeContributed
    }
  }
`;

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

    const sellerId = toLowerHex(merchantAddress);

    const data = await querySubgraph<{ seller: SellerAnalytics | null }>(sellerQuery, {
      id: sellerId,
    });

    const seller = data.seller;

    if (!seller) {
      // If the seller has not created any plans or subscriptions yet, the subgraph might return null.
      return NextResponse.json({
        success: true,
        analytics: {
          sellerId,
          planCount: 0,
          activePlanCount: 0,
          subscriptionCount: 0,
          totalGrossRevenue: "0",
          totalNetRevenue: "0",
          totalFeeContributed: "0",
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      analytics: {
        sellerId: seller.id,
        planCount: seller.planCount,
        activePlanCount: seller.activePlanCount,
        subscriptionCount: seller.subscriptionCount,
        totalGrossRevenue: seller.totalGrossRevenue,
        totalNetRevenue: seller.totalNetRevenue,
        totalFeeContributed: seller.totalFeeContributed,
      }
    });
  } catch (err: unknown) {
    console.error("[GET /api/v1/analytics]", err);
    const message = err instanceof Error ? err.message : "";
    if (message === "Invalid or revoked API key") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
