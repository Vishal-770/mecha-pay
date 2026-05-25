import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { querySubgraph, toLowerHex } from "@/lib/subgraph";

interface PlanAnalytics {
  id: string;
  seller: { id: string };
  duration: string;
  active: boolean;
  subscriptionCount: number;
  totalGrossVolume: string;
  totalFeesCollected: string;
  lastSubscriptionAt: string | null;
  createdAt: string;
  updatedAt: string;
  tiers: {
    tierId: string;
    price: string;
    label: string;
    active: boolean;
  }[];
}

const planQuery = `
  query PlanAnalytics($id: ID!) {
    plan(id: $id) {
      id
      seller { id }
      duration
      active
      subscriptionCount
      totalGrossVolume
      totalFeesCollected
      lastSubscriptionAt
      createdAt
      updatedAt
      tiers {
        tierId
        price
        label
        active
      }
    }
  }
`;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json({ error: "Missing x-api-key header" }, { status: 401 });
    }

    const { merchantAddress } = await validateApiKey(apiKey);

    if (!merchantAddress) {
      return NextResponse.json({ error: "No wallet address associated with this key" }, { status: 404 });
    }

    const seller = toLowerHex(merchantAddress);
    const planId = toLowerHex(id);

    const data = await querySubgraph<{ plan: PlanAnalytics | null }>(planQuery, {
      id: planId,
    });

    const plan = data.plan;

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (plan.seller.id.toLowerCase() !== seller) {
      return NextResponse.json({ error: "Forbidden: You do not own this plan" }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true,
      analytics: {
        planId: plan.id,
        active: plan.active,
        subscriptionCount: plan.subscriptionCount,
        totalGrossVolume: plan.totalGrossVolume,
        totalFeesCollected: plan.totalFeesCollected,
        netRevenue: (BigInt(plan.totalGrossVolume) - BigInt(plan.totalFeesCollected)).toString(),
        lastSubscriptionAt: plan.lastSubscriptionAt,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
        tiers: plan.tiers,
      }
    });
  } catch (err: unknown) {
    console.error("[GET /api/v1/plans/[id]/analytics]", err);
    const message = err instanceof Error ? err.message : "";
    if (message === "Invalid or revoked API key") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
