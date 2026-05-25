import { NextResponse } from "next/server";
import { ipfsHashToHttpUrl } from "@/lib/subscription";
import {
  querySubgraph,
  toLowerHex,
  toNumber,
  toSecondsNow,
} from "@/lib/subgraph";

type SubgraphPlanTier = {
  tierId: string;
  price: string;
  label: string;
  active: boolean;
};

type SubgraphPlan = {
  id: string;
  duration: string;
  ipfsHash: string;
  active: boolean;
  tiers: SubgraphPlanTier[];
  seller: { id: string };
};

type SubgraphSubscriptionState = {
  status: string;
  lastEndTime: string;
  lastTierId?: string | null;
};

type SubgraphSubscribed = {
  tierId: string;
  endTime: string;
};

type PlanMetadataTier = {
  label: string;
  features?: { title: string; description: string }[];
};

type PlanMetadata = {
  name?: string;
  brand?: { name?: string; website?: string };
  tiers?: PlanMetadataTier[];
};

/* ── CORS Configuration ── */
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

/* ── Queries ── */
const PLAN_QUERY = `
  query GetPlan($planId: ID!) {
    plan(id: $planId) {
      id
      duration
      ipfsHash
      active
      tiers(where: { active: true }) {
        tierId
        price
        label
        active
      }
      seller { id }
    }
  }
`;

const SUB_QUERY = `
  query SubscriptionsByUserId($planId: Bytes!, $userId: String!) {
    subscriptionStates(
      where: { plan_: { id: $planId }, lastBuyerData: $userId }
      first: 1
      orderBy: updatedAt
      orderDirection: desc
    ) {
      status
      lastEndTime
      lastTierId
    }
    subscribeds(
      where: { planId: $planId, buyerData: $userId }
    ) {
      tierId
      endTime
    }
  }
`;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  const { planId } = await params;
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const apiKey = req.headers.get("x-api-key");

  try {
    // 1. API Key Validation (Mock)
    // In production, you would verify this against your database
    if (!apiKey || (!apiKey.startsWith("mp_live_") && !apiKey.startsWith("mp_test_"))) {
      return NextResponse.json(
        { error: "Invalid or missing Mecha API Key", code: "UNAUTHORIZED" },
        { status: 401, headers: corsHeaders() }
      );
    }
    // 1. Fetch Plan Data
    const planData = await querySubgraph<{ plan: SubgraphPlan | null }>(PLAN_QUERY, {
      planId: toLowerHex(planId),
    });

    if (!planData.plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // 2. Fetch Plan Metadata
    let metadata: PlanMetadata | null = null;
    try {
      const res = await fetch(ipfsHashToHttpUrl(planData.plan.ipfsHash), {
        cache: "no-store",
      });
      metadata = res.ok ? ((await res.json()) as PlanMetadata) : null;
    } catch {
      metadata = null;
    }

    // 3. Optional: Check Subscription by userId
    let subscription = null;
    if (userId) {
      const subData = await querySubgraph<{
        subscriptionStates: SubgraphSubscriptionState[];
        subscribeds: SubgraphSubscribed[];
      }>(
        SUB_QUERY,
        {
          planId: toLowerHex(planId),
          userId,
        }
      );
      if (subData.subscriptionStates?.[0]) {
        const entry = subData.subscriptionStates[0];
        const lastEndTime = toNumber(entry.lastEndTime);
        const now = toSecondsNow();
        const remainingSeconds = Math.max(lastEndTime - now, 0);
        const isStateActive = remainingSeconds > 0 && entry.status === "ACTIVE";

        // Filter subscribeds to find all active tiers
        const activeSubs = (subData.subscribeds ?? []).filter(sub => toNumber(sub.endTime) >= now);
        const tierIds = Array.from(new Set(activeSubs.map(sub => sub.tierId)));

        // Ensure lastTierId is in the active list if state is active
        if (isStateActive && entry.lastTierId && !tierIds.includes(entry.lastTierId)) {
          tierIds.push(entry.lastTierId);
        }

        const isActive = isStateActive || tierIds.length > 0;

        subscription = {
          status: isActive ? "ACTIVE" : "EXPIRED",
          remainingSeconds,
          tierId: entry.lastTierId,
          tierIds,
        };
      }
    }

    return NextResponse.json(
      {
        plan: {
          id: planData.plan.id,
          name: metadata?.name || planData.plan.id,
          duration: planData.plan.duration,
          brand: metadata?.brand,
          tiers: planData.plan.tiers.map((tier) => {
            // Find corresponding feature list from metadata
            const mTier = metadata?.tiers?.find((mt) => mt.label === tier.label);
            return {
              id: tier.tierId,
              label: tier.label,
              price: tier.price,
              features: mTier?.features || [],
            };
          }),
        },
        subscription,
      },
      { headers: corsHeaders() }
    );
  } catch (err) {
    console.error("[SDK API ERROR]", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
