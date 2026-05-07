import { NextRequest, NextResponse } from "next/server";
import { getCircleClient } from "@/lib/circleClient";
import { HIGH_FEE, SUBSCRIPTION_GATEWAY_ADDRESS } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      userToken?: string;
      walletId?: string;
      planId?: string;
      tierId?: string;
      buyerData?: string;
    };

    const { userToken, walletId, planId, tierId, buyerData } = body;

    if (!userToken || !walletId || !planId || tierId === undefined || !buyerData) {
      return NextResponse.json(
        { error: "userToken, walletId, planId, tierId, buyerData are required" },
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
        abiFunctionSignature: "subscribe(bytes32,uint256,string)",
        abiParameters: [planId, tierId.toString(), buyerData],
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
    console.error("[/api/subscription/subscribe]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
