import { NextRequest, NextResponse } from "next/server";
import { parseUnits } from "ethers";
import { getCircleClient } from "@/lib/circleClient";
import { CCTP_CONFIG } from "@/lib/bridge_config";
import { ARC_USDC_ADDRESS } from "@/lib/subscription";

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
      amount?: string;
    };

    const { userToken, walletId, amount } = body;

    if (!userToken || !walletId || !amount) {
      return NextResponse.json(
        { error: "userToken, walletId, amount are required" },
        { status: 400 },
      );
    }

    const parsed = parseFloat(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return NextResponse.json(
        { error: "amount must be a positive number" },
        { status: 400 },
      );
    }

    const amountIn6 = parseUnits(amount, 6).toString();
    const spender = CCTP_CONFIG.Arc_Testnet.messenger;

    const client = getCircleClient();
    const response =
      await client.createUserTransactionContractExecutionChallenge({
        userToken,
        walletId,
        contractAddress: ARC_USDC_ADDRESS,
        abiFunctionSignature: "approve(address,uint256)",
        abiParameters: [spender, amountIn6],
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
    console.error("[/api/bridge/prepare-approve]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
