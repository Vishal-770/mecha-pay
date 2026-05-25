import { createPublicClient, http, Hex } from "viem";
import crypto from "crypto";
import { getDb } from "./db.js";
import { WebhookEndpoint } from "./types.js";
import {
  arcTestnet,
  ARC_RPC_URL,
  SUBSCRIPTION_GATEWAY_ADDRESS
} from "./config.js";

export const gatewayAbi = [
  {
    name: "Subscribed",
    type: "event",
    anonymous: false,
    inputs: [
      { name: "subscriber", type: "address", indexed: true },
      { name: "seller", type: "address", indexed: true },
      { name: "planId", type: "bytes32", indexed: true },
      { name: "tierId", type: "uint256", indexed: false },
      { name: "totalAmount", type: "uint256", indexed: false },
      { name: "feeAmount", type: "uint256", indexed: false },
      { name: "buyerData", type: "string", indexed: false },
      { name: "startTime", type: "uint32", indexed: false },
      { name: "endTime", type: "uint32", indexed: false },
    ],
  },
] as const;

export async function startOnChainWebhookListener() {
  console.log(`[Webhook Worker] Initializing real-time on-chain event listener on Arc Testnet...`);
  
  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(ARC_RPC_URL),
  });

  try {
    const db = await getDb();

    // Start watching Subscribed events in real-time
    publicClient.watchContractEvent({
      address: SUBSCRIPTION_GATEWAY_ADDRESS,
      abi: gatewayAbi,
      eventName: "Subscribed",
      onLogs: async (logs) => {
        for (const log of logs) {
          const txHash = log.transactionHash;
          const { subscriber, seller, planId, tierId, totalAmount, feeAmount, buyerData, startTime, endTime } = log.args;

          if (
            !subscriber ||
            !seller ||
            !planId ||
            tierId === undefined ||
            totalAmount === undefined ||
            feeAmount === undefined
          ) {
            continue;
          }

          const logPrefix = `[Event][Tx: ${txHash?.slice(0, 10)}...]`;
          console.log(`${logPrefix} Caught Subscribed event from contract. Subscriber: ${subscriber}, Seller: ${seller}`);

          try {
            // Find registered webhook settings for this specific plan in webhook_endpoints
            const planIdLower = planId.toLowerCase();
            const endpoint = await db
              .collection<WebhookEndpoint>("webhook_endpoints")
              .findOne({ planId: planIdLower, isActive: true });

            if (!endpoint) {
              console.log(`${logPrefix} No active webhook registered for plan ${planId}. Skipping.`);
              continue;
            }

            console.log(`${logPrefix} Webhook URL found: ${endpoint.url}. Constructing payload...`);

            // Construct secure webhook payload
            const payload = {
              id: `evt_${crypto.randomBytes(12).toString("hex")}`,
              type: "subscription.settled",
              created: Math.floor(Date.now() / 1000),
              data: {
                subscriber: subscriber,
                seller: seller,
                planId: planId,
                tierId: tierId.toString(),
                totalAmount: totalAmount.toString(),
                feeAmount: feeAmount.toString(),
                buyerData: buyerData || "",
                startTime: Number(startTime),
                endTime: Number(endTime),
                txHash: txHash,
              },
            };

            const payloadString = JSON.stringify(payload);

            // Cryptographically sign the payload with the merchant's unique secret
            const hmac = crypto.createHmac("sha256", endpoint.secret);
            const signature = hmac.update(payloadString).digest("hex");

            const timestamp = Math.floor(Date.now() / 1000);
            const signatureHeader = `t=${timestamp},v1=${signature}`;

            console.log(`${logPrefix} Dispatching secure webhook payload to merchant endpoint...`);

            // Post to merchant webhook endpoint with a 10s timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const startTimeMs = Date.now();
            let status = 0;
            let statusText = "Network Error";
            let responseBody = "";

            try {
              const response = await fetch(endpoint.url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "User-Agent": "MechaPay-Webhook-Dispatcher/1.0",
                  "X-MechaPay-Signature": signatureHeader,
                },
                body: payloadString,
                signal: controller.signal,
              });

              clearTimeout(timeoutId);
              status = response.status;
              statusText = response.statusText || (response.ok ? "OK" : `Error ${response.status}`);
              
              try {
                const text = await response.text();
                responseBody = text.slice(0, 1000); // capture first 1000 characters
              } catch (e) {
                responseBody = "[Failed to read response body]";
              }

              if (response.ok) {
                console.log(`${logPrefix} SUCCESS! Webhook successfully delivered to merchant (Status: ${response.status}).`);
              } else {
                console.warn(`${logPrefix} WARNING! Webhook returned non-2xx status: ${response.status}.`);
              }
            } catch (dispatchErr: any) {
              clearTimeout(timeoutId);
              statusText = dispatchErr instanceof Error ? dispatchErr.message : String(dispatchErr);
              if (dispatchErr.name === "AbortError") {
                statusText = "Timeout (10s)";
              }
              responseBody = statusText;
              console.error(`${logPrefix} Webhook dispatch failed:`, statusText);
            }

            // Save log to MongoDB collection `webhook_logs`
            const durationMs = Date.now() - startTimeMs;
            const logEntry = {
              webhookEndpointId: endpoint._id!.toString(),
              userId: endpoint.userId,
              planId: planIdLower,
              url: endpoint.url,
              event: "payment.succeeded",
              payload: payload,
              status,
              statusText,
              responseBody,
              durationMs,
              txHash: txHash || "",
              timestamp: new Date(),
            };

            await db.collection("webhook_logs").insertOne(logEntry);
            console.log(`${logPrefix} Saved dispatch log to webhook_logs database.`);

          } catch (dispatchErr) {
            console.error(`${logPrefix} Webhook dispatch processing failed:`, dispatchErr instanceof Error ? dispatchErr.message : String(dispatchErr));
          }
        }
      },
      onError: (err) => {
        console.error("[Webhook Worker] Contract watcher encountered an error:", err);
      }
    });

    console.log(`[Webhook Worker] Watching events on contract: ${SUBSCRIPTION_GATEWAY_ADDRESS}`);
  } catch (err) {
    console.error("[Webhook Worker] Initialization failed:", err);
  }
}
