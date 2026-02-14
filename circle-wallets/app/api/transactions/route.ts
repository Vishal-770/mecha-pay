/**
 * POST /api/transactions
 *
 * Retrieves a list of transactions for a user's wallet.
 *
 * Body:    { userToken: string, walletIds: string[] }
 * Returns: { transactions: Transaction[] }
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
      walletIds?: string[];
    };

    const { userToken, walletIds } = body;

    if (!userToken) {
      return NextResponse.json(
        { error: "userToken is required" },
        { status: 400 },
      );
    }

    if (!walletIds || !Array.isArray(walletIds) || walletIds.length === 0) {
      return NextResponse.json(
        { error: "walletIds array is required" },
        { status: 400 },
      );
    }

    const client = getCircleClient();

    const response = await client.listTransactions({
      userToken,
      walletIds,
    });

    return NextResponse.json({
      transactions: response.data?.transactions ?? [],
    });
  } catch (err) {
    console.error("[/api/transactions]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
