import { NextResponse } from "next/server";
import { ipfsHashToHttpUrl } from "@/lib/subscription";
import {
  maskAddress,
  querySubgraph,
  toLowerHex,
  toNumber,
  toSecondsNow,
} from "@/lib/subgraph";

type PlanDetail = {
  id: string;
  duration: string;
  ipfsHash: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  subscriptionCount: number;
  totalGrossVolume: string;
  totalFeesCollected: string;
  lastSubscriptionAt: string | null;
  tiers: {
    id: string;
    tierId: string;
    price: string;
    label: string;
  }[];
  seller: {
    id: string;
    planCount: number;
    activePlanCount: number;
    subscriptionCount: number;
    totalGrossRevenue: string;
    totalNetRevenue: string;
  };
};

type PlanSubscriptionState = {
  id: string;
  status: "ACTIVE" | "EXPIRED";
  subscriptionCount: number;
  totalSpent: string;
  lastStartTime: string;
  lastEndTime: string;
  lastBuyerData: string;
  updatedAt: string;
  subscriber: {
    id: string;
    subscriptionCount: number;
    activeSubscriptionCount: number;
    totalSpent: string;
  };
};

type SubscribedEvent = {
  id: string;
  totalAmount: string;
  feeAmount: string;
  blockTimestamp: string;
  buyerData: string;
};

const query = `
  query PlanDetail(
    $planId: Bytes!
    $first: Int!
    $skip: Int!
    $eventsFirst: Int!
    $thirtyDaysAgo: BigInt!
    $sevenDaysAgo: BigInt!
  ) {
    plan(id: $planId) {
      id
      duration
      ipfsHash
      active
      createdAt
      updatedAt
      subscriptionCount
      totalGrossVolume
      totalFeesCollected
      lastSubscriptionAt
      tiers {
        id
        tierId
        price
        label
      }
      seller {
        id
        planCount
        activePlanCount
        subscriptionCount
        totalGrossRevenue
        totalNetRevenue
      }
    }
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
        subscriptionCount
        activeSubscriptionCount
        totalSpent
      }
    }
    recentSubscriptions: subscribeds(
      where: { planId: $planId, blockTimestamp_gte: $thirtyDaysAgo }
      first: $eventsFirst
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      totalAmount
      feeAmount
      blockTimestamp
      buyerData
    }
    sevenDaySubscriptions: subscribeds(
      where: { planId: $planId, blockTimestamp_gte: $sevenDaysAgo }
      first: $eventsFirst
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      totalAmount
      feeAmount
      blockTimestamp
      buyerData
    }
  }
`;

function sumBigInt(values: string[]) {
  return values.reduce((acc, value) => acc + BigInt(value), 0n);
}

function averageBigInt(total: bigint, count: number) {
  if (count <= 0) return 0n;
  return total / BigInt(count);
}

