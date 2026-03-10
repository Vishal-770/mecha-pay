import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { querySubgraph, toLowerHex, toSecondsNow, toNumber } from "@/lib/subgraph";
import { ipfsHashToHttpUrl } from "@/lib/subscription";
import { corsResponse, handleCorsPreFlight } from "@/lib/cors";

const planDetailQuery = `
  query PlanDetail($planId: ID!) {
    plan(id: $planId) {
      id
      price
      duration
      ipfsHash
      active
    }
    subscriptionStates(
      where: { plan: $planId, status: ACTIVE }
      orderBy: lastEndTime
      orderDirection: desc
    ) {
      subscriber {
        id
      }
      lastEndTime
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

    if (!apiKey) {
      return corsResponse({ error: "x-api-key header is required" }, { status: 400 });
    }

    try {
      // 1. Validate API Key
      const { merchantAddress } = await validateApiKey(apiKey);
      
      if (!merchantAddress) {
        return corsResponse({ error: "Invalid merchant account mapping" }, { status: 400 });
      }

      // 2. Query Subgraph
      const data = await querySubgraph<{ plan: any | null, subscriptionStates: any[] }>(planDetailQuery, {
        planId: toLowerHex(planId)
      });

      if (!data.plan) {
        return corsResponse({ error: "Plan not found" }, { status: 404 });
      }

      // 3. Hydrate Metadata
      let metadata: any = null;
      try {
        const metadataRes = await fetch(ipfsHashToHttpUrl(data.plan.ipfsHash), { cache: "no-store" });
        if (metadataRes.ok) {
          metadata = await metadataRes.json();
        }
      } catch (e) {
        console.error("Failed to hydrate metadata", e);
      }

      const now = toSecondsNow();

      // 4. Format Output with "timing when it expires"
      return corsResponse({
        planId: data.plan.id,
        price: data.plan.price,
        duration: data.plan.duration,
        metadata: metadata,
        activeSubscribers: (data.subscriptionStates ?? []).map(sub => ({
          address: sub.subscriber.id,
          expiresAt: sub.lastEndTime,
          active: toNumber(sub.lastEndTime) > now
        }))
      });

    } catch (authError) {
      return corsResponse({ error: "Invalid or revoked API key" }, { status: 401 });
    }
  } catch (err) {
    console.error("[GET /api/v1/plans/[planId]]", err);
    return corsResponse({ error: "Internal Server Error" }, { status: 500 });
  }
}
