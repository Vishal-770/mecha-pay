import { NextResponse } from "next/server";
import { ipfsHashToHttpUrl } from "@/lib/subscription";
import { querySubgraph, toLowerHex } from "@/lib/subgraph";

type Tier = {
  id: string;
  tierId: string;
  price: string;
  label: string;
  active: boolean;
};

type Plan = {
  id: string;
  seller: { id: string };
  duration: string;
  ipfsHash: string;
  active: boolean;
  subscriptionCount: number;
  totalGrossVolume: string;
  totalFeesCollected: string;
  lastSubscriptionAt: string | null;
  createdAt: string;
  tiers: Tier[];
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
  tierId: string;
  tier: {
    label: string;
    price: string;
  } | null;
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

type MonthlyStats = {
  id: string;
  monthStartTimestamp: string;
  plansCreated: number;
  subscriptionsCreated: number;
  totalGrossVolume: string;
  totalFeesCollected: string;
  totalFeeWithdrawals: string;
};

type Transaction = {
  id: string;
  type: string;
  from: string;
  to: string | null;
  amount: string | null;
  fee: string | null;
  plan: { id: string } | null;
  blockTimestamp: string;
};


const sellerPlansQuery = `
  query SellerPlans($seller: Bytes!) {
    plans(where: { seller_: { id: $seller } }, orderBy: createdAt, orderDirection: desc) {
      id
      seller { id }
      duration
      ipfsHash
      active
      subscriptionCount
      totalGrossVolume
      totalFeesCollected
      lastSubscriptionAt
      createdAt
      tiers {
        id
        tierId
        price
        label
        active
      }
    }
  }
`;

const buyerStatesQuery = `
  query BuyerStates($subscriber: Bytes!) {
    subscriptionStates(where: { subscriber_: { id: $subscriber } }, orderBy: updatedAt, orderDirection: desc) {
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
      tierId
      tier {
        label
        price
      }
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

const monthlyStatsQuery = `
  query MonthlyStatsCollection {
    monthlyStats_collection(orderBy: monthStartTimestamp, orderDirection: desc, first: 12) {
      id
      monthStartTimestamp
      plansCreated
      subscriptionsCreated
      totalGrossVolume
      totalFeesCollected
      totalFeeWithdrawals
    }
  }
`;

const transactionsQuery = `
  query Transactions($user: Bytes!, $first: Int!) {
    transactions(
      first: $first,
      orderBy: blockTimestamp,
      orderDirection: desc,
      where: { or: [{ from: $user }, { to: $user }] }
    ) {
      id
      type
      from
      to
      amount
      fee
      plan { id }
      blockTimestamp
    }
  }
`;


import { validateWalletOwnership } from "@/lib/auth-util";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const seller = searchParams.get("seller");
    const subscriber = searchParams.get("subscriber");
    const userToken = searchParams.get("userToken");

    if (!userToken) {
      return NextResponse.json(
        { error: "userToken is required" },
        { status: 400 },
      );
    }

    // Security: Validate wallet ownership for both roles if they are being queried
    if (seller) {
      const isSellerOwner = await validateWalletOwnership(userToken, seller);
      if (!isSellerOwner) {
        return NextResponse.json(
          { error: "Unauthorized: Seller wallet does not belong to this user session" },
          { status: 403 },
        );
      }
    }

    if (subscriber) {
      const isSubOwner = await validateWalletOwnership(userToken, subscriber);
      if (!isSubOwner) {
        return NextResponse.json(
          { error: "Unauthorized: Subscriber wallet does not belong to this user session" },
          { status: 403 },
        );
      }
    }
    const eventsFirst = 1000;
    const now = Math.floor(Date.now() / 1000);
    const oneYearAgo = Math.max(now - 365 * 24 * 60 * 60, 0);

    const results = await Promise.allSettled([
      // 0: seller metrics
      seller
        ? querySubgraph<{ seller: Seller | null }>(sellerQuery, { id: toLowerHex(seller) })
        : Promise.resolve({ seller: null }),
      // 1: subscriber metrics
      subscriber
        ? querySubgraph<{ subscriber: Subscriber | null }>(subscriberQuery, { id: toLowerHex(subscriber) })
        : Promise.resolve({ subscriber: null }),
      // 2: recent subscription events (1 year)
      querySubgraph<{ subscribeds: SubscribedEvent[] }>(recentSubscriptionsQuery, {
        user: toLowerHex(seller || subscriber || "0x0000000000000000000000000000000000000000"),
        first: 1000,
        since: String(oneYearAgo),
      }),
      // 3: seller plans
      seller
        ? querySubgraph<{ plans: Plan[] }>(sellerPlansQuery, { seller: toLowerHex(seller) })
        : Promise.resolve({ plans: [] }),
      // 4: buyer subscription states
      subscriber
        ? querySubgraph<{ subscriptionStates: SubscriptionState[] }>(buyerStatesQuery, { subscriber: toLowerHex(subscriber) })
        : Promise.resolve({ subscriptionStates: [] }),
      // 5: monthly stats (DEPRECATED - we will compute user specific)
      Promise.resolve({ monthlyStats_collection: [] }),
      // 6: transactions
      (seller || subscriber)
        ? querySubgraph<{ transactions: Transaction[] }>(transactionsQuery, {
            user: toLowerHex(seller || subscriber!),
            first: 20,
          })
        : Promise.resolve({ transactions: [] }),
    ]);

    // Log any individual failures for debugging
    const queryNames = ["sellerMetrics", "subscriberMetrics", "recentEvents", "sellerPlans", "buyerStates", "monthlyStats", "transactions"];
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(`[analytics] Query "${queryNames[i]}" failed:`, r.reason);
      }
    });

    const unwrap = <T>(r: PromiseSettledResult<T>, fallback: T): T =>
      r.status === "fulfilled" ? r.value : fallback;

    const sellerData = unwrap(results[0] as PromiseSettledResult<{ seller: Seller | null }>, { seller: null });
    const subscriberData = unwrap(results[1] as PromiseSettledResult<{ subscriber: Subscriber | null }>, { subscriber: null });
    const recentEventsData = unwrap(results[2] as PromiseSettledResult<{ subscribeds: SubscribedEvent[] }>, { subscribeds: [] });
    const sellerPlansData = unwrap(results[3] as PromiseSettledResult<{ plans: Plan[] }>, { plans: [] });
    const buyerStatesData = unwrap(results[4] as PromiseSettledResult<{ subscriptionStates: SubscriptionState[] }>, { subscriptionStates: [] });
    const transactionsData = unwrap(results[6] as PromiseSettledResult<{ transactions: Transaction[] }>, { transactions: [] });

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

    // Aggregate 30-day revenue history for area chart
    const revenueMap = new Map<string, bigint>();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60;
    for (let i = 0; i < 30; i++) {
        const d = new Date((now - i * 86400) * 1000);
        const key = d.toISOString().split("T")[0];
        revenueMap.set(key, 0n);
    }

    // Aggregate 12-month stats for bar chart
    const monthlyMap = new Map<string, { totalGrossVolume: bigint; subscriptionsCreated: number; plansCreated: number; totalFeesCollected: bigint }>();
    for (let i = 0; i < 12; i++) {
        const d = new Date(now * 1000);
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthlyMap.set(key, { totalGrossVolume: 0n, subscriptionsCreated: 0, plansCreated: 0, totalFeesCollected: 0n });
    }

    // Count plans created per month
    sellerPlans.forEach(plan => {
        const d = new Date(Number(plan.createdAt) * 1000);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyMap.has(monthKey)) {
            const current = monthlyMap.get(monthKey)!;
            monthlyMap.set(monthKey, { ...current, plansCreated: current.plansCreated + 1 });
        }
    });

    recentSubscriptions.forEach(event => {
        const timestamp = Number(event.blockTimestamp);
        const d = new Date(timestamp * 1000);
        
        // Update 30-day map
        if (timestamp >= thirtyDaysAgo) {
            const dayKey = d.toISOString().split("T")[0];
            if (revenueMap.has(dayKey)) {
                if (event.seller.toLowerCase() === (seller || "").toLowerCase()) {
                    revenueMap.set(dayKey, (revenueMap.get(dayKey) || 0n) + BigInt(event.totalAmount));
                }
            }
        }

        // Update 12-month map
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyMap.has(monthKey)) {
            if (event.seller.toLowerCase() === (seller || "").toLowerCase()) {
                const current = monthlyMap.get(monthKey)!;
                monthlyMap.set(monthKey, {
                    ...current,
                    totalGrossVolume: current.totalGrossVolume + BigInt(event.totalAmount),
                    subscriptionsCreated: current.subscriptionsCreated + 1,
                    totalFeesCollected: current.totalFeesCollected + BigInt(event.feeAmount || "0")
                });
            }
        }
    });

    const revenueHistory = Array.from(revenueMap.entries())
        .map(([date, revenue]) => ({
            date,
            revenue: revenue.toString()
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    const userMonthlyStats = Array.from(monthlyMap.entries())
        .map(([key, stats]) => {
            const [year, month] = key.split("-");
            const d = new Date(Number(year), Number(month) - 1, 1);
            return {
                id: key,
                monthStartTimestamp: Math.floor(d.getTime() / 1000).toString(),
                totalGrossVolume: stats.totalGrossVolume.toString(),
                subscriptionsCreated: stats.subscriptionsCreated,
                plansCreated: stats.plansCreated,
                totalFeesCollected: stats.totalFeesCollected.toString()
            };
        })
        .sort((a, b) => Number(a.monthStartTimestamp) - Number(b.monthStartTimestamp));

    return NextResponse.json({
      globalOverview,
      sellerMetrics: sellerData.seller,
      sellerPlanBreakdown: sellerPlans,
      buyerMetrics: subscriberData.subscriber,
      buyerTimeline: buyerStates,
      topPlans: topPlansWithMetadata,
      recentSubscriptions,
      revenueHistory,
      monthlyStats: userMonthlyStats,
      transactions: transactionsData.transactions ?? [],
    });

  } catch (err) {
    console.error("[/api/subscription/analytics]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
