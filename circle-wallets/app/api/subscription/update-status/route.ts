import { NextRequest, NextResponse } from "next/server";
import { getCircleClient } from "@/lib/circleClient";
import { HIGH_FEE, SUBSCRIPTION_GATEWAY_ADDRESS } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      userToken?: string;
      walletId?: string;
      planId?: string;
      active?: boolean;
    };

    const { userToken, walletId, planId, active } = body;

    if (!userToken || !walletId || !planId || active === undefined) {
      return NextResponse.json(
        { error: "userToken, walletId, planId, and active status are required" },
        { status: 400 },
      );
    }

    if (!/^0x[a-fA-F0-9]{64}$/.test(planId)) {
      return NextResponse.json(
        { error: "planId must be bytes32 hex" },
        { status: 400 },
      );
    }

    const client = getCircleClient();
    const response =
      await client.createUserTransactionContractExecutionChallenge({
        userToken,
        walletId,
        contractAddress: SUBSCRIPTION_GATEWAY_ADDRESS,
        abiFunctionSignature: "setPlanStatus(bytes32,bool)",
        abiParameters: [planId, active],
        fee: HIGH_FEE,
      });

    const challengeId = response.data?.challengeId;

    if (!challengeId) {
      return NextResponse.json(
        { error: "No challengeId returned by Circle" },
        { status: 500 },
      );
    }

    return NextResponse.json({ challengeId });
  } catch (err) {
    console.error("[/api/subscription/update-status]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
