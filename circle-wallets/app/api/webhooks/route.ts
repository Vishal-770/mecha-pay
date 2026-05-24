import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { querySubgraph } from "@/lib/subgraph";
import { getUserAddresses } from "@/lib/auth-util";
import crypto from "crypto";

// Identify user using their Smart Account session ID (e.g. username or address)
async function getUserId(userToken: string) {
  if (!userToken) return null;
  return userToken.toLowerCase();
}

/**
 * Check if the user owns the specified planId via the Subgraph.
 */
async function verifyPlanOwnership(userToken: string, planId: string): Promise<boolean> {
  if (planId === "all") return false;

  try {
    const userAddresses = await getUserAddresses(userToken);
    if (userAddresses.length === 0) return false;

    const planQuery = `
      query GetPlan($id: ID!) {
        plan(id: $id) {
          id
          seller {
            id
          }
        }
      }
    `;

    const data = await querySubgraph<{ plan: { id: string; seller: { id: string } } | null }>(
      planQuery,
      { id: planId.toLowerCase() }
    );

    const plan = data?.plan;
    if (!plan) return false;

    return userAddresses.includes(plan.seller.id.toLowerCase());
  } catch (err) {
    console.error("[verifyPlanOwnership]", err);
    return false;
  }
}

/**
 * GET /api/webhooks?userToken=...
 *
 * Retrieves all webhooks for the logged-in user.
 */
export async function GET(req: NextRequest) {
  try {
    const userToken = req.nextUrl.searchParams.get("userToken");
    if (!userToken) {
      return NextResponse.json({ error: "userToken is required" }, { status: 400 });
    }

    const userId = await getUserId(userToken);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const webhooks = await db
      .collection("webhook_endpoints")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      webhooks: webhooks.map((w) => ({
        id: w._id.toString(),
        userId: w.userId,
        planId: w.planId,
        url: w.url,
        secret: w.secret,
        events: w.events,
        isActive: w.isActive,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      })),
    });
  } catch (err) {
    console.error("[GET /api/webhooks]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/webhooks
 *
 * Creates a new webhook endpoint. Enforces single webhook per plan per user.
 * Body: { userToken: string, url: string, planId: string, isActive?: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userToken, url, planId, isActive = true } = body;

    if (!userToken || !url || !planId) {
      return NextResponse.json({ error: "userToken, url, and planId are required" }, { status: 400 });
    }

    // Validate HTTPS url
    try {
      const parsedUrl = new URL(url.trim());
      if (parsedUrl.protocol !== "https:") {
        return NextResponse.json({ error: "Destination URL must use the HTTPS protocol" }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({ error: "Invalid Destination URL format" }, { status: 400 });
    }

    const userId = await getUserId(userToken);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Plan ownership check
    const isOwner = await verifyPlanOwnership(userToken, planId);
    if (!isOwner) {
      return NextResponse.json(
        { error: "Access Denied: You do not own the plan specified." },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();

    // Check unique webhook per plan constraint
    const existing = await db
      .collection("webhook_endpoints")
      .findOne({ userId, planId: planId.toLowerCase() });

    if (existing) {
      return NextResponse.json(
        { error: "A webhook is already configured for this plan. You may edit or delete it." },
        { status: 400 }
      );
    }

    // Generate secret
    const secret = `whsec_${crypto.randomBytes(24).toString("hex")}`;
    const newWebhook = {
      userId,
      planId: planId.toLowerCase(),
      url,
      secret,
      events: ["payment.succeeded"], // exclusively subscribed to payment.succeeded
      isActive: !!isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("webhook_endpoints").insertOne(newWebhook);

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...newWebhook,
    });
  } catch (err) {
    console.error("[POST /api/webhooks]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PUT /api/webhooks
 *
 * Updates an existing webhook endpoint's URL, Plan ID, or active status.
 * Body: { userToken: string, id: string, url: string, planId: string, isActive: boolean }
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userToken, id, url, planId, isActive } = body;

    if (!userToken || !id || !url || !planId || isActive === undefined) {
      return NextResponse.json(
        { error: "userToken, id, url, planId, and isActive are required" },
        { status: 400 }
      );
    }

    // Validate HTTPS url
    try {
      const parsedUrl = new URL(url.trim());
      if (parsedUrl.protocol !== "https:") {
        return NextResponse.json({ error: "Destination URL must use the HTTPS protocol" }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({ error: "Invalid Destination URL format" }, { status: 400 });
    }

    const userId = await getUserId(userToken);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Plan ownership check
    const isOwner = await verifyPlanOwnership(userToken, planId);
    if (!isOwner) {
      return NextResponse.json(
        { error: "Access Denied: You do not own the plan specified." },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();

    // Verify webhook ownership and exists
    const webhookObjectId = new ObjectId(id);
    const targetWebhook = await db
      .collection("webhook_endpoints")
      .findOne({ _id: webhookObjectId, userId });

    if (!targetWebhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    // Check unique webhook per plan constraint if they are changing the plan ID
    if (targetWebhook.planId !== planId.toLowerCase()) {
      const duplicate = await db
        .collection("webhook_endpoints")
        .findOne({ userId, planId: planId.toLowerCase() });

      if (duplicate) {
        return NextResponse.json(
          { error: "A webhook is already configured for the new plan choice." },
          { status: 400 }
        );
      }
    }

    const updateDoc = {
      $set: {
        planId: planId.toLowerCase(),
        url,
        isActive: !!isActive,
        updatedAt: new Date(),
      },
    };

    await db.collection("webhook_endpoints").updateOne({ _id: webhookObjectId, userId }, updateDoc);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PUT /api/webhooks]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/webhooks?userToken=...&id=...
 *
 * Deletes a webhook endpoint.
 */
export async function DELETE(req: NextRequest) {
  try {
    const userToken = req.nextUrl.searchParams.get("userToken");
    const id = req.nextUrl.searchParams.get("id");

    if (!userToken || !id) {
      return NextResponse.json({ error: "userToken and id are required" }, { status: 400 });
    }

    const userId = await getUserId(userToken);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection("webhook_endpoints").deleteOne({
      _id: new ObjectId(id),
      userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/webhooks]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
