import { NextResponse } from "next/server";
import { ipfsHashToHttpUrl } from "@/lib/subscription";
import { querySubgraph, toLowerHex } from "@/lib/subgraph";

type Plan = {
  id: string;
  seller: { id: string };
  price: string;
  duration: string;
  ipfsHash: string;
  active: boolean;
  subscriptionCount: number;
  totalGrossVolume: string;
  totalFeesCollected: string;
  lastSubscriptionAt: string | null;
};

type SubscriptionState = {
  id: string;
  status: "ACTIVE" | "EXPIRED";
  lastEndTime: string;
  totalSpent: string;
  plan: { id: string };
  seller: { id: string };
};

type SubscribedEvent = {
  id: string;
  subscriber: string;
  seller: string;
  planId: string;
  totalAmount: string;
  feeAmount: string;
  blockTimestamp: string;
};

type Seller = {
  id: string;
  planCount: number;
  activePlanCount: number;
  subscriptionCount: number;
  totalGrossRevenue: string;
  totalNetRevenue: string;
  totalFeeContributed: string;
};

type Subscriber = {
  id: string;
  subscriptionCount: number;
  activeSubscriptionCount: number;
  totalSpent: string;
  totalFeesPaid: string;
};

const sellerPlansQuery = `
  query SellerPlans($seller: Bytes!) {
    plans(where: { seller: $seller }, orderBy: createdAt, orderDirection: desc) {
      id
      seller { id }
      price
      duration
      ipfsHash
      active
      subscriptionCount
      totalGrossVolume
      totalFeesCollected
      lastSubscriptionAt
    }
  }
`;

const buyerStatesQuery = `
  query BuyerStates($subscriber: Bytes!) {
    subscriptionStates(where: { subscriber: $subscriber }, orderBy: updatedAt, orderDirection: desc) {
      id
      status
      lastEndTime
      totalSpent
      plan { id }
      seller { id }
    }
  }
`;

const recentSubscriptionsQuery = `
  query RecentSubscriptions($user: Bytes!, $first: Int!, $since: BigInt!) {
    subscribeds(
      first: $first, 
      orderBy: blockTimestamp, 
      orderDirection: desc,
      where: { 
        and: [
          { or: [{ subscriber: $user }, { seller: $user }] },
          { blockTimestamp_gte: $since }
        ]
      }
    ) {
      id
      subscriber
      seller
      planId
      totalAmount
      feeAmount
      blockTimestamp
    }
  }
`;

const sellerQuery = `
  query SellerMetrics($id: Bytes!) {
    seller(id: $id) {
      id
      planCount
      activePlanCount
      subscriptionCount
      totalGrossRevenue
      totalNetRevenue
      totalFeeContributed
    }
  }
`;

const subscriberQuery = `
  query SubscriberMetrics($id: Bytes!) {
    subscriber(id: $id) {
      id
      subscriptionCount
      activeSubscriptionCount
      totalSpent
      totalFeesPaid
    }
  }
`;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const seller = searchParams.get("seller");
    const subscriber = searchParams.get("subscriber");
    const eventsFirst = 1000;
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = Math.max(now - 30 * 24 * 60 * 60, 0);

    const [
      sellerData,
      subscriberData,
      recentEventsData,
      sellerPlansData,
      buyerStatesData,
    ] = await Promise.all([
      seller
        ? querySubgraph<{ seller: Seller | null }>(sellerQuery, {
            id: toLowerHex(seller),
          })
        : Promise.resolve({ seller: null }),
      subscriber
        ? querySubgraph<{ subscriber: Subscriber | null }>(subscriberQuery, {
            id: toLowerHex(subscriber),
          })
        : Promise.resolve({ subscriber: null }),
      querySubgraph<{ subscribeds: SubscribedEvent[] }>(
        recentSubscriptionsQuery,
        {
          user: toLowerHex(seller || subscriber || "0x0000000000000000000000000000000000000000"),
          first: eventsFirst,
          since: thirtyDaysAgo,
        },
      ),
      seller
        ? querySubgraph<{ plans: Plan[] }>(sellerPlansQuery, {
            seller: toLowerHex(seller),
          })
        : Promise.resolve({ plans: [] }),
      subscriber
        ? querySubgraph<{ subscriptionStates: SubscriptionState[] }>(
            buyerStatesQuery,
            {
              subscriber: toLowerHex(subscriber),
            },
          )
        : Promise.resolve({ subscriptionStates: [] }),
    ]);

    const recentSubscriptions = recentEventsData.subscribeds ?? [];
    const sellerPlans = sellerPlansData.plans ?? [];
    const buyerStates = buyerStatesData.subscriptionStates ?? [];

    const globalOverview = {
      totalPlans: 0,
      activePlans: 0,
      totalSubscriptions: 0,
      activeSubscriptions: 0,
    };

    const topPlans = [...sellerPlans]
      .sort((a, b) => {
        const aGross = BigInt(a.totalGrossVolume);
        const bGross = BigInt(b.totalGrossVolume);
        if (aGross === bGross) {
          return b.subscriptionCount - a.subscriptionCount;
        }
        return bGross > aGross ? 1 : -1;
      })
      .slice(0, 5);

    const topPlansWithMetadata = await Promise.all(
      topPlans.map(async (plan) => {
        let metadata: unknown = null;
        try {
          const metadataRes = await fetch(ipfsHashToHttpUrl(plan.ipfsHash), {
            cache: "no-store",
          });
          metadata = metadataRes.ok ? await metadataRes.json() : null;
        } catch {
          metadata = null;
        }

        return {
          ...plan,
          metadata,
          netRevenue: (
            BigInt(plan.totalGrossVolume) - BigInt(plan.totalFeesCollected)
          ).toString(),
        };
      }),
    );

    // Aggregate revenue history for chart
    const chartMap = new Map<string, bigint>();
    for (let i = 0; i < 30; i++) {
        const d = new Date((now - i * 86400) * 1000);
        const key = d.toISOString().split("T")[0];
        chartMap.set(key, 0n);
    }

    recentSubscriptions.forEach(event => {
        const d = new Date(Number(event.blockTimestamp) * 1000);
        const key = d.toISOString().split("T")[0];
        if (chartMap.has(key)) {
            // ONLY count if the user is the seller (actual revenue)
            if (event.seller.toLowerCase() === (seller || "").toLowerCase()) {
                chartMap.set(key, (chartMap.get(key) || 0n) + BigInt(event.totalAmount));
            }
        }
    });

    const revenueHistory = Array.from(chartMap.entries())
        .map(([date, revenue]) => ({
            date,
            revenue: revenue.toString()
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      globalOverview,
      sellerMetrics: sellerData.seller,
      sellerPlanBreakdown: sellerPlans,
      buyerMetrics: subscriberData.subscriber,
      buyerTimeline: buyerStates,
      topPlans: topPlansWithMetadata,
      recentSubscriptions,
      revenueHistory,
    });
  } catch (err) {
    console.error("[/api/subscription/analytics]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
