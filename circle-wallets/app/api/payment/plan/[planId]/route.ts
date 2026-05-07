import { NextResponse } from "next/server";
import { ipfsHashToHttpUrl } from "@/lib/subscription";
import { querySubgraph } from "@/lib/subgraph";

interface SubgraphTier {
  id: string;
  tierId: string;
  price: string;
  label: string;
  active: boolean;
}

interface SubgraphPlan {
  id: string;
  seller: {
    id: string;
    planCount: number;
    activePlanCount: number;
    subscriptionCount: number;
    totalGrossRevenue: string;
    totalNetRevenue: string;
    totalFeeContributed: string;
  };
  price: string;
  duration: string;
  ipfsHash: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  subscriptionCount: number;
  totalGrossVolume: string;
  totalFeesCollected: string;
  lastSubscriptionAt: string | null;
  tiers: SubgraphTier[];
}

const query = `
  query GetPlan($planId: ID!) {
    plan(id: $planId) {
      id
      seller {
        id
        planCount
        activePlanCount
        subscriptionCount
        totalGrossRevenue
        totalNetRevenue
        totalFeeContributed
      }
      duration
      ipfsHash
      active
      createdAt
      updatedAt
      subscriptionCount
      totalGrossVolume
      totalFeesCollected
      lastSubscriptionAt
      tiers(orderBy: tierId, orderDirection: asc) {
        id
        tierId
        price
        label
        active
      }
    }
  }
`;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Normalize planId to lowercase
    const normalizedPlanId = planId.toLowerCase();

    const data = await querySubgraph<{ plan: SubgraphPlan | null }>(query, {
      planId: normalizedPlanId,
    });

    if (!data.plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    const plan = data.plan;

    // Check if plan is active
    if (!plan.active) {
      return NextResponse.json(
        { error: "This plan is no longer active" },
        { status: 410 }
      );
    }

    // Fetch IPFS metadata
    let metadata = null;
    try {
      const metadataRes = await fetch(ipfsHashToHttpUrl(plan.ipfsHash), {
        cache: "no-store",
      });
      if (metadataRes.ok) {
        metadata = await metadataRes.json();
      }
    } catch (err) {
      console.error("[/api/payment/plan] Failed to fetch IPFS metadata:", err);
    }

    return NextResponse.json({
      plan: {
        ...plan,
        planId: plan.id,
        metadata,
      },
    });
  } catch (err) {
    console.error("[/api/payment/plan]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
