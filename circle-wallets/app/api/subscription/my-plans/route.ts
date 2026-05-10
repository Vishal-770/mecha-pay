import { NextResponse } from "next/server";
import { ipfsHashToHttpUrl } from "@/lib/subscription";
import {
  querySubgraph,
  toLowerHex,
  toNumber,
  toSecondsNow,
} from "@/lib/subgraph";

type SellerPlan = {
  id: string;
  duration: string;
  ipfsHash: string;
  active: boolean;
  subscriptionCount: number;
  totalGrossVolume: string;
  totalFeesCollected: string;
  lastSubscriptionAt: string | null;
  tiers: {
    tierId: string;
    price: string;
    label: string;
    active: boolean;
  }[];
};

type PlanState = {
  id: string;
  status: "ACTIVE" | "EXPIRED";
  subscriptionCount: number;
  totalSpent: string;
  plan: { id: string };
};

type SubscribedEvent = {
  id: string;
  planId: string;
  totalAmount: string;
  feeAmount: string;
  blockTimestamp: string;
};

const sellerPlansQuery = `
  query SellerPlans($seller: Bytes!, $first: Int!, $skip: Int!) {
    plans(
      where: { seller_: { id: $seller } }
      first: $first
      skip: $skip
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      duration
      ipfsHash
      active
      subscriptionCount
      totalGrossVolume
      totalFeesCollected
      lastSubscriptionAt
      tiers {
        tierId
        price
        label
        active
      }
    }
  }
`;

const planStatesQuery = `
  query SellerPlanStates($seller: Bytes!, $first: Int!) {
    subscriptionStates(
      where: { seller_: { id: $seller } }
      first: $first
      orderBy: updatedAt
      orderDirection: desc
    ) {
      id
      status
      subscriptionCount
      totalSpent
      plan { id }
    }
  }
`;

