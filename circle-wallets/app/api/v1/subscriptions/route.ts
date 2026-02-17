import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { querySubgraph, toLowerHex, toSecondsNow, toNumber } from "@/lib/subgraph";

const userSubscriptionsQuery = `
  query UserSubscriptions($subscriber: Bytes!, $first: Int!, $skip: Int!) {
    subscriptionStates(
      where: { subscriber_: { id: $subscriber } }
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

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");
    const { searchParams } = new URL(req.url);
    const subscriber = searchParams.get("subscriber");
    const first = Math.min(Number(searchParams.get("first") ?? "100"), 500);
    const skip = Math.max(Number(searchParams.get("skip") ?? "0"), 0);

    if (!apiKey) {
      return NextResponse.json({ error: "x-api-key header is required" }, { status: 400 });
    }

    if (!subscriber) {
      return NextResponse.json({ error: "subscriber address is required" }, { status: 400 });
    }

    try {
      // 1. Validate API Key
      await validateApiKey(apiKey);
      
      // 2. Query Subgraph
      const data = await querySubgraph<{ subscriptionStates: any[] }>(userSubscriptionsQuery, {
        subscriber: toLowerHex(subscriber),
        first,
        skip
      });

      const now = toSecondsNow();

      // 3. Format Response
      const subscriptions = data.subscriptionStates.map((entry) => {
        const lastEndTime = toNumber(entry.lastEndTime);
        const remainingSeconds = Math.max(lastEndTime - now, 0);
        const isActive = remainingSeconds > 0 && entry.status === "ACTIVE";

        return {
          planId: entry.plan.id,
          seller: entry.seller.id,
          status: isActive ? "ACTIVE" : "EXPIRED",
          startTime: entry.lastStartTime,
          endTime: entry.lastEndTime,
          remainingSeconds,
          totalSpent: entry.totalSpent,
          subscriptionCount: entry.subscriptionCount,
          updatedAt: entry.updatedAt
        };
      });

      return NextResponse.json({
        subscriber: toLowerHex(subscriber),
        subscriptions,
        count: subscriptions.length
      });

    } catch (authError) {
      return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 });
    }
  } catch (err) {
    console.error("[GET /api/v1/subscriptions]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
