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
      durationSeconds?: number;
      ipfsHash?: string;
      tiers?: { price: string; label: string }[];
    };

    const { userToken, walletId, durationSeconds, ipfsHash, tiers } = body;

    if (
      !userToken ||
      !walletId ||
      !durationSeconds ||
      !ipfsHash ||
      !tiers ||
      tiers.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "userToken, walletId, durationSeconds, ipfsHash, and at least one tier are required",
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

    // Format tiers for contract: prices[] and labels[]
    const prices = tiers.map((t) => parseUnits(t.price, 6).toString());
    const labels = tiers.map((t) => t.label);

    const client = getCircleClient();
    const response =
      await client.createUserTransactionContractExecutionChallenge({
        userToken,
        walletId,
        contractAddress: SUBSCRIPTION_GATEWAY_ADDRESS,
        abiFunctionSignature: "createPlan(uint32,string,uint256[],string[])",
        abiParameters: [
          durationSeconds,
          normalizeIpfsUri(ipfsHash),
          prices,
          labels,
        ],
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
