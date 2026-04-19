import { NextRequest, NextResponse } from "next/server";
import { getCircleClient } from "@/lib/circleClient";

const RESOLVE_TX_HASH_MAX_ATTEMPTS = 12;
const RESOLVE_TX_HASH_INTERVAL_MS = 1500;

function isTxHash(value: unknown): value is `0x${string}` {
  return typeof value === "string" && /^0x[a-fA-F0-9]{64}$/.test(value);
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

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

    for (let attempt = 1; attempt <= RESOLVE_TX_HASH_MAX_ATTEMPTS; attempt++) {
      const challengeResponse = await client.getUserChallenge({
        userToken,
        challengeId,
      });

      const challenge = challengeResponse.data?.challenge;
      const challengeStatus = String(challenge?.status ?? "").toUpperCase();
      const transactionId = challenge?.correlationIds?.[0];

      if (challengeStatus === "FAILED") {
        return NextResponse.json(
          {
            error:
              challenge?.errorMessage ||
              "Circle challenge failed before transaction submission",
            challengeStatus,
          },
          { status: 422 },
        );
      }

      if (transactionId) {
        const transactionResponse = await client.getTransaction({
          userToken,
          id: transactionId,
        });

        const txHash = transactionResponse.data?.transaction?.txHash;
        if (isTxHash(txHash)) {
          return NextResponse.json({ txHash, transactionId });
        }
      }

      if (attempt < RESOLVE_TX_HASH_MAX_ATTEMPTS) {
        await sleep(RESOLVE_TX_HASH_INTERVAL_MS);
      }
    }

    return NextResponse.json(
      {
        error:
          "Transaction hash is not available yet for this challenge. Please retry in a few seconds.",
      },
      { status: 404 },
    );
  } catch (err) {
    console.error("[/api/bridge/resolve-challenge-tx-hash]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
