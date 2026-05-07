import { NextRequest, NextResponse } from "next/server";
import { getCircleClient } from "@/lib/circleClient";
import { HIGH_FEE, SUBSCRIPTION_GATEWAY_ADDRESS, normalizeIpfsUri } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      userToken?: string;
      walletId?: string;
      planId?: string;
      durationSeconds?: number;
      ipfsHash?: string;
    };

    const { userToken, walletId, planId, durationSeconds, ipfsHash } = body;

    if (!userToken || !walletId || !planId || !durationSeconds || !ipfsHash) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (durationSeconds <= 0 || !Number.isFinite(durationSeconds)) {
      return NextResponse.json({ error: "durationSeconds must be a positive number" }, { status: 400 });
    }

    const client = getCircleClient();
    const response = await client.createUserTransactionContractExecutionChallenge({
      userToken,
      walletId,
      contractAddress: SUBSCRIPTION_GATEWAY_ADDRESS,
      abiFunctionSignature: "updatePlanMetadata(bytes32,uint32,string)",
      abiParameters: [
        planId,
        durationSeconds,
        normalizeIpfsUri(ipfsHash)
      ],
      fee: HIGH_FEE,
    });

    const challengeId = response.data?.challengeId;

    if (!challengeId) return NextResponse.json({ error: "No challengeId" }, { status: 500 });
    return NextResponse.json({ challengeId });
  } catch (err) {
    console.error("[/api/subscription/update-plan]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
