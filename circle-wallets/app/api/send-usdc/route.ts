/**
 * POST /api/send-usdc
 *
 * Creates a transfer transaction challenge for sending USDC.
 * The client then calls sdk.execute(challengeId) to confirm via PIN.
 *
 * Body:    { userToken, walletId, tokenId, destinationAddress, amount }
 * Returns: { challengeId }
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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      userToken?: string;
      walletId?: string;
      tokenId?: string;
      destinationAddress?: string;
      amount?: string;
    };

    const { userToken, walletId, tokenId, destinationAddress, amount } = body;

    if (!userToken || !walletId || !destinationAddress || !amount) {
      return NextResponse.json(
        { error: "userToken, walletId, destinationAddress, and amount are required" },
        { status: 400 },
      );
    }

    if (!tokenId) {
      return NextResponse.json(
        { error: "tokenId is required (USDC token ID)" },
        { status: 400 },
      );
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 },
      );
    }

    const client = getCircleClient();

    const response = await client.createTransaction({
      userToken,
      walletId,
      tokenId,
      amounts: [amount],
      destinationAddress,
      fee: {
        type: "level",
        config: {
          feeLevel: "HIGH",
        },
      },
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
    console.error("[/api/send-usdc]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
