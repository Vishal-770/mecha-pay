/**
 * POST /api/wallets
 *
 * Returns ALL of the user's wallets plus ALL token balances for each.
 * The dashboard uses the selected chain to display relevant balances.
 *
 * Wallet account type (EOA vs SCA) is determined by checking onchain bytecode:
 * - eth_getCode returns "0x"  -> EOA  (no contract deployed at address)
 * - eth_getCode returns code  -> SCA  (smart contract account)
 *
 * Body: { userToken: string }
 * Returns: { wallets: Array<{ id, address, blockchain, state, custodyType, accountType, tokenBalances }> }
 */

import { NextRequest, NextResponse } from "next/server";
import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";

const ARC_RPC = "https://rpc.testnet.arc.network";

// Map Circle blockchain identifiers to their RPC URLs
const CHAIN_RPC: Record<string, string> = {
  "ARC-TESTNET": ARC_RPC,
};

/** Returns "SCA" if bytecode is deployed at address, "EOA" otherwise */
async function getOnchainAccountType(address: string, blockchain: string): Promise<string> {
  const rpc = CHAIN_RPC[blockchain];
  if (!rpc || !address) return "EOA";
  try {
    const res = await fetch(rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getCode",
        params: [address, "latest"],
        id: 1,
      }),
    });
    const json = await res.json() as { result?: string };
    // "0x" means no bytecode => EOA; anything else => smart contract
    return json.result && json.result !== "0x" ? "SCA" : "EOA";
  } catch {
    return "EOA";
  }
}

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
    const walletsResponse = await client.listWallets({ userToken });
    const wallets = walletsResponse.data?.wallets ?? [];

    // 2. For each wallet: fetch token balances + check onchain account type in parallel
    const walletsWithBalances = await Promise.all(
      wallets.map(async (wallet) => {
        const [balanceResponse, accountType] = await Promise.allSettled([
          client.getWalletTokenBalance({
            walletId: wallet.id,
            userToken,
            includeAll: true,
          }),
          getOnchainAccountType(wallet.address ?? "", wallet.blockchain ?? ""),
        ]);

        const tokenBalances =
          balanceResponse.status === "fulfilled"
            ? (balanceResponse.value.data?.tokenBalances ?? []).map((b) => ({
                amount: b.amount ?? "0",
                symbol: b.token?.symbol ?? "UNKNOWN",
                name: b.token?.name ?? "Unknown Token",
                tokenId: b.token?.id ?? "",
                isNative: b.token?.isNative ?? false,
              }))
            : [];

        return {
          id: wallet.id,
          address: wallet.address,
          blockchain: wallet.blockchain,
          state: wallet.state,
          custodyType: wallet.custodyType,
          accountType: accountType.status === "fulfilled" ? accountType.value : "EOA",
          tokenBalances,
        };
      }),
    );

    return NextResponse.json({ wallets: walletsWithBalances });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

