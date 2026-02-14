/**
 * POST /api/user-status
 *
 * Returns the current user's PIN and security-question status.
 * The dashboard / setup-pin page uses this to decide whether the
 * user still needs to go through PIN initialisation.
 *
 * Body:    { userToken: string }
 * Returns: { pinStatus, securityQuestionStatus, id, createDate }
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
    const response = await client.getUserStatus({ userToken });

    const user = response.data;

    return NextResponse.json({
      id: user?.id,
      pinStatus: user?.pinStatus,
      securityQuestionStatus: user?.securityQuestionStatus,
      createDate: user?.createDate,
    });
  } catch (err) {
    console.error("[/api/user-status]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
