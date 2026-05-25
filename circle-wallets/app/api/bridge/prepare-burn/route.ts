import { NextRequest, NextResponse } from "next/server";
import { parseUnits } from "ethers";
import { getCircleClient } from "@/lib/circleClient";
import { CCTP_CONFIG, type BridgeChain } from "@/lib/bridge_config";
import { ARC_USDC_ADDRESS } from "@/lib/subscription";

const BRIDGE_FEE = {
  type: "level" as const,
  config: {
    feeLevel: "MEDIUM" as const,
  },
};

const CCTP_DESTINATION_CALLER_ZERO =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const CCTP_DEFAULT_MAX_FEE = "0";
const CCTP_MIN_FINALITY_THRESHOLD = 1000;

function toRecipientBytes32(recipient: string) {
  return `0x000000000000000000000000${recipient.slice(2).toLowerCase()}`;
}

function isBridgeChain(value: string): value is BridgeChain {
  return value in CCTP_CONFIG;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      userToken?: string;
      walletId?: string;
      amount?: string;
      destinationChain?: string;
      recipientAddress?: string;
    };

    const { userToken, walletId, amount, destinationChain, recipientAddress } =
      body;

    if (
      !userToken ||
      !walletId ||
      !amount ||
      !destinationChain ||
      !recipientAddress
    ) {
      return NextResponse.json(
        {
          error:
            "userToken, walletId, amount, destinationChain, recipientAddress are required",
        },
        { status: 400 },
      );
    }

    if (!isBridgeChain(destinationChain)) {
      return NextResponse.json(
        { error: "Unsupported destinationChain" },
        { status: 400 },
      );
    }

    if (destinationChain === "Arc_Testnet") {
      return NextResponse.json(
        { error: "destinationChain cannot be Arc_Testnet for Arc source burn" },
        { status: 400 },
      );
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      return NextResponse.json(
        { error: "recipientAddress must be a valid EVM address" },
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
    const destinationDomain = CCTP_CONFIG[destinationChain].domain;
    const recipientBytes32 = toRecipientBytes32(recipientAddress);

    const client = getCircleClient();
    const response =
      await client.createUserTransactionContractExecutionChallenge({
        userToken,
        walletId,
        contractAddress: CCTP_CONFIG.Arc_Testnet.messenger,
        abiFunctionSignature:
          "depositForBurn(uint256,uint32,bytes32,address,bytes32,uint256,uint32)",
        abiParameters: [
          amountIn6,
          destinationDomain.toString(),
          recipientBytes32,
          ARC_USDC_ADDRESS,
          CCTP_DESTINATION_CALLER_ZERO,
          CCTP_DEFAULT_MAX_FEE,
          CCTP_MIN_FINALITY_THRESHOLD.toString(),
        ],
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
    console.error("[/api/bridge/prepare-burn]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
