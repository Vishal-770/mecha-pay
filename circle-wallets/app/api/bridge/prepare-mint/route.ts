import { NextRequest, NextResponse } from "next/server";
import { getCircleClient } from "@/lib/circleClient";
import { MESSAGE_TRANSMITTER_ADDRESS } from "@/lib/bridge_config";

const BRIDGE_FEE = {
  type: "level" as const,
  config: {
    feeLevel: "MEDIUM" as const,
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      userToken?: string;
      walletId?: string;
      message?: string;
      attestation?: string;
    };

    const { userToken, walletId, message, attestation } = body;

    if (!userToken || !walletId || !message || !attestation) {
      return NextResponse.json(
        { error: "userToken, walletId, message, attestation are required" },
        { status: 400 },
      );
    }

    if (!/^0x[a-fA-F0-9]+$/.test(message) || message.length < 4) {
      return NextResponse.json(
        { error: "message must be a valid hex string" },
        { status: 400 },
      );
    }

    if (!/^0x[a-fA-F0-9]+$/.test(attestation) || attestation.length < 4) {
      return NextResponse.json(
        { error: "attestation must be a valid hex string" },
        { status: 400 },
      );
    }

    const client = getCircleClient();
    const response =
      await client.createUserTransactionContractExecutionChallenge({
        userToken,
        walletId,
        contractAddress: MESSAGE_TRANSMITTER_ADDRESS,
        abiFunctionSignature: "receiveMessage(bytes,bytes)",
        abiParameters: [message, attestation],
        fee: BRIDGE_FEE,
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
    console.error("[/api/bridge/prepare-mint]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
