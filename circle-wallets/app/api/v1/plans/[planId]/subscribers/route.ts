import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { querySubgraph, toLowerHex, toSecondsNow, toNumber } from "@/lib/subgraph";

const subscribersQuery = `
  query PlanSubscribers($planId: Bytes!, $first: Int!, $skip: Int!) {
    subscriptionStates(
      where: { plan_: { id: $planId } }
      first: $first
      skip: $skip
      orderBy: updatedAt
      orderDirection: desc
    ) {
      id
      status
      subscriptionCount
      totalSpent
      lastStartTime
      lastEndTime
      lastBuyerData
      updatedAt
      subscriber {
        id
      }
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
    const { searchParams } = new URL(req.url);
    const first = Math.min(Number(searchParams.get("first") ?? "100"), 500);
    const skip = Math.max(Number(searchParams.get("skip") ?? "0"), 0);

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
      const data = await querySubgraph<{ subscriptionStates: any[] }>(subscribersQuery, {
        planId: toLowerHex(planId),
        first,
        skip
      });

      const now = toSecondsNow();

      // 3. Format Response as requested: "every info about the subscriber"
      const subscribers = data.subscriptionStates.map((entry) => {
        const lastEndTime = toNumber(entry.lastEndTime);
        const remainingSeconds = Math.max(lastEndTime - now, 0);
        const isActive = remainingSeconds > 0 && entry.status === "ACTIVE";

        return {
          address: entry.subscriber.id,
          status: isActive ? "ACTIVE" : "EXPIRED",
          totalSpent: entry.totalSpent,
          subscriptionCount: entry.subscriptionCount,
          startTime: entry.lastStartTime, // Subscribed date (most recent)
          endTime: entry.lastEndTime,
          metadata: entry.lastBuyerData, // Extra info provided during checkout
          updatedAt: entry.updatedAt
        };
      });

      return NextResponse.json({
        planId: toLowerHex(planId),
        subscribers,
        count: subscribers.length
      });

    } catch (authError) {
      return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 });
    }
  } catch (err) {
    console.error("[GET /api/v1/plans/[planId]/subscribers]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
