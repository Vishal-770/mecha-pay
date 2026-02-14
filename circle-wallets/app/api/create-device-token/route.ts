/**
 * POST /api/create-device-token
 *
 * Server-side endpoint that calls the Circle API to create a device token
 * for the social-login flow.  Must be called BEFORE sdk.performLogin() so
 * the SDK has the deviceToken / deviceEncryptionKey it needs to complete the
 * Google OAuth challenge.
 *
 * Body: { deviceId: string }
 * Returns: { deviceToken: string; deviceEncryptionKey: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";
import { randomUUID } from "crypto";

// Lazily create the Circle server-side client (singleton per worker).
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
    const body = (await req.json()) as { deviceId?: string };
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: "deviceId is required" },
        { status: 400 },
      );
    }

    const client = getCircleClient();
    const response = await client.createDeviceTokenForSocialLogin({
      deviceId,
      idempotencyKey: randomUUID(), // unique per request
    });

    const data = response.data;

    if (!data?.deviceToken || !data?.deviceEncryptionKey) {
      return NextResponse.json(
        { error: "Circle API did not return device tokens" },
        { status: 502 },
      );
    }
    console.log(deviceId, data.deviceToken, data.deviceEncryptionKey);

    return NextResponse.json({
      deviceToken: data.deviceToken,
      deviceEncryptionKey: data.deviceEncryptionKey,
    });
  } catch (err) {
    console.error("[/api/create-device-token]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
