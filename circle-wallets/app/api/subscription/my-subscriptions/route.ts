import { NextResponse } from "next/server";
import { ipfsHashToHttpUrl } from "@/lib/subscription";
import {
  querySubgraph,
  toLowerHex,
  toNumber,
  toSecondsNow,
} from "@/lib/subgraph";

type StateRecord = {
  id: string;
  status: "ACTIVE" | "EXPIRED";
  subscriptionCount: number;
  totalSpent: string;
  totalFeesPaid: string;
  firstStartTime: string;
  lastStartTime: string;
  lastEndTime: string;
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
  query MySubscriptions($subscriber: Bytes!, $first: Int!, $skip: Int!) {
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
      totalFeesPaid
      firstStartTime
      lastStartTime
      lastEndTime
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subscriber = searchParams.get("subscriber");

    if (!subscriber) {
      return NextResponse.json(
        { error: "subscriber is required" },
        { status: 400 },
      );
    }

    const first = Math.min(Number(searchParams.get("first") ?? "100"), 200);
    const skip = Math.max(Number(searchParams.get("skip") ?? "0"), 0);

    const data = await querySubgraph<{ subscriptionStates: StateRecord[] }>(
      query,
      {
        subscriber: toLowerHex(subscriber),
        first,
        skip,
      },
    );

    const now = toSecondsNow();

    const subscriptions = await Promise.all(
      (data.subscriptionStates ?? []).map(async (entry) => {
        let metadata: unknown = null;
        try {
          const metadataRes = await fetch(
            ipfsHashToHttpUrl(entry.plan.ipfsHash),
            {
              cache: "no-store",
            },
          );
          metadata = metadataRes.ok ? await metadataRes.json() : null;
        } catch {
          metadata = null;
        }

        const lastEndTime = toNumber(entry.lastEndTime);
        const remainingSeconds = Math.max(lastEndTime - now, 0);
        const active = remainingSeconds > 0 && entry.status === "ACTIVE";

        return {
          ...entry,
          status: active ? "ACTIVE" : "EXPIRED",
          remainingSeconds,
          canRenew: !active,
          metadata,
        };
      }),
    );

    return NextResponse.json({ subscriptions, pagination: { first, skip } });
  } catch (err) {
    console.error("[/api/subscription/my-subscriptions]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
