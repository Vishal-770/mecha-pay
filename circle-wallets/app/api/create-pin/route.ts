/**
 * POST /api/create-pin
 *
 * Creates a challenge that lets the user set their PIN, security questions,
 * AND initialise their first wallet(s) in a single step — as an SCA.
 *
 * We call the Circle REST API directly (POST /v1/w3s/user/initialize) instead
 * of the SDK's createUserPinWithWallets because the SDK types don't expose
 * accountType and may silently strip it from the request.
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

    // Use the Circle REST API directly to guarantee accountType: "SCA" is sent.
    // POST /v1/w3s/user/initialize handles both PIN setup + wallet creation
    // in one step (equivalent to createUserPinWithWallets in the SDK).
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
      console.error("[/api/create-pin] Circle response:", circleJson);
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({ challengeId });
  } catch (err) {
    console.error("[/api/create-pin]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
