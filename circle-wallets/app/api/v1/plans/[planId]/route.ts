import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { querySubgraph, toLowerHex } from "@/lib/subgraph";
import { ipfsHashToHttpUrl } from "@/lib/subscription";

const planDetailQuery = `
  query PlanDetail($planId: ID!) {
    plan(id: $planId) {
      id
      price
      duration
      ipfsHash
      active
    }
  }
`;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json({ error: "x-api-key header is required" }, { status: 400 });
    }

    try {
      // 1. Validate API Key
      const { merchantAddress } = await validateApiKey(apiKey);
      
      if (!merchantAddress) {
        return NextResponse.json({ error: "Invalid merchant account mapping" }, { status: 400 });
      }

      // 2. Query Subgraph
      const data = await querySubgraph<{ plan: any | null }>(planDetailQuery, {
        planId: toLowerHex(planId)
      });

      if (!data.plan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
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

      // 4. Return minimal payload as requested
      return NextResponse.json({
        planId: data.plan.id,
        price: data.plan.price,
        duration: data.plan.duration,
        metadata: metadata
      });

    } catch (authError) {
      return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 });
    }
  } catch (err) {
    console.error("[GET /api/v1/plans/[planId]]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
