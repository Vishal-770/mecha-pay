import { NextRequest, NextResponse } from "next/server";
import { getCircleClient } from "@/lib/circleClient";
import { HIGH_FEE, SUBSCRIPTION_GATEWAY_ADDRESS } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      userToken?: string;
      walletId?: string;
      newFeeBps?: number;
    };

    const { userToken, walletId, newFeeBps } = body;

    if (!userToken || !walletId || newFeeBps === undefined) {
      return NextResponse.json(
        { error: "userToken, walletId, and newFeeBps are required" },
        { status: 400 },
      );
    }

    if (newFeeBps < 0 || newFeeBps > 1000) {
      return NextResponse.json(
        { error: "Fee must be between 0 and 1000 (10%)" },
        { status: 400 },
      );
    }

    const client = getCircleClient();
    const response =
      await client.createUserTransactionContractExecutionChallenge({
        userToken,
        walletId,
        contractAddress: SUBSCRIPTION_GATEWAY_ADDRESS,
        abiFunctionSignature: "setFee(uint256)",
        abiParameters: [newFeeBps.toString()],
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
    console.error("[/api/admin/set-fee]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
