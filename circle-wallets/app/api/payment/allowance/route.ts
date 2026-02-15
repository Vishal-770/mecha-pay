import { NextRequest, NextResponse } from "next/server";
import { Contract, JsonRpcProvider } from "ethers";
import {
  ARC_RPC_URL,
  ARC_USDC_ADDRESS,
  SUBSCRIPTION_GATEWAY_ADDRESS,
} from "@/lib/subscription";

const erc20Abi = [
  "function allowance(address owner, address spender) view returns (uint256)",
];

function isAddressLike(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      owner?: string;
    };

    if (!body.owner || !isAddressLike(body.owner)) {
      return NextResponse.json(
        { error: "owner address is required" },
        { status: 400 },
      );
    }

    const provider = new JsonRpcProvider(ARC_RPC_URL);
    const usdc = new Contract(ARC_USDC_ADDRESS, erc20Abi, provider);

    const allowance = await usdc.allowance(
      body.owner,
      SUBSCRIPTION_GATEWAY_ADDRESS,
    );
    return NextResponse.json({ allowance: allowance.toString() });
  } catch (err) {
    console.error("[/api/payment/allowance]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
