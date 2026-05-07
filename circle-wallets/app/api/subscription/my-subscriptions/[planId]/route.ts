import { NextResponse } from "next/server";
import { ipfsHashToHttpUrl } from "@/lib/subscription";
import {
  querySubgraph,
  toLowerHex,
  toNumber,
  toSecondsNow,
} from "@/lib/subgraph";

type SubscriptionState = {
  id: string;
  status: "ACTIVE" | "EXPIRED";
  subscriptionCount: number;
  totalSpent: string;
  totalFeesPaid: string;
  firstStartTime: string;
  lastStartTime: string;
  lastEndTime: string;
  lastBuyerData: string;
  lastTierId: string;
  updatedAt: string;
  seller: {
    id: string;
  };
  plan: {
    id: string;
    duration: string;
    ipfsHash: string;
    active: boolean;
    subscriptionCount: number;
    tiers: {
      tierId: string;
      price: string;
      label: string;
      active: boolean;
    }[];
  };
};

const query = `
  query SingleSubscription($id: ID!) {
    subscriptionState(id: $id) {
      id
      status
      subscriptionCount
      totalSpent
      totalFeesPaid
      firstStartTime
      lastStartTime
      lastEndTime
      lastBuyerData
      lastTierId
      updatedAt
      seller {
        id
      }
      plan {
        id
        duration
        ipfsHash
        active
        subscriptionCount
        tiers {
          tierId
          price
          label
          active
        }
      }
    }
  }
`;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const { searchParams } = new URL(req.url);
    const subscriber = searchParams.get("subscriber");
    const userId = searchParams.get("userId");

    if (!subscriber && !userId) {
      return NextResponse.json(
        { error: "subscriber or userId is required" },
        { status: 400 }
      );
    }

    let entry: SubscriptionState | null = null;

    if (subscriber) {
      const id = `${toLowerHex(subscriber)}-${toLowerHex(planId)}`;
      const data = await querySubgraph<{ subscriptionState: SubscriptionState | null }>(
        query,
        { id }
      );
      entry = data.subscriptionState;
    } else if (userId) {
      // Query by buyer data (userId)
      const userQuery = `
        query SubscriptionsByUserId($planId: Bytes!, $userId: String!) {
          subscriptionStates(
            where: { plan_: { id: $planId }, lastBuyerData: $userId }
            first: 1
            orderBy: updatedAt
            orderDirection: desc
          ) {
            id
            status
            subscriptionCount
            totalSpent
            totalFeesPaid
            firstStartTime
            lastStartTime
            lastEndTime
            lastBuyerData
            lastTierId
            updatedAt
            seller { id }
            plan {
              id
              duration
              ipfsHash
              active
              subscriptionCount
              tiers {
                tierId
                price
                label
                active
              }
            }
          }
        }
      `;
      const data = await querySubgraph<{ subscriptionStates: SubscriptionState[] }>(
        userQuery,
        { planId: toLowerHex(planId), userId }
      );
      entry = data.subscriptionStates?.[0] || null;
    }

    if (!entry) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }
    const now = toSecondsNow();

    let metadata: unknown = null;
    try {
      const metadataRes = await fetch(ipfsHashToHttpUrl(entry.plan.ipfsHash), {
        cache: "no-store",
      });
      metadata = metadataRes.ok ? await metadataRes.json() : null;
    } catch {
      metadata = null;
    }

    const lastEndTime = toNumber(entry.lastEndTime);
    const remainingSeconds = Math.max(lastEndTime - now, 0);
    const isActive = remainingSeconds > 0 && entry.status === "ACTIVE";

    return NextResponse.json({
      subscription: {
        ...entry,
        status: isActive ? "ACTIVE" : "EXPIRED",
        remainingSeconds,
        metadata,
      },
    });
  } catch (err) {
    console.error("[/api/subscription/my-subscriptions/[planId]]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
