import { NextResponse } from "next/server";
import { querySubgraph, toLowerHex } from "@/lib/subgraph";
import { ipfsHashToHttpUrl } from "@/lib/subscription";

type NotificationEvent = {
  id: string;
  planId: string;
  blockTimestamp: string;
  transactionHash: string;
  type: "STATUS_CHANGE" | "PLAN_UPDATE";
  active?: boolean;
  price?: string;
  duration?: string;
  ipfsHash?: string;
};

const subQuery = `
  query GetUserPlans($subscriber: Bytes!) {
    subscriptionStates(where: { subscriber_: { id: $subscriber } }) {
      plan {
        id
        ipfsHash
      }
    }
  }
`;

const eventsQuery = `
  query GetPlanEvents($planIds: [Bytes!]!) {
    planStatusUpdateds(
      where: { planId_in: $planIds }
      orderBy: blockTimestamp
      orderDirection: desc
      first: 50
    ) {
      id
      planId
      active
      blockTimestamp
      transactionHash
    }
    planUpdateds(
      where: { planId_in: $planIds }
      orderBy: blockTimestamp
      orderDirection: desc
      first: 50
    ) {
      id
      planId
      duration
      ipfsHash
      blockTimestamp
      transactionHash
    }
  }
`;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subscriber = searchParams.get("subscriber");

    if (!subscriber) {
      return NextResponse.json({ error: "subscriber is required" }, { status: 400 });
    }

    // 1. Get user's subscribed plans
    const subData = await querySubgraph<{ subscriptionStates: { plan: { id: string, ipfsHash: string } }[] }>(
      subQuery,
      { subscriber: toLowerHex(subscriber) }
    );

    const planIds = subData.subscriptionStates.map(s => s.plan.id);
    if (planIds.length === 0) {
      return NextResponse.json({ notifications: [] });
    }

    // 2. Get events for those plans
    const eventsData = await querySubgraph<{
      planStatusUpdateds: any[];
      planUpdateds: any[];
    }>(eventsQuery, { planIds });

    // 3. Merge and sort events
    const notifications: NotificationEvent[] = [
      ...eventsData.planStatusUpdateds.map(e => ({
        ...e,
        type: "STATUS_CHANGE" as const,
      })),
      ...eventsData.planUpdateds.map(e => ({
        ...e,
        type: "PLAN_UPDATE" as const,
      })),
    ].sort((a, b) => Number(b.blockTimestamp) - Number(a.blockTimestamp));

    // 4. Optionally fetch metadata names for better UX
    // (In a real app, we'd cache this or join in subgraph if possible)
    
    return NextResponse.json({ notifications });
  } catch (err) {
    console.error("[/api/subscription/notifications]", err);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
