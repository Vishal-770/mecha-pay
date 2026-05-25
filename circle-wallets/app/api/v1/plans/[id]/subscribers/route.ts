import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { querySubgraph, toLowerHex } from "@/lib/subgraph";

interface SubscriptionState {
  id: string;
  subscriber: { id: string };
  status: string;
  lastEndTime: string;
  totalSpent: string;
  lastBuyerData: string;
}

interface PlanCheck {
  id: string;
  seller: { id: string };
}

const planCheckQuery = `
  query CheckPlanOwner($id: ID!) {
    plan(id: $id) {
      id
      seller { id }
    }
  }
`;

const planSubscribersQuery = `
  query PlanSubscribers($planId: String!) {
    subscriptionStates(where: { plan: $planId }, orderBy: lastEndTime, orderDirection: desc) {
      id
      subscriber { id }
      status
      lastEndTime
      totalSpent
      lastBuyerData
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

    // 1. Verify that the merchant owns this plan
    const checkData = await querySubgraph<{ plan: PlanCheck | null }>(planCheckQuery, {
      id: planId,
    });

    if (!checkData.plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (checkData.plan.seller.id.toLowerCase() !== seller) {
      return NextResponse.json({ error: "Forbidden: You do not own this plan" }, { status: 403 });
    }

    // 2. Fetch all subscribers for this plan
    const data = await querySubgraph<{ subscriptionStates: SubscriptionState[] }>(planSubscribersQuery, {
      planId: planId,
    });

    const subscribers = (data.subscriptionStates ?? []).map((state) => ({
      subscriptionId: state.id,
      buyerAddress: state.subscriber.id,
      buyerData: state.lastBuyerData, // Exposes the off-chain ID you pass into the smart contract
      status: state.status,
      lastEndTime: state.lastEndTime,
      totalSpent: state.totalSpent,
    }));

    return NextResponse.json({ 
      success: true,
      subscribers 
    });
  } catch (err: unknown) {
    console.error("[GET /api/v1/plans/[id]/subscribers]", err);
    const message = err instanceof Error ? err.message : "";
    if (message === "Invalid or revoked API key") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
