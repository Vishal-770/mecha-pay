import { Router, Request, Response } from "express";
import { getDb } from "./db.js";
import { runAutoPaySweep } from "./sweeper.js";
import { SUBSCRIPTION_GATEWAY_ADDRESS } from "./config.js";

const router = Router();

// 1. System Status Endpoint
router.get("/status", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    
    // Test database connection by pinging
    await db.command({ ping: 1 });
    
    const totalCount = await db.collection("autopay_settings").countDocuments();
    const activeCount = await db.collection("autopay_settings").countDocuments({ enabled: true });

    res.json({
      status: "healthy",
      database: "connected",
      blockchain: "Arc Testnet (5042002)",
      verifyingContract: SUBSCRIPTION_GATEWAY_ADDRESS,
      metrics: {
        totalPreAuthorizations: totalCount,
        activePreAuthorizations: activeCount,
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

// 2. Manual Trigger Endpoint
router.post("/trigger", async (req: Request, res: Response) => {
  try {
    const sweepData = await runAutoPaySweep();
    res.json({
      success: true,
      sweepData,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

export default router;