const planEventsQuery = `
  query SellerPlanEvents($seller: Bytes!, $thirtyDaysAgo: BigInt!, $sevenDaysAgo: BigInt!, $first: Int!) {
    thirtyDayEvents: subscribeds(
      where: { seller: $seller, blockTimestamp_gte: $thirtyDaysAgo }
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      planId
      totalAmount
      feeAmount
      blockTimestamp
    }
    sevenDayEvents: subscribeds(
      where: { seller: $seller, blockTimestamp_gte: $sevenDaysAgo }
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      planId
      totalAmount
      feeAmount
      blockTimestamp
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

import { validateWalletOwnership } from "@/lib/auth-util";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const seller = searchParams.get("seller");
    const userToken = searchParams.get("userToken");

    if (!seller || !userToken) {
      return NextResponse.json(
        { error: "seller and userToken are required" },
        { status: 400 },
      );
    }

    // Security: Validate that the seller address belongs to the userToken session
    const isValid = await validateWalletOwnership(userToken, seller);
    if (!isValid) {
      return NextResponse.json(
        { error: "Unauthorized: Wallet address does not belong to this user session" },
        { status: 403 },
      );
    }

    const first = Math.min(Number(searchParams.get("first") ?? "100"), 200);
    const skip = Math.max(Number(searchParams.get("skip") ?? "0"), 0);
    const eventsFirst = Math.min(
      Number(searchParams.get("eventsFirst") ?? "800"),
      1500,
    );

    const now = toSecondsNow();
    const sevenDaysAgo = Math.max(now - 7 * 24 * 60 * 60, 0);
    const thirtyDaysAgo = Math.max(now - 30 * 24 * 60 * 60, 0);
    const sellerId = toLowerHex(seller);

    const [plansData, statesData, eventsData] = await Promise.all([
      querySubgraph<{ plans: SellerPlan[] }>(sellerPlansQuery, {
        seller: sellerId,
        first,
        skip,
      }),
      querySubgraph<{ subscriptionStates: PlanState[] }>(planStatesQuery, {
        seller: sellerId,
        first: 1000,
      }),
      querySubgraph<{
        thirtyDayEvents: SubscribedEvent[];
        sevenDayEvents: SubscribedEvent[];
      }>(planEventsQuery, {
        seller: sellerId,
        thirtyDaysAgo,
        sevenDaysAgo,
        first: eventsFirst,
      }),
    ]);

    const plans = plansData.plans ?? [];
    const states = statesData.subscriptionStates ?? [];
    const thirtyDayEvents = eventsData.thirtyDayEvents ?? [];
    const sevenDayEvents = eventsData.sevenDayEvents ?? [];

    const statesByPlan = new Map<string, PlanState[]>();
    for (const state of states) {
      const key = state.plan.id.toLowerCase();
      const bucket = statesByPlan.get(key) ?? [];
      bucket.push(state);
      statesByPlan.set(key, bucket);
    }

    const thirtyByPlan = new Map<string, SubscribedEvent[]>();
    for (const event of thirtyDayEvents) {
      const key = event.planId.toLowerCase();
      const bucket = thirtyByPlan.get(key) ?? [];
      bucket.push(event);
      thirtyByPlan.set(key, bucket);
    }

    const sevenByPlan = new Map<string, SubscribedEvent[]>();
    for (const event of sevenDayEvents) {
      const key = event.planId.toLowerCase();
      const bucket = sevenByPlan.get(key) ?? [];
      bucket.push(event);
      sevenByPlan.set(key, bucket);
    }

    const hydrated = await Promise.all(
      plans.map(async (plan) => {
        const planKey = plan.id.toLowerCase();
        const planStates = statesByPlan.get(planKey) ?? [];
        const activeSubscribers = planStates.filter(
          (entry) => entry.status === "ACTIVE",
        ).length;
        const expiredSubscribers = Math.max(
          planStates.length - activeSubscribers,
          0,
        );
        const repeatBuyerCount = planStates.filter(
          (entry) => entry.subscriptionCount > 1,
        ).length;
        const repeatBuyerRate =
          planStates.length > 0
            ? (repeatBuyerCount / planStates.length) * 100
            : 0;

        const planThirtyEvents = thirtyByPlan.get(planKey) ?? [];
        const planSevenEvents = sevenByPlan.get(planKey) ?? [];

        const thirtyGross = sumBigInt(
          planThirtyEvents.map((entry) => entry.totalAmount),
        );
        const thirtyFees = sumBigInt(
          planThirtyEvents.map((entry) => entry.feeAmount),
        );
        const sevenGross = sumBigInt(
          planSevenEvents.map((entry) => entry.totalAmount),
        );
        const sevenFees = sumBigInt(
          planSevenEvents.map((entry) => entry.feeAmount),
        );

        const gross = BigInt(plan.totalGrossVolume);
        const fees = BigInt(plan.totalFeesCollected);

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
          planId: plan.id,
          metadata,
          analysis: {
            totalSubscribers: planStates.length,
            activeSubscribers,
            expiredSubscribers,
            grossEarnings: gross.toString(),
            feeCollected: fees.toString(),
            netEarnings: (gross - fees).toString(),
            averageRevenuePerSubscriber: averageBigInt(
              gross,
              planStates.length,
            ).toString(),
            repeatBuyerCount,
            repeatBuyerRate,
            lastSubscriptionAgeDays:
              plan.lastSubscriptionAt == null
                ? null
                : Math.floor(
                    Math.max(now - toNumber(plan.lastSubscriptionAt), 0) /
                      86400,
                  ),
            windows: {
              sevenDays: {
                subscriptionCount: planSevenEvents.length,
                grossVolume: sevenGross.toString(),
                totalFees: sevenFees.toString(),
                averageTicket: averageBigInt(
                  sevenGross,
                  planSevenEvents.length,
                ).toString(),
              },
              thirtyDays: {
                subscriptionCount: planThirtyEvents.length,
                grossVolume: thirtyGross.toString(),
                totalFees: thirtyFees.toString(),
                averageTicket: averageBigInt(
                  thirtyGross,
                  planThirtyEvents.length,
                ).toString(),
              },
            },
          },
        };
      }),
    );

    return NextResponse.json({
      plans: hydrated,
      summary: {
        totalPlans: hydrated.length,
        activePlans: hydrated.filter((entry) => entry.active).length,
        totalGross: hydrated
          .reduce(
            (acc, entry) => acc + BigInt(entry.analysis.grossEarnings),
            0n,
          )
          .toString(),
        totalNet: hydrated
          .reduce((acc, entry) => acc + BigInt(entry.analysis.netEarnings), 0n)
          .toString(),
      },
      pagination: { first, skip },
    });
  } catch (err) {
    console.error("[/api/subscription/my-plans]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
