# Mecha Pay Data & Interaction Architecture

This document provides a comprehensive mapping of all API endpoints and interaction patterns within the Mecha Pay ecosystem.

## 1. Backend Interaction via Circle Wallets SDK
These endpoints use the Circle Programmable Wallets SDK (User or Developer controlled) to manage keys, authorize transactions via PIN challenges, and execute smart contract calls.

| Category | Endpoint | Purpose | SDK Operation |
| :--- | :--- | :--- | :--- |
| **Wallets** | `POST /api/wallets` | Fetches user wallets and token balances. | `listWallets`, `getWalletTokenBalance` |
| | `POST /api/initialize-wallet` | Creates a new wallet set/wallet for new users. | `createWalletSet`, `createWallets` |
| | `POST /api/user-status` | Checks if a user is initialized in Circle. | `getUserStatus` |
| | `POST /api/create-pin` | Sets up a secure PIN for challenge execution. | `createPin` |
| | `POST /api/create-device-token` | Generates a token for device-bound auth. | `createDeviceToken` |
| **Payments** | `POST /api/send-usdc` | Transfers USDC between addresses. | `createTransaction` |
| | `POST /api/payment/subscribe` | Executes a plan subscription (Gateway). | `contractExecutionChallenge` |
| | `POST /api/payment/approve-usdc` | Authorizes USDC spending for subscriptions. | `contractExecutionChallenge` |
| **Merchant** | `POST /api/subscription/create-plan` | Registers a new protocol plan on-chain. | `contractExecutionChallenge` |
| | `POST /api/subscription/update-plan` | Modifies existing plan parameters. | `contractExecutionChallenge` |
| | `POST /api/subscription/update-status` | Toggles plan activity (Enable/Disable). | `contractExecutionChallenge` |
| **Bridging** | `POST /api/bridge/prepare-approve` | CCTP: Approve TokenMessenger spender. | `contractExecutionChallenge` |
| | `POST /api/bridge/prepare-burn` | CCTP: Execute `depositForBurn`. | `contractExecutionChallenge` |
| | `POST /api/bridge/prepare-mint` | CCTP: Execute `receiveMessage` on dest. | `contractExecutionChallenge` |
| | `POST /api/bridge/resolve-tx-hash` | Polling for tx hash after challenge success. | `getTransaction` |
| **Admin** | `POST /api/admin/set-fee` | Updates protocol-wide fee settings. | `contractExecutionChallenge` |
| | `POST /api/admin/withdraw` | Withdraws protocol revenue to treasury. | `contractExecutionChallenge` |
| **System** | `POST /api/keys` | Generates off-chain Mecha API keys. | Backend Auth Logic |
| | `GET /api/transactions` | Retrieves transaction history via Circle. | `listTransactions` |

## 2. Read-Only Data (GraphQL & Subgraph)
These endpoints fetch indexed data from the Mecha Subgraph. This is the source of truth for the Marketplace, Merchant Dashboard, and User History.

| Endpoint | Purpose | Entity Queried |
| :--- | :--- | :--- |
| `GET /api/subscription/list-plans` | Marketplace discovery engine. | `plans` |
| `GET /api/subscription/my-plans` | Merchant dashboard plan list. | `plans(where: { seller })` |
| `GET /api/subscription/my-subscriptions` | User dashboard active subscriptions. | `subscriptions(where: { subscriber })` |
| `GET /api/subscription/analytics` | Merchant revenue and subscriber growth. | `seller`, `planStats` |
| `GET /api/subscription/plan/[id]` | Detailed view for a single protocol plan. | `plan` |
| `GET /api/subscription/eligibility` | Checks if a user is eligible to subscribe. | `subscriptions`, `plan` |
| `GET /api/subscription/notifications` | On-chain event history (purchases, renewals). | `events` |

## 3. Direct Blockchain Reads (RPC / Viem)
Used for real-time validation or data that hasn't been indexed by the subgraph yet.

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `GET /api/payment/allowance` | `allowance` | Verifying if a user has approved USDC spending. |
| `GET /api/subscription/allowance` | `allowance` | Redundant check for protocol-level flows. |
| **Frontend** | `getMinFeeAmount` | Fetching real-time CCTP bridge fees in `BridgeUSDC`. |

## 4. External Services & Storage
| Service | Purpose | Integration |
| :--- | :--- | :--- |
| **Filebase (IPFS)** | Plan Metadata Storage | `POST /api/subscription/upload-metadata` |
| **Mintlify** | Public Documentation | [mecha-pay.vercel.app/docs](https://mecha-pay.vercel.app/docs) |
| **Circle Iris API** | CCTP Attestations | Cross-chain message verification. |
| **OAuth Providers** | Social Login | `POST /api/oauth` (Google, Apple, etc.) |
