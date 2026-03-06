import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { querySubgraph, toLowerHex, toSecondsNow, toNumber } from "@/lib/subgraph";
import { corsResponse, handleCorsPreFlight } from "@/lib/cors";

const subscriptionDetailQuery = `
  query SubscriptionDetail($subscriber: Bytes!, $planId: Bytes!) {
    subscriptionStates(
      where: { subscriber_: { id: $subscriber }, plan_: { id: $planId } }
      first: 1
    ) {
      id
      status
      subscriptionCount
      totalSpent
      lastStartTime
      lastEndTime
      updatedAt
      plan {
        id
        price
        duration
        ipfsHash
      }
      seller {
        id
      }
    }
  }
`;

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreFlight();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const apiKey = req.headers.get("x-api-key");
    const { searchParams } = new URL(req.url);
    const subscriber = searchParams.get("subscriber");

    if (!apiKey) {
      return corsResponse({ error: "x-api-key header is required" }, { status: 400 });
    }

    if (!subscriber) {
      return corsResponse({ error: "subscriber address is required" }, { status: 400 });
    }

    try {
      // 1. Validate API Key
      await validateApiKey(apiKey);
      
      // 2. Query Subgraph
      const data = await querySubgraph<{ subscriptionStates: any[] }>(subscriptionDetailQuery, {
        subscriber: toLowerHex(subscriber),
        planId: toLowerHex(planId)
      });

      if (!data.subscriptionStates || data.subscriptionStates.length === 0) {
        return corsResponse({ 
          subscriber: toLowerHex(subscriber),
          planId: toLowerHex(planId),
          status: "NONE",
          active: false 
        });
      }

      const entry = data.subscriptionStates[0];
      const now = toSecondsNow();
      const lastEndTime = toNumber(entry.lastEndTime);
      const remainingSeconds = Math.max(lastEndTime - now, 0);
      const isActive = remainingSeconds > 0 && entry.status === "ACTIVE";

      // 3. Return detailed state
      return corsResponse({
        subscriber: toLowerHex(subscriber),
        planId: entry.plan.id,
        seller: entry.seller.id,
        active: isActive,
        status: isActive ? "ACTIVE" : "EXPIRED",
        startTime: entry.lastStartTime,
        endTime: entry.lastEndTime,
        remainingSeconds,
        totalSpent: entry.totalSpent,
        subscriptionCount: entry.subscriptionCount,
        updatedAt: entry.updatedAt
      });

    } catch (authError) {
      return corsResponse({ error: "Invalid or revoked API key" }, { status: 401 });
    }
  } catch (err) {
    console.error("[GET /api/v1/subscriptions/[planId]]", err);
    return corsResponse({ error: "Internal Server Error" }, { status: 500 });
  }
}
