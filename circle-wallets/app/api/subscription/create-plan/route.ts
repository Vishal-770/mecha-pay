import { NextRequest, NextResponse } from "next/server";
import { parseUnits } from "ethers";
import { getCircleClient } from "@/lib/circleClient";
import {
  HIGH_FEE,
  SUBSCRIPTION_GATEWAY_ADDRESS,
  normalizeIpfsUri,
} from "@/lib/subscription";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      userToken?: string;
      walletId?: string;
      price?: string;
      durationSeconds?: number;
      ipfsHash?: string;
    };

    const { userToken, walletId, price, durationSeconds, ipfsHash } = body;

    if (!userToken || !walletId || !price || !durationSeconds || !ipfsHash) {
      return NextResponse.json(
        {
          error:
            "userToken, walletId, price, durationSeconds, ipfsHash are required",
        },
        { status: 400 },
      );
    }

    if (durationSeconds <= 0 || !Number.isFinite(durationSeconds)) {
      return NextResponse.json(
        { error: "durationSeconds must be a positive number" },
        { status: 400 },
      );
    }

    const parsedPrice = parseFloat(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { error: "price must be a positive number" },
        { status: 400 },
      );
    }

    const amountIn6 = parseUnits(price, 6).toString();

    const client = getCircleClient();
    const response =
      await client.createUserTransactionContractExecutionChallenge({
        userToken,
        walletId,
        contractAddress: SUBSCRIPTION_GATEWAY_ADDRESS,
        abiFunctionSignature: "createPlan(uint256,uint32,string)",
        abiParameters: [amountIn6, durationSeconds, normalizeIpfsUri(ipfsHash)],
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
    console.error("[/api/subscription/create-plan]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
