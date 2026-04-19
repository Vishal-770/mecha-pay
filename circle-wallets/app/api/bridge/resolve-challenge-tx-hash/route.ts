import { NextRequest, NextResponse } from "next/server";
import { getCircleClient } from "@/lib/circleClient";

function isTxHash(value: unknown): value is `0x${string}` {
  return typeof value === "string" && /^0x[a-fA-F0-9]{64}$/.test(value);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      userToken?: string;
      challengeId?: string;
    };

    const { userToken, challengeId } = body;

    if (!userToken || !challengeId) {
      return NextResponse.json(
        { error: "userToken and challengeId are required" },
        { status: 400 },
      );
    }

    const client = getCircleClient();

    const challengeResponse = await client.getUserChallenge({
      userToken,
      challengeId,
    });

    const challenge = challengeResponse.data?.challenge;
    const transactionId = challenge?.correlationIds?.[0];

    if (!transactionId) {
      return NextResponse.json(
        { error: "Challenge does not include a correlated transaction ID" },
        { status: 404 },
      );
    }

    const transactionResponse = await client.getTransaction({
      userToken,
      id: transactionId,
    });

    const txHash = transactionResponse.data?.transaction?.txHash;

    if (!isTxHash(txHash)) {
      return NextResponse.json(
        { error: "Transaction hash is not available yet for this challenge" },
        { status: 404 },
      );
    }

    return NextResponse.json({ txHash, transactionId });
  } catch (err) {
    console.error("[/api/bridge/resolve-challenge-tx-hash]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
