import { NextRequest, NextResponse } from "next/server";
import { getCircleClient } from "@/lib/circleClient";
import { HIGH_FEE, SUBSCRIPTION_GATEWAY_ADDRESS } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      userToken?: string;
      walletId?: string;
      to?: string;
      amount?: string;
    };

    const { userToken, walletId, to, amount } = body;

    if (!userToken || !walletId || !to || !amount) {
      return NextResponse.json(
        { error: "userToken, walletId, to, and amount are required" },
        { status: 400 },
      );
    }

    const client = getCircleClient();
    const response =
      await client.createUserTransactionContractExecutionChallenge({
        userToken,
        walletId,
        contractAddress: SUBSCRIPTION_GATEWAY_ADDRESS,
        abiFunctionSignature: "withdrawFees(address,uint256)",
        abiParameters: [to, amount],
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
    console.error("[/api/admin/withdraw]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
