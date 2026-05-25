import { Router, Request, Response } from "express";
import crypto from "crypto";
import { getDb } from "./db.js";
import { WebhookEndpoint } from "./types.js";
import { SUBSCRIPTION_GATEWAY_ADDRESS } from "./config.js";

const router = Router();

// 1. Register/Update Webhook Endpoint
router.post("/webhooks/register", async (req: Request, res: Response) => {
  try {
    const { sellerAddress, webhookUrl } = req.body;

    if (!sellerAddress || !webhookUrl) {
      return res.status(400).json({ error: "sellerAddress and webhookUrl are required." });
    }

    // Verify webhookUrl format
    if (!webhookUrl.startsWith("http://") && !webhookUrl.startsWith("https://")) {
      return res.status(400).json({ error: "webhookUrl must be a valid HTTP or HTTPS address." });
    }

    const db = await getDb();
    const sellerLower = sellerAddress.toLowerCase();

    // Check if merchant already exists
    const existing = await db
      .collection<WebhookEndpoint>("webhook_endpoints")
      .findOne({ userId: sellerLower, planId: "all" });

    if (existing) {
      // Update URL
      await db.collection("webhook_endpoints").updateOne(
        { userId: sellerLower, planId: "all" },
        {
          $set: {
            url: webhookUrl,
            updatedAt: new Date(),
          },
        }
      );

      return res.json({
        success: true,
        message: "Webhook URL successfully updated.",
        sellerAddress: sellerLower,
        webhookUrl: webhookUrl,
        webhookSecret: existing.secret, // Kept the same secret
      });
    }

    // Create a new secure HMAC secret for this merchant
    const webhookSecret = `whsec_${crypto.randomBytes(24).toString("hex")}`;

    const newSub: WebhookEndpoint = {
      userId: sellerLower,
      planId: "all",
      url: webhookUrl,
      secret: webhookSecret,
      events: ["payment.succeeded"],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("webhook_endpoints").insertOne(newSub);

    res.json({
      success: true,
      message: "Webhook successfully registered. Guard this secret safely in your server!",
      sellerAddress: sellerLower,
      webhookUrl: webhookUrl,
      webhookSecret: webhookSecret,
    });

  } catch (err) {
    console.error("[POST /webhooks/register] Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 2. Status Endpoint
router.get("/status", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });

    const totalEndpoints = await db.collection("webhook_endpoints").countDocuments();
    const totalLogs = await db.collection("webhook_logs").countDocuments();

    res.json({
      status: "healthy",
      database: "connected",
      blockchainListener: "active",
      listeningToContract: SUBSCRIPTION_GATEWAY_ADDRESS,
      metrics: {
        registeredWebhooks: totalEndpoints,
        deliveryLogsSaved: totalLogs,
      },
      time: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

export default router;
