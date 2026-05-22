/**
 * POST /api/initialize-wallet
 *
 * Creates an "initialize wallet" challenge for the given user.
 * The client then calls sdk.execute(challengeId) to complete the
 * wallet creation flow (user sets PIN / biometrics in the Circle UI).
 *
 * We call the Circle REST API directly (not the SDK) to guarantee
 * accountType: "SCA" is included in the request — the SDK TypeScript
 * types don't expose accountType so the SDK may silently drop it.
 *
 * Body:    { userToken: string; blockchains?: string[] }
 * Returns: { challengeId: string }
 */

import { NextRequest, NextResponse } from "next/server";

const CIRCLE_BASE_URL = "https://api.circle.com";
const DEFAULT_BLOCKCHAINS = ["ARC-TESTNET"];

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

    const apiKey = process.env.CIRCLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "CIRCLE_API_KEY not configured" },
        { status: 500 },
      );
    }

    // Call Circle REST API directly to ensure accountType: "SCA" is sent.
    // The SDK's TypeScript types don't expose accountType so we bypass the SDK.
    const circleRes = await fetch(
      `${CIRCLE_BASE_URL}/v1/w3s/user/initialize`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "X-User-Token": userToken,
        },
        body: JSON.stringify({
          idempotencyKey: crypto.randomUUID(),
          accountType: "SCA",
          blockchains,
        }),
      },
    );

    const circleJson = await circleRes.json() as {
      data?: { challengeId?: string };
      code?: number;
      message?: string;
    };

    const challengeId = circleJson.data?.challengeId;

    if (!challengeId) {
      const msg = circleJson.message ?? "No challengeId returned from Circle";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({ challengeId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
