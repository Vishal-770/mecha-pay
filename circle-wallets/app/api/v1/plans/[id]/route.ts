import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { querySubgraph, toLowerHex } from "@/lib/subgraph";
import { ipfsHashToHttpUrl } from "@/lib/subscription";

interface PlanMetadataResponse {
  id: string;
  seller: { id: string };
  ipfsHash: string;
}

const planQuery = `
  query PlanMetadata($id: ID!) {
    plan(id: $id) {
      id
      seller { id }
      ipfsHash
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

    const data = await querySubgraph<{ plan: PlanMetadataResponse | null }>(planQuery, {
      id: planId,
    });

    const plan = data.plan;

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (plan.seller.id.toLowerCase() !== seller) {
      return NextResponse.json({ error: "Forbidden: You do not own this plan" }, { status: 403 });
    }

    let metadata = null;
    try {
      const metadataRes = await fetch(ipfsHashToHttpUrl(plan.ipfsHash), {
        cache: "no-store",
      });
      metadata = metadataRes.ok ? await metadataRes.json() : null;
    } catch {
      metadata = null;
    }

    return NextResponse.json({ 
      success: true,
      planId: plan.id,
      metadata
    });
  } catch (err: unknown) {
    console.error("[GET /api/v1/plans/[id]]", err);
    const message = err instanceof Error ? err.message : "";
    if (message === "Invalid or revoked API key") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
