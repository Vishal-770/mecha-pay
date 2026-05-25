import express, { Request, Response } from "express";
import { PORT, SUBSCRIPTION_GATEWAY_ADDRESS } from "./config.js";
import { getDb } from "./db.js";
import { startOnChainWebhookListener } from "./watcher.js";
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
  console.log(`[Webhook Dispatcher] Standalone server listening on port ${PORT}`);
  
  try {
    console.log("Initializing database connection...");
    await getDb();
    console.log("Database connection successful.");
    
    // Start the on-chain watch worker
    await startOnChainWebhookListener();
  } catch (err) {
    console.error("Startup database connection failed:", err);
  }
  console.log("==================================================");
});
