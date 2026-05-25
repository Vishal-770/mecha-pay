import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

// Identify user using their Smart Account session ID (e.g. username or address)
async function getUserId(userToken: string) {
  if (!userToken) return null;
  return userToken.toLowerCase();
}

/**
 * GET /api/webhooks/logs?userToken=...&endpointId=...
 *
 * Retrieves the 50 most recent webhook logs for the logged-in user.
 */
export async function GET(req: NextRequest) {
  try {
    const userToken = req.nextUrl.searchParams.get("userToken");
    const endpointId = req.nextUrl.searchParams.get("endpointId");

    if (!userToken) {
      return NextResponse.json({ error: "userToken is required" }, { status: 400 });
    }

    const userId = await getUserId(userToken);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    const query: any = { userId };
    if (endpointId) {
      query.webhookEndpointId = endpointId;
    }

    // Retrieve the 50 most recent logs matching userId
    const logs = await db
      .collection("webhook_logs")
      .find(query)
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      logs: logs.map((l) => ({
        id: l._id.toString(),
        webhookEndpointId: l.webhookEndpointId,
        userId: l.userId,
        planId: l.planId,
        url: l.url,
        event: l.event,
        payload: l.payload,
        status: l.status,
        statusText: l.statusText,
        responseBody: l.responseBody,
        durationMs: l.durationMs,
        txHash: l.txHash,
        timestamp: l.timestamp,
      })),
    });
  } catch (err) {
    console.error("[GET /api/webhooks/logs]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
