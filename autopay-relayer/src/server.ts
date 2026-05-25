import express, { Request, Response } from "express";
import { PORT, SUBSCRIPTION_GATEWAY_ADDRESS } from "./config.js";
import { getDb } from "./db.js";
import { runAutoPaySweep } from "./sweeper.js";
import router from "./routes.js";

const app = express();
app.use(express.json());

// Register modular routes
app.use("/", router);

// Fallback Route
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found." });
});

// Server Startup
app.listen(PORT, async () => {
  console.log("==================================================");
  console.log(`[AutoPay Relayer] TS Standalone server listening on port ${PORT}`);
  console.log(`Targeting SubscriptionGateway: ${SUBSCRIPTION_GATEWAY_ADDRESS}`);
  
  try {
    console.log("Initializing database connection pool...");
    await getDb();
    console.log("Database connection pool established successfully.");
    
    // Run an initial sweep immediately on boot
    runAutoPaySweep().catch((err) => console.error("[Startup Sweep Failed]:", err));
    
    // Set up standard 1-hour sweep interval loop (3,600,000 milliseconds)
    const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL_MS || "") || 60 * 60 * 1000;
    console.log(`Background worker registered: sweeping every ${CHECK_INTERVAL / 1000 / 60} minutes.`);
    setInterval(() => {
      runAutoPaySweep().catch((err) => console.error("[Interval Sweep Failed]:", err));
    }, CHECK_INTERVAL);

  } catch (err) {
    console.error("Startup database connection failed:", err);
  }
  console.log("==================================================");
});
