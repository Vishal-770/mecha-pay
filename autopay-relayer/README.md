# ⚡ MechaPay AutoPay Relayer Server

A standalone, dedicated Node.js Express server and background worker written in **TypeScript** to automatically scan, verify, and execute pre-authorized subscription renewals on the **Arc Testnet** using user-consented session keys.

---

## 🚀 Features

* **Complete TS Static Typing**: Built with TypeScript safety, compiling and running with zero configuration using `tsx`.
* **Zero-Dependency Env Config**: Leverages Node's native env file loading (`--env-file`) to load configurations without any external npm packages.
* **On-Chain Security Pre-flights**: Before calling the smart contract, the relayer fetches the plan details and checks the subscriber smart wallet's USDC balance and allowance on-chain. This avoids failed transactions and keeps gas fees optimized.
* **Automated Renewal Sweeps**: Features an embedded background worker that runs automatically every 1 hour (configurable) using standard Node loop schedulers.
* **REST API Endpoints**: Exposes endpoints to query server health/metrics or trigger manual runs on-demand.

---

## 🛠️ Setup & Installation

### 1. Install Dependencies
Navigate to the relayer folder and install node packages:
```bash
cd autopay-relayer
pnpm install
```

### 2. Configuration (`.env`)
The server reads configuration parameters directly from its `.env` file (copied from the frontend Next.js project).
```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB=mecha-pay
PORT=4000
CHECK_INTERVAL_MS=3600000 # Time between automated sweep runs (e.g., 1 hour)
```

---

## 🏃 Running the Server

Start the TypeScript server in hot-execution mode:
```bash
pnpm start
```

### Deployed Contracts Targeted:
* **SubscriptionGateway**: `0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2`
* **USDC Address (Arc Testnet)**: `0x3600000000000000000000000000000000000000`
* **Arc Testnet RPC**: `https://rpc.testnet.arc.network`

---

## 🔍 API Reference

### 1. Health Status Metrics
Checks database connectivity and displays active subscription counts.
* **Method**: `GET`
* **Endpoint**: `/status`
* **Response**:
```json
{
  "status": "healthy",
  "database": "connected",
  "blockchain": "Arc Testnet (5042002)",
  "verifyingContract": "0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2",
  "metrics": {
    "totalPreAuthorizations": 12,
    "activePreAuthorizations": 10
  },
  "time": "2026-05-25T13:51:00.000Z"
}
```

### 2. Manual Sweep Trigger
Manually runs the checking sweep and executes all expired subscriptions due for renewal immediately.
* **Method**: `POST`
* **Endpoint**: `/trigger`
* **Response**:
```json
{
  "success": true,
  "sweepData": {
    "executed": 1,
    "results": [
      {
        "subscriberAddress": "0xSubscriberSmartWallet",
        "planId": "0xPlanIdBytes32",
        "success": true,
        "txHash": "0xTransactionHash..."
      }
    ]
  }
}
```
