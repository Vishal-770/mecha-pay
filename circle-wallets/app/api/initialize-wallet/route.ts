/**
 * POST /api/initialize-wallet
 *
 * Creates an "initialize wallet" challenge for the given user.
 * The client then calls sdk.execute(challengeId) to complete the
 * wallet creation flow (user sets PIN / biometrics in the Circle UI).
 *
 * Body:    { userToken: string; blockchains?: string[] }
 * Returns: { challengeId: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";

let circleClient: ReturnType<
  typeof initiateUserControlledWalletsClient
> | null = null;

function getCircleClient() {
  if (!circleClient) {
    circleClient = initiateUserControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY!,
    });
  }
  return circleClient;
}

const DEFAULT_BLOCKCHAINS = ["ARC-TESTNET"] as const;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      userToken?: string;
      blockchains?: string[];
    };

    const { userToken, blockchains = DEFAULT_BLOCKCHAINS } = body;

    if (!userToken) {
      return NextResponse.json(
        { error: "userToken is required" },
        { status: 400 },
      );
    }

    const client = getCircleClient();

    // createWallet returns a challengeId the client SDK must execute.
    const response = await client.createWallet({
      userToken,
      blockchains: blockchains as Parameters<
        typeof client.createWallet
      >[0]["blockchains"],
    });

    const challengeId = response.data?.challengeId;

    if (!challengeId) {
      return NextResponse.json(
        { error: "No challengeId returned from Circle" },
        { status: 500 },
      );
    }

    return NextResponse.json({ challengeId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
