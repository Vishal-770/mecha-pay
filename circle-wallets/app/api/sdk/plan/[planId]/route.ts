import { NextResponse } from "next/server";
import { ipfsHashToHttpUrl } from "@/lib/subscription";
import {
  querySubgraph,
  toLowerHex,
  toNumber,
  toSecondsNow,
} from "@/lib/subgraph";

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
    const planData = await querySubgraph<{ plan: any }>(PLAN_QUERY, {
      planId: toLowerHex(planId),
    });

    if (!planData.plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // 2. Fetch Plan Metadata
    let metadata = null;
    try {
      const res = await fetch(ipfsHashToHttpUrl(planData.plan.ipfsHash), {
        cache: "no-store",
      });
      metadata = res.ok ? await res.json() : null;
    } catch {
      metadata = null;
    }

    // 3. Optional: Check Subscription by userId
    let subscription = null;
    if (userId) {
      const subData = await querySubgraph<{ subscriptionStates: any[] }>(
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
        const isActive = remainingSeconds > 0 && entry.status === "ACTIVE";

        subscription = {
          status: isActive ? "ACTIVE" : "EXPIRED",
          remainingSeconds,
          tierId: entry.lastTierId,
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
          tiers: planData.plan.tiers.map((t: any) => {
            // Find corresponding feature list from metadata
            const mTier = metadata?.tiers?.find((mt: any) => mt.label === t.label);
            return {
              id: t.tierId,
              label: t.label,
              price: t.price,
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
