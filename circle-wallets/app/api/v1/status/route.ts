import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { querySubgraph, toLowerHex, toSecondsNow, toNumber } from "@/lib/subgraph";
import { corsResponse, handleCorsPreFlight } from "@/lib/cors";

/**
 * GET /api/v1/status
 * 
 * Check the subscription status for a specific buyer metadata string.
 * Requires x-api-key header for authentication.
 * 
 * Query Params:
 * - planId: The bytes32 ID of the subscription plan.
 * - buyer: The metadata string (buyerData) used during subscription.
 */

const subscriptionStatusQuery = `
  query SubscriptionStatus($planId: String!, $buyer: String!) {
    subscriptionStates(
      where: { 
        plan_: { id: $planId },
        lastBuyerData: $buyer
      }
    ) {
      status
      lastEndTime
      subscriber {
        id
      }
    }
  }
`;

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreFlight();
}

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get("planId");
    const buyer = searchParams.get("buyer");

    if (!apiKey) {
      return corsResponse({ error: "x-api-key header is required" }, { status: 400 });
    }

    if (!planId || !buyer) {
      return corsResponse({ error: "planId and buyer (metadata) are required" }, { status: 400 });
    }

    try {
      // 1. Validate API Key - Throws if invalid
      await validateApiKey(apiKey);
      
      // 2. Query Subgraph for the specific subscription state
      const data = await querySubgraph<{ subscriptionStates: any[] }>(subscriptionStatusQuery, {
        planId: toLowerHex(planId),
        buyer: buyer
      });

      const now = toSecondsNow();
      const state = data.subscriptionStates[0];

      // 3. Handle case where no subscription exists for this metadata/plan combo
      if (!state) {
        return corsResponse({
          active: false,
          status: "not purchased",
          buyer,
          planId: toLowerHex(planId)
        });
      }

      // 4. Calculate active status based on on-chain state and current time
      const lastEndTime = toNumber(state.lastEndTime);
      const remainingSeconds = Math.max(lastEndTime - now, 0);
      const isActive = remainingSeconds > 0 && state.status === "ACTIVE";

      // 5. If not active (expired or ended), return "not purchased" as requested
      if (!isActive) {
        return corsResponse({
          active: false,
          status: "not purchased",
          buyer,
          planId: toLowerHex(planId)
        });
      }

      // 6. Return active status with remaining time
      return corsResponse({
        active: true,
        status: "ACTIVE",
        buyer,
        planId: toLowerHex(planId),
        subscriber: state.subscriber.id,
        remainingTime: remainingSeconds
      });

    } catch (error) {
       const message = error instanceof Error ? error.message : "Authentication failed";
       if (message === "Invalid or revoked API key") {
         return corsResponse({ error: message }, { status: 401 });
       }
       throw error; // Re-throw for 500 handler
    }
  } catch (err) {
    console.error("[GET /api/v1/status]", err);
    return corsResponse({ error: "Internal Server Error" }, { status: 500 });
  }
}