export async function GET(
  req: Request,
  context: { params: Promise<{ planId: string }> },
) {
  try {
    const { planId } = await context.params;
    const normalizedPlanId = toLowerHex(planId);
    const { searchParams } = new URL(req.url);
    const viewer = (searchParams.get("viewer") ?? "").toLowerCase();
    const first = Math.min(Number(searchParams.get("first") ?? "100"), 200);
    const skip = Math.max(Number(searchParams.get("skip") ?? "0"), 0);
    const eventsFirst = Math.min(
      Number(searchParams.get("eventsFirst") ?? "500"),
      1000,
    );

    const now = toSecondsNow();
    const sevenDaysAgo = Math.max(now - 7 * 24 * 60 * 60, 0);
    const thirtyDaysAgo = Math.max(now - 30 * 24 * 60 * 60, 0);

    const data = await querySubgraph<{
      plan: PlanDetail | null;
      subscriptionStates: PlanSubscriptionState[];
      recentSubscriptions: SubscribedEvent[];
      sevenDaySubscriptions: SubscribedEvent[];
    }>(query, {
      planId: normalizedPlanId,
      first,
      skip,
      eventsFirst,
      thirtyDaysAgo,
      sevenDaysAgo,
    });

    if (!data.plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    let metadata: unknown = null;
    try {
      const metadataResponse = await fetch(
        ipfsHashToHttpUrl(data.plan.ipfsHash),
        {
          cache: "no-store",
        },
      );
      metadata = metadataResponse.ok ? await metadataResponse.json() : null;
    } catch {
      metadata = null;
    }

    const isOwnerView =
      viewer !== "" && viewer === data.plan.seller.id.toLowerCase();

    const buyers = data.subscriptionStates.map((entry) => {
      const lastEndTime = toNumber(entry.lastEndTime);
      const remainingSeconds = Math.max(lastEndTime - now, 0);
      const active = remainingSeconds > 0 && entry.status === "ACTIVE";

      return {
        id: entry.id,
        subscriber: isOwnerView
          ? entry.subscriber.id
          : maskAddress(entry.subscriber.id),
        status: active ? "ACTIVE" : "EXPIRED",
        subscriptionCount: entry.subscriptionCount,
        totalSpent: entry.totalSpent,
        lastStartTime: entry.lastStartTime,
        lastEndTime: entry.lastEndTime,
        buyerData: entry.lastBuyerData, // Added buyerData
        remainingSeconds,
        updatedAt: entry.updatedAt,
      };
    });

    const activeBuyerCount = buyers.filter(
      (entry) => entry.status === "ACTIVE",
    ).length;

    const repeatBuyerCount = buyers.filter(
      (entry) => entry.subscriptionCount > 1,
    ).length;

    const recentSubscriptions = data.recentSubscriptions ?? [];
    const sevenDaySubscriptions = data.sevenDaySubscriptions ?? [];

    // Group subscriptions by day for chart data
    const chartMap = new Map<string, { revenue: bigint; count: number }>();
    for (let i = 0; i < 30; i++) {
      const d = new Date((now - i * 86400) * 1000);
      const key = d.toISOString().split("T")[0];
      chartMap.set(key, { revenue: 0n, count: 0 });
    }

    for (const event of recentSubscriptions) {
      const d = new Date(Number(event.blockTimestamp) * 1000);
      const key = d.toISOString().split("T")[0];
      if (chartMap.has(key)) {
        const current = chartMap.get(key)!;
        chartMap.set(key, {
          revenue: current.revenue + BigInt(event.totalAmount),
          count: current.count + 1,
        });
      }
    }

    const chartData = Array.from(chartMap.entries())
      .map(([date, stats]) => ({
        date,
        revenue: stats.revenue.toString(),
        subscriptions: stats.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const thirtyDayGross = sumBigInt(
      recentSubscriptions.map((entry) => entry.totalAmount),
    );
    const thirtyDayFees = sumBigInt(
      recentSubscriptions.map((entry) => entry.feeAmount),
    );
    const sevenDayGross = sumBigInt(
      sevenDaySubscriptions.map((entry) => entry.totalAmount),
    );
    const sevenDayFees = sumBigInt(
      sevenDaySubscriptions.map((entry) => entry.feeAmount),
    );
    const totalGrossVolume = BigInt(data.plan.totalGrossVolume);
    const totalFeesCollected = BigInt(data.plan.totalFeesCollected);
    const totalBuyers = buyers.length;
    const activeRate =
      totalBuyers > 0 ? (activeBuyerCount / totalBuyers) * 100 : 0;
    const repeatBuyerRate =
      totalBuyers > 0 ? (repeatBuyerCount / totalBuyers) * 100 : 0;

    return NextResponse.json({
      plan: {
        ...data.plan,
        planId: data.plan.id,
        metadata,
      },
      isOwnerView,
      buyers,
      chartData, // Added chartData
      metrics: {
        activeBuyerCount,
        expiredBuyerCount: buyers.length - activeBuyerCount,
        totalBuyers: buyers.length,
      },
      analytics: {
        grossEarnings: data.plan.totalGrossVolume,
        feeCollected: data.plan.totalFeesCollected,
        netEarnings: (totalGrossVolume - totalFeesCollected).toString(),
        avgRevenuePerSubscriber: averageBigInt(
          totalGrossVolume,
          totalBuyers,
        ).toString(),
        repeatBuyerCount,
        repeatBuyerRate,
        activeRate,
        windows: {
          sevenDays: {
            subscriptionCount: sevenDaySubscriptions.length,
            grossVolume: sevenDayGross.toString(),
            totalFees: sevenDayFees.toString(),
            averageTicket: averageBigInt(
              sevenDayGross,
              sevenDaySubscriptions.length,
            ).toString(),
          },
          thirtyDays: {
            subscriptionCount: recentSubscriptions.length,
            grossVolume: thirtyDayGross.toString(),
            totalFees: thirtyDayFees.toString(),
            averageTicket: averageBigInt(
              thirtyDayGross,
              recentSubscriptions.length,
            ).toString(),
          },
        },
      },
      pagination: { first, skip },
    });
  } catch (err) {
    console.error("[/api/subscription/plan/[planId]]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
