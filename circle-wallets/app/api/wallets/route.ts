/**
 * POST /api/wallets
 *
 * Returns ALL of the user's wallets plus ALL token balances for each.
 * The dashboard uses the selected chain to display relevant balances.
 *
 * Body: { userToken: string }
 * Returns: { wallets: Array<{ id, address, blockchain, state, custodyType, tokenBalances }> }
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
    const body = (await req.json()) as { userToken?: string };
    const { userToken } = body;

    if (!userToken) {
      return NextResponse.json(
        { error: "userToken is required" },
        { status: 400 },
      );
    }

    const client = getCircleClient();

    // 1. List all wallets for this user
    const walletsResponse = await client.listWallets({
      userToken,
    });

    const wallets = walletsResponse.data?.wallets ?? [];

    // 2. For each wallet get ALL token balances
    const walletsWithBalances = await Promise.all(
      wallets.map(async (wallet) => {
        try {
          const balanceResponse = await client.getWalletTokenBalance({
            walletId: wallet.id,
            userToken,
            includeAll: true,
          });

          const tokenBalances = (balanceResponse.data?.tokenBalances ?? []).map(
            (b) => ({
              amount: b.amount ?? "0",
              symbol: b.token?.symbol ?? "UNKNOWN",
              name: b.token?.name ?? "Unknown Token",
              tokenId: b.token?.id ?? "",
              isNative: b.token?.isNative ?? false,
            }),
          );

          return {
            id: wallet.id,
            address: wallet.address,
            blockchain: wallet.blockchain,
            state: wallet.state,
            custodyType: wallet.custodyType,
            tokenBalances,
          };
        } catch {
          return {
            id: wallet.id,
            address: wallet.address,
            blockchain: wallet.blockchain,
            state: wallet.state,
            custodyType: wallet.custodyType,
            tokenBalances: [],
          };
        }
      }),
    );

    return NextResponse.json({ wallets: walletsWithBalances });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
