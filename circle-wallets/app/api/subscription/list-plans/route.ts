import { NextResponse } from "next/server";
import { ipfsHashToHttpUrl } from "@/lib/subscription";
import { querySubgraph } from "@/lib/subgraph";

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
  duration: string;
  ipfsHash: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  subscriptionCount: number;
  totalGrossVolume: string;
  totalFeesCollected: string;
  lastSubscriptionAt: string | null;
  tiers: {
    tierId: string;
    price: string;
    label: string;
    active: boolean;
  }[];
}

const query = `
  query LatestPlans($first: Int!, $skip: Int!) {
    plans(first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
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
      tiers {
        tierId
        price
        label
        active
      }
    }
  }
`;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const first = Math.min(Number(searchParams.get("first") ?? "50"), 100);
    const skip = Math.max(Number(searchParams.get("skip") ?? "0"), 0);

    const data = await querySubgraph<{ plans: SubgraphPlan[] }>(query, {
      first,
      skip,
    });

    const plans = data.plans ?? [];

    const hydratedPlans = await Promise.all(
      plans.map(async (plan) => {
        try {
          const metadataRes = await fetch(ipfsHashToHttpUrl(plan.ipfsHash), {
            cache: "no-store",
          });
          const metadata = metadataRes.ok ? await metadataRes.json() : null;

          return {
            ...plan,
            planId: plan.id,
            metadata,
          };
        } catch {
          return {
            ...plan,
            planId: plan.id,
            metadata: null,
          };
        }
      }),
    );

    return NextResponse.json({
      plans: hydratedPlans,
      pagination: { first, skip },
    });
  } catch (err) {
    console.error("[/api/subscription/list-plans]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
