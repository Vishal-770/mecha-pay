import { NextRequest, NextResponse } from "next/server";
import {
  querySubgraph,
  toLowerHex,
  toNumber,
  toSecondsNow,
} from "@/lib/subgraph";

type EligibilityState = {
  id: string;
  status: "ACTIVE" | "EXPIRED";
  lastEndTime: string;
};

const query = `
  query Eligibility($subscriber: Bytes!, $planId: Bytes!) {
    subscriptionStates(
      where: { subscriber_: { id: $subscriber }, plan_: { id: $planId } }
      first: 1
      orderBy: updatedAt
      orderDirection: desc
    ) {
      id
      status
      lastEndTime
    }
  }
`;

import { validateWalletOwnership } from "@/lib/auth-util";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      subscriber?: string;
      planId?: string;
      userToken?: string;
    };

    if (!body.subscriber || !body.planId || !body.userToken) {
      return NextResponse.json(
        { error: "subscriber, planId and userToken are required" },
        { status: 400 },
      );
    }

    // Security: Validate wallet ownership
    const isValid = await validateWalletOwnership(body.userToken, body.subscriber);
    if (!isValid) {
      return NextResponse.json(
        { error: "Unauthorized: Wallet address does not belong to this user session" },
        { status: 403 },
      );
    }

    const data = await querySubgraph<{
      subscriptionStates: EligibilityState[];
    }>(query, {
      subscriber: toLowerHex(body.subscriber),
      planId: toLowerHex(body.planId),
    });

    const state = data.subscriptionStates?.[0] ?? null;
    const now = toSecondsNow();

    if (!state) {
      return NextResponse.json({
        eligible: true,
        reason: "NO_PREVIOUS_SUBSCRIPTION",
        remainingSeconds: 0,
      });
    }

    const remainingSeconds = Math.max(toNumber(state.lastEndTime) - now, 0);
    const active = state.status === "ACTIVE" && remainingSeconds > 0;

    return NextResponse.json({
      eligible: !active,
      reason: active ? "ACTIVE_SUBSCRIPTION" : "EXPIRED",
      remainingSeconds,
      lastEndTime: state.lastEndTime,
      status: active ? "ACTIVE" : "EXPIRED",
    });
  } catch (err) {
    console.error("[/api/subscription/eligibility]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
