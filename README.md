# 🚀 Mecha Pay

<div align="center">

![Mecha Pay Logo](./circle-wallets/public/logo.png)

**The Web3 Subscription Payment Platform**

*Gasless • Secure • Multi-Chain • Developer-First*

[![Arc Testnet](https://img.shields.io/badge/Arc-Testnet-blue)](https://testnet.arcscan.app)
[![Circle](https://img.shields.io/badge/Built_with-Circle-00D632)](https://circle.com)
[![The Graph](https://img.shields.io/badge/Powered_by-The_Graph-6747ED)](https://thegraph.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Demo](https://macha-pay.vercel.app) • [Documentation](#) • [API Reference](#api-documentation) • [Discord Community](#)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [For End Users](#for-end-users)
  - [For Merchants](#for-merchants)
  - [For Developers](#for-developers)
- [Smart Contract Documentation](#-smart-contract-documentation)
- [API Documentation](#-api-documentation)
- [Integration Guide](#-integration-guide)
- [Technology Stack](#-technology-stack)
- [Deployment Guide](#-deployment-guide)
- [Development Guide](#-development-guide)
- [Security](#-security)
- [Advanced Topics](#-advanced-topics)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Credits & License](#-credits--license)

---

## 🎯 Overview

**Mecha Pay** is a next-generation subscription payment platform built for Web3, enabling merchants to create and manage subscription plans with **USDC** payments across **15+ blockchain networks**. Think Stripe for crypto subscriptions, but truly decentralized and powered by Circle's infrastructure.

### Quick Stats

| Metric | Value |
|--------|-------|
| **Supported Chains** | 15+ (EVM testnets + Arc) |
| **Contract Address** | [`0x2BC2f391fca4144f708eEa918d94348684Bdb544`](https://testnet.arcscan.app/address/0x2BC2f391fca4144f708eEa918d94348684Bdb544) |
| **Native Currency** | USDC (ERC-20 & Native Gas on Arc) |
| **Transaction Finality** | Sub-second (Arc Testnet) |
| **Cross-Chain Protocol** | Circle CCTP (Canonical) |
| **Protocol Fee** | 2.5% (configurable) |
| **Indexer** | The Graph Protocol |

### What Makes Mecha Pay Different?

🌟 **Gasless Payments** - USDC is the native gas token on Arc Testnet, eliminating the need for users to hold ETH or other native tokens  
🔐 **Enterprise Security** - Circle's MPC-based wallet infrastructure with OAuth authentication (Google)  
🌍 **True Multi-Chain** - Single USDC balance across 15+ chains via Circle's CCTP  
⚡ **Sub-Second Finality** - Arc Testnet provides near-instant transaction confirmation  
📊 **Real-Time Indexing** - The Graph subgraph for instant subscription data queries  
🔧 **Developer-First** - RESTful API, comprehensive docs, and easy integration  
💼 **Non-Custodial** - Users maintain full control of their funds via Circle wallets  

---

## 🔴 The Problem

Traditional Web3 subscription systems face critical challenges:

### 1. **Gas Token Friction**
Users need to hold multiple native tokens (ETH, MATIC, AVAX) just to pay subscription fees, creating significant UX friction and onboarding barriers.

### 2. **Fragmented Liquidity**
Funds are locked on individual chains. Moving USDC between chains for payments requires:
- Manual bridging (slow, complex)
- Multiple wallet setups
- Understanding of cross-chain mechanics

### 3. **Poor Developer Experience**
Existing solutions lack:
- Standardized APIs
- Real-time indexing
- Multi-chain abstraction
- Simple merchant integration

### 4. **Security vs. Convenience Trade-off**
Most solutions force users to choose between:
- Custodial wallets (convenient but risky)
- Self-custody (secure but complex)

### 5. **Delayed Finality**
Many L1/L2 chains have 10-30 second block times, making subscription payments feel sluggish compared to Web2 experiences.

---

## ✅ Our Solution

Mecha Pay addresses these challenges through a carefully architected stack:

### **1. Arc Testnet Integration**
Arc is Circle's blockchain where **USDC is the native gas token**. This means:
- ✅ Users pay for transactions with USDC directly
- ✅ No need to acquire/manage ETH or other native tokens
- ✅ Sub-second finality for instant confirmations
- ✅ Predictable, stable gas fees (no ETH price volatility)

### **2. Circle CCTP Bridging**
Circle's Cross-Chain Transfer Protocol enables:
- ✅ Canonical USDC transfers (not wrapped tokens)
- ✅ Support for 15+ EVM testnets
- ✅ Burn-and-mint architecture (provably secure)
- ✅ Automatic attestation and claiming

### **3. Circle User-Controlled Wallets**
Best of both worlds:
- ✅ Non-custodial (user owns keys via MPC)
- ✅ OAuth login (Google, no seed phrases to manage)
- ✅ PIN-based transaction signing
- ✅ Enterprise-grade security (Circle's MPC infrastructure)

### **4. The Graph Indexing**
Real-time blockchain data:
- ✅ GraphQL API for instant queries
- ✅ Aggregated statistics (revenue, subscribers, plans)
- ✅ Event history and analytics
- ✅ Decentralized infrastructure

### **5. Smart Contract Escrow**
Trustless payment processing:
- ✅ On-chain plan registry
- ✅ Event-based subscription tracking
- ✅ Direct seller payouts (minus protocol fee)
- ✅ Monotonic timestamp protection (Arc compatibility)

---

## ⚡ Key Features

### For End Users

#### 🔐 **Seamless Authentication**
- Login with Google (OAuth via Circle)
- No seed phrases or private keys to manage
- PIN-based transaction signing
- Cross-device wallet access

#### 💳 **Unified USDC Balance**
- Single balance across 15+ chains
- Bridge USDC from any supported chain
- No gas token management required
- Real-time balance updates

#### 🚀 **Instant Payments**
- Sub-second transaction finality on Arc
- Automatic USDC approval handling
- Transaction status tracking
- Success redirects to merchant sites

#### 🌉 **Built-In Bridging**
- Connect Privy wallet (MetaMask, WalletConnect)
- Bridge from 15+ chains to Arc Testnet
- CCTP-powered (canonical USDC)
- Visual bridge status tracking

### For Merchants (Sellers)

#### 📦 **Plan Management**
- Create subscription plans with custom pricing
- Set subscription durations (seconds-based)
- Upload plan metadata to IPFS
- Toggle plan active/inactive status
- Update plans anytime (price, duration, metadata)

#### 💰 **Revenue Tracking**
- Real-time subscriber count
- Total revenue analytics
- Active vs. expired subscriptions
- Daily/monthly revenue charts (via The Graph)
- Protocol fee breakdowns

#### 🔑 **API Access**
- Generate secure API keys (SHA-256 hashed)
- RESTful endpoints for plan/subscription queries
- Webhook-style event listening
- Public status verification API
- API key rotation and revocation

#### 📊 **Analytics Dashboard**
- Subscriber demographics
- Plan performance metrics
- Revenue over time
- Subscription lifecycle tracking
- Export data capabilities

### For Developers

#### 🛠️ **RESTful API**
```bash
# Get all plans for a merchant
GET /api/v1/plans
Authorization: Bearer {api_key}

# Check subscription status
GET /api/v1/status?address={wallet}&planId={id}
```

#### 📜 **Smart Contract Events**
```solidity
// Listen for new subscriptions
event Subscribed(
    address indexed subscriber,
    address indexed seller,
    bytes32 indexed planId,
    uint256 totalAmount,
    uint256 feeAmount,
    string buyerData,
    uint32 startTime,
    uint32 endTime
);
```

#### 🔍 **GraphQL Queries (The Graph)**
```graphql
query GetSellerPlans($seller: Bytes!) {
  plans(where: { seller: $seller, active: true }) {
    id
    price
    duration
    ipfsHash
    subscriptionCount
    totalGrossVolume
  }
}
```

#### 🔗 **Payment Links**
```html
<!-- Embed payment link in your app -->
<a href="https://macha-pay.vercel.app/pay/0x1a2b...?userId=user_123&successUrl=https://myapp.com/thanks">
  Subscribe Now
</a>
```

### Core Platform Features

#### 🏗️ **Hybrid Storage Architecture**
- **Plans**: Stored on-chain for security and discoverability
- **Subscriptions**: Event-based for gas efficiency and scalability
- **Metadata**: IPFS for decentralized plan details (name, logo, description)

#### 🔒 **Security Features**
- API key hashing (SHA-256, never stored plaintext)
- Circle MPC wallet security
- Smart contract monotonic timestamp protection (Arc compatibility)
- CORS configuration for cross-origin requests
- Input validation and sanitization

#### 🎨 **Beautiful UI/UX**
- Modern, responsive design (Tailwind CSS)
- Shadcn UI components
- Framer Motion animations
- Dark mode support
- Mobile-optimized

#### 📱 **Payment Page**
- Standalone checkout experience (like Stripe)
- Plan details before authentication
- Circle wallet-only payments
- Optional Privy bridging
- Customizable success redirects

---

## 🏛️ Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  End Users          │  Merchants          │  Developers         │
│  (Payment Page)     │  (Dashboard)        │  (API Integration)  │
└──────────┬──────────┴──────────┬──────────┴──────────┬──────────┘
           │                     │                     │
           v                     v                     v
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Next.js Application (circle-wallets/)             │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • Payment Page (/pay/[planId])                          │  │
│  │  • Dashboard (/dashboard/*)                              │  │
│  │  • API Routes (/api/*)                                   │  │
│  │  • Circle Wallet Integration                             │  │
│  │  • Privy Wallet Integration (Bridging)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────┬──────────────────────────────────────┬───────────────┘
           │                                      │
           v                                      v
┌──────────────────────────┐         ┌───────────────────────────┐
│   CIRCLE INFRASTRUCTURE  │         │    DATABASE LAYER         │
├──────────────────────────┤         ├───────────────────────────┤
│ • User-Controlled Wallets│         │ • MongoDB (Users, Keys)   │
│ • OAuth (Google)         │         │ • Session Management      │
│ • MPC Key Management     │         │ • API Key Hashing         │
│ • Transaction Signing    │         │ • Metadata Storage        │
└──────────┬───────────────┘         └───────────────────────────┘
           │
           v
┌─────────────────────────────────────────────────────────────────┐
│                      BLOCKCHAIN LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Arc Testnet (Chain ID: 5042002)                │  │
│  │            USDC Native Gas • Sub-second Finality          │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  SubscriptionGateway Contract                            │  │
│  │  0x2BC2f391fca4144f708eEa918d94348684Bdb544              │  │
│  │                                                            │  │
│  │  • createPlan(price, duration, ipfsHash)                 │  │
│  │  • subscribe(planId, buyerData)                          │  │
│  │  • setPlanStatus(planId, active)                         │  │
│  │  • updatePlan(planId, price, duration, ipfsHash)         │  │
│  │                                                            │  │
│  │  Events: PlanCreated, Subscribed, PlanUpdated...         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               15+ Supported Chains (CCTP)                 │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Base • Arbitrum • Optimism • Polygon • Avalanche        │  │
│  │  Ethereum • Unichain • Linea • Sei • World Chain         │  │
│  │  Ink • XDC • Monad • Codex                               │  │
│  │                                                            │  │
│  │  Circle CCTP: Burn → Attest → Mint                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────┬───────────────────────────────────────┬──────────────┘
           │                                       │
           v                                       v
┌──────────────────────────┐         ┌───────────────────────────┐
│    INDEXING LAYER        │         │   STORAGE LAYER           │
├──────────────────────────┤         ├───────────────────────────┤
│ The Graph Subgraph       │         │ • IPFS (Plan Metadata)    │
│ (indexer/)               │         │ • JSON descriptions       │
│                          │         │ • Plan logos/images       │
│ • Event Indexing         │         │ • Terms & conditions      │
│ • GraphQL API            │         └───────────────────────────┘
│ • Aggregated Stats       │
│ • Real-time Queries      │
│                          │
│ Endpoint:                │
│ api.studio.thegraph.com  │
│ /query/1704298/mecha-pay │
└──────────────────────────┘
```

### Data Flow: Subscription Payment

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Opens payment link: /pay/0x1a2b...?userId=user_123
     ↓
┌────────────────────┐
│  Payment Page      │
│  (Next.js SSR)     │
└────┬───────────────┘
     │ 2. Fetches plan details from contract + IPFS
     ↓
┌────────────────────┐
│  Circle Auth       │
│  (Google OAuth)    │
└────┬───────────────┘
     │ 3. User logs in, wallet created/retrieved
     ↓
┌────────────────────┐
│  Balance Check     │
│  (USDC on Arc)     │
└────┬───────────────┘
     │ 4a. If sufficient → Continue
     │ 4b. If insufficient → Bridge USDC
     ↓
┌────────────────────┐
│  Bridging          │
│  (Optional)        │
├────────────────────┤
│  • Connect Privy   │
│  • Select source   │
│  • CCTP burn       │
│  • Attest          │
│  • Auto-mint (Arc) │
└────┬───────────────┘
     │ 5. USDC balance updated
     ↓
┌────────────────────┐
│  Approve USDC      │
│  (ERC-20)          │
└────┬───────────────┘
     │ 6. User approves contract to spend USDC
     ↓
┌────────────────────┐
│  Subscribe()       │
│  Contract Call     │
└────┬───────────────┘
     │ 7. Smart contract executes:
     │    • Transfers USDC (seller + protocol fee)
     │    • Emits Subscribed event
     │    • Returns transaction hash
     ↓
┌────────────────────┐
│  The Graph         │
│  Event Indexing    │
└────┬───────────────┘
     │ 8. Subgraph indexes Subscribed event
     │    • Updates Plan stats
     │    • Updates Seller revenue
     │    • Updates Subscriber data
     ↓
┌────────────────────┐
│  Success Screen    │
│  (Auto-redirect)   │
└────┬───────────────┘
     │ 9. User redirected to merchant's successUrl
     ↓
┌────────────────────┐
│  Merchant Backend  │
│  (Webhook/Event)   │
└────────────────────┘
     │ 10. Merchant listens to Subscribed event
     │     or queries The Graph API
     │     • Activates user's subscription
     │     • Grants access to service
```

### Smart Contract Architecture

```solidity
SubscriptionGateway Contract
├── State Variables
│   ├── USDC (immutable ERC-20 reference)
│   ├── owner (contract owner address)
│   ├── feeBps (protocol fee in basis points, default 250 = 2.5%)
│   ├── planNonce (incremental plan ID generator)
│   └── lastSubTimestamp (monotonic timestamp tracker)
│
├── Structs
│   └── Plan
│       ├── seller (address)
│       ├── price (uint256, in USDC with 6 decimals)
│       ├── duration (uint32, in seconds)
│       ├── ipfsHash (string, metadata reference)
│       └── active (bool, plan status)
│
├── Mappings
│   └── plans (bytes32 => Plan)
│
├── Functions
│   ├── createPlan(price, duration, ipfsHash)
│   │   • Generates planId = keccak256(seller, nonce)
│   │   • Stores plan on-chain
│   │   • Emits PlanCreated
│   │
│   ├── subscribe(planId, buyerData)
│   │   • Validates plan is active
│   │   • Calculates fee (totalAmount * feeBps / 10000)
│   │   • Transfers USDC: feeAmount → contract, sellerAmount → seller
│   │   • Applies monotonic timestamp protection
│   │   • Emits Subscribed event with startTime, endTime
│   │
│   ├── setPlanStatus(planId, active)
│   │   • Requires msg.sender == plan.seller
│   │   • Updates plan.active
│   │   • Emits PlanStatusUpdated
│   │
│   ├── updatePlan(planId, price, duration, ipfsHash)
│   │   • Requires msg.sender == plan.seller
│   │   • Updates plan fields
│   │   • Emits PlanUpdated
│   │
│   ├── setFee(newFeeBps) [onlyOwner]
│   │   • Requires newFeeBps <= 1000 (10% max)
│   │   • Updates feeBps
│   │   • Emits FeeUpdated
│   │
│   ├── transferOwnership(newOwner) [onlyOwner]
│   │   • Updates owner
│   │   • Emits OwnerUpdated
│   │
│   └── withdrawFees(to, amount) [onlyOwner]
│       • Transfers accumulated protocol fees
│       • Emits FeesWithdrawn
│
└── Events
    ├── PlanCreated(planId, seller, price, duration, ipfsHash)
    ├── PlanStatusUpdated(planId, active)
    ├── PlanUpdated(planId, price, duration, ipfsHash)
    ├── Subscribed(subscriber, seller, planId, totalAmount, feeAmount, buyerData, startTime, endTime)
    ├── FeeUpdated(newFeeBps)
    ├── OwnerUpdated(newOwner)
    └── FeesWithdrawn(to, amount)
```

### Frontend Architecture

```
circle-wallets/ (Next.js 16 + React 19)
│
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout with providers
│   │
│   ├── pay/
│   │   ├── layout.tsx              # Payment-specific layout
│   │   └── [planId]/
│   │       └── page.tsx            # Checkout page (SSR)
│   │
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard layout + auth
│   │   ├── page.tsx                # Overview
│   │   ├── plans/
│   │   │   ├── page.tsx            # List seller's plans
│   │   │   ├── create/page.tsx    # Create new plan
│   │   │   └── [planId]/page.tsx  # Edit plan
│   │   ├── subscriptions/
│   │   │   ├── page.tsx            # List user's subscriptions
│   │   │   └── [id]/page.tsx      # Subscription details
│   │   ├── wallet/page.tsx         # Wallet management
│   │   ├── bridge/page.tsx         # CCTP bridging UI
│   │   ├── developer/page.tsx      # API keys & docs
│   │   └── admin/page.tsx          # Protocol admin (owner only)
│   │
│   └── api/
│       ├── v1/
│       │   ├── plans/route.ts              # GET /api/v1/plans
│       │   ├── plans/[planId]/route.ts     # GET /api/v1/plans/:id
│       │   ├── subscriptions/route.ts      # GET /api/v1/subscriptions
│       │   ├── subscriptions/[planId]/route.ts
│       │   ├── status/route.ts             # GET /api/v1/status (public)
│       │   ├── balance/route.ts            # GET /api/v1/balance
│       │   └── me/route.ts                 # GET /api/v1/me
│       │
│       ├── payment/
│       │   ├── plan/[planId]/route.ts      # Fetch plan for payment
│       │   ├── approve-usdc/route.ts       # Approve USDC spending
│       │   ├── allowance/route.ts          # Check USDC allowance
│       │   └── subscribe/route.ts          # Execute subscription
│       │
│       ├── subscription/
│       │   ├── create-plan/route.ts        # Create plan
│       │   ├── update-plan/route.ts        # Update plan
│       │   ├── my-plans/route.ts           # Seller's plans
│       │   ├── my-subscriptions/route.ts   # User's subscriptions
│       │   ├── subscribe/route.ts          # Subscribe to plan
│       │   ├── approve-usdc/route.ts       # Approve USDC
│       │   ├── allowance/route.ts          # Check allowance
│       │   ├── upload-metadata/route.ts    # Upload to IPFS
│       │   └── analytics/route.ts          # Subscription analytics
│       │
│       ├── keys/
│       │   ├── route.ts                    # POST (create), GET (list)
│       │   └── [id]/route.ts               # DELETE (revoke)
│       │
│       ├── initialize-wallet/route.ts      # Initialize Circle wallet
│       ├── create-pin/route.ts             # Set wallet PIN
│       ├── send-usdc/route.ts              # Send USDC transfer
│       └── wallets/route.ts                # List user wallets
│
├── lib/
│   ├── circleClient.ts             # Circle SDK initialization
│   ├── bridge_config.ts            # Supported chains + CCTP config
│   ├── privy_config.ts             # Privy (Metamask) integration
│   ├── subscription.ts             # Subscription helpers
│   ├── subgraph.ts                 # The Graph queries
│   ├── db.ts                       # MongoDB connection
│   ├── api-auth.ts                 # API key authentication
│   ├── api-keys.ts                 # API key generation
│   ├── payment-validation.ts       # Input validation
│   ├── cors.ts                     # CORS middleware
│   └── actions/
│       └── bridge.ts               # CCTP bridge logic
│
└── components/
    ├── payment/
    │   ├── AuthModal.tsx           # Circle login modal
    │   ├── PlanDetails.tsx         # Plan display
    │   ├── WalletBalance.tsx       # Balance + bridge button
    │   ├── PaymentButton.tsx       # Subscribe CTA
    │   ├── TransactionStatus.tsx   # TX status tracker
    │   ├── SuccessScreen.tsx       # Post-payment success
    │   └── BridgeComponent.tsx     # CCTP bridge UI
    │
    ├── ui/                         # Shadcn UI components
    │   ├── button.tsx
    │   ├── card.tsx
    │   ├── dialog.tsx
    │   ├── input.tsx
    │   ├── table.tsx
    │   └── ...
    │
    ├── BridgeUSDC.tsx              # Main bridge component
    ├── Providers.tsx               # React context providers
    └── ...
```

---


## 📡 API Documentation

### Base URL
```
Production: https://macha-pay.vercel.app/api/v1
Local Dev:  http://localhost:3000/api/v1
```

### Authentication

All authenticated endpoints require an API key in the `Authorization` header:

```http
GET /api/v1/plans
Authorization: Bearer mp_live_abc123def456...
```

**Generating API Keys**:
1. Login to dashboard: `https://macha-pay.vercel.app/dashboard`
2. Navigate to `Developer` tab
3. Click "Create API Key"
4. Copy key immediately (shown only once)

**Security**:
- Keys are SHA-256 hashed before storage
- Never commit keys to version control
- Rotate keys regularly
- Revoke compromised keys immediately

---

### Endpoints

#### `GET /api/v1/plans`
Get all plans created by the authenticated merchant.

**Auth**: Required  
**Response**:
```json
{
  "plans": [
    {
      "planId": "0x1a2b3c4d5e6f...",
      "seller": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb6",
      "price": "10000000",
      "duration": "2592000",
      "ipfsHash": "QmX7K8w2GNQg7yP4J5M6vT8jK3cR9L1nH4wF2sD6eA5xB9",
      "active": true,
      "subscriptionCount": 42,
      "totalRevenue": "420000000"
    }
  ]
}
```

---

#### `GET /api/v1/plans/:planId`
Get details for a specific plan.

**Auth**: Required  
**Parameters**: `planId` (bytes32)  
**Response**:
```json
{
  "plan": {
    "planId": "0x1a2b3c4d...",
    "seller": "0x742d35Cc...",
    "price": "10000000",
    "duration": "2592000",
    "ipfsHash": "QmX7K8w2...",
    "active": true,
    "metadata": {
      "name": "Premium Monthly",
      "description": "Access to all premium features",
      "logo": "https://ipfs.io/ipfs/QmLogo...",
      "benefits": ["Feature 1", "Feature 2", "Feature 3"]
    }
  }
}
```

---

#### `GET /api/v1/subscriptions`
Get all subscriptions to your plans.

**Auth**: Required  
**Query Parameters**:
- `planId` (optional): Filter by specific plan
- `status` (optional): `active` or `expired`
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset

**Response**:
```json
{
  "subscriptions": [
    {
      "subscriber": "0xAbc123...",
      "planId": "0x1a2b3c...",
      "startTime": 1735689600,
      "endTime": 1738281600,
      "buyerData": "{\"userId\":\"user_123\"}",
      "totalAmount": "10000000",
      "feeAmount": "250000",
      "transactionHash": "0xDef456...",
      "status": "active"
    }
  ],
  "total": 42,
  "hasMore": false
}
```

---

#### `GET /api/v1/status` (Public)
Check subscription status for a wallet address.

**Auth**: None (Public)  
**Query Parameters**:
- `address` (required): Wallet address to check
- `planId` (required): Plan ID

**Response**:
```json
{
  "address": "0xAbc123...",
  "planId": "0x1a2b3c...",
  "isActive": true,
  "startTime": 1735689600,
  "endTime": 1738281600,
  "daysRemaining": 28
}
```

**Use Case**: Verify user subscription status in your middleware

```javascript
async function checkAccess(userAddress, planId) {
  const res = await fetch(`https://macha-pay.vercel.app/api/v1/status?address=${userAddress}&planId=${planId}`);
  const { isActive } = await res.json();
  return isActive;
}
```

---

#### `GET /api/v1/balance`
Get authenticated merchant's USDC balance on Arc Testnet.

**Auth**: Required  
**Response**:
```json
{
  "balance": "1000000000",
  "formatted": "1000.00 USDC",
  "walletAddress": "0x742d35Cc..."
}
```

---

#### `GET /api/v1/me`
Get authenticated merchant's account information.

**Auth**: Required  
**Response**:
```json
{
  "userId": "circle_uuid_123",
  "walletAddress": "0x742d35Cc...",
  "totalPlans": 5,
  "activePlans": 3,
  "totalSubscribers": 142,
  "totalRevenue": "1420000000"
}
```

---

### Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Missing or invalid parameters |
| 401 | Unauthorized | Invalid or missing API key |
| 403 | Forbidden | API key revoked or insufficient permissions |
| 404 | Not Found | Plan or resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded (100 req/min) |
| 500 | Internal Server Error | Server-side error |

**Error Response Format**:
```json
{
  "error": "Unauthorized",
  "message": "Invalid API key",
  "code": 401
}
```

---

## 🔧 Integration Guide

### Merchant Integration (Full Flow)

This guide walks through a complete integration from creating a plan to activating subscriptions.

#### Step 1: Create Subscription Plan

```javascript
// Frontend: Dashboard (circle-wallets/app/dashboard/plans/create/page.tsx)
import { Contract } from 'ethers';

async function createPlan(metadata) {
  // 1. Upload metadata to IPFS
  const ipfsHash = await uploadToIPFS({
    name: "Premium Monthly",
    description: "Full access to premium features",
    logo: logoFile,
    benefits: ["Feature 1", "Feature 2", "Feature 3"]
  });
  
  // 2. Call smart contract
  const contract = new Contract(contractAddress, abi, signer);
  const tx = await contract.createPlan(
    ethers.parseUnits('10', 6),  // 10 USDC
    30 * 24 * 60 * 60,            // 30 days
    ipfsHash
  );
  
  const receipt = await tx.wait();
  const planId = receipt.logs[0].args.planId;
  
  console.log('Plan created:', planId);
  return planId;
}
```

#### Step 2: Generate Payment Links

```javascript
function generatePaymentLink(planId, userId, successUrl) {
  const baseUrl = 'https://macha-pay.vercel.app/pay';
  const params = new URLSearchParams({
    userId,
    successUrl: successUrl || 'https://myapp.com/welcome'
  });
  
  return `${baseUrl}/${planId}?${params}`;
}

// Example
const link = generatePaymentLink(
  '0x1a2b3c4d5e6f...',
  'user_12345',
  'https://myapp.com/dashboard'
);
// Result: https://macha-pay.vercel.app/pay/0x1a2b...?userId=user_12345&successUrl=https://myapp.com/dashboard
```

#### Step 3: Embed in Your Application

```jsx
// React component
function SubscriptionButton({ planId, userId }) {
  const handleSubscribe = () => {
    const link = `https://macha-pay.vercel.app/pay/${planId}?userId=${userId}&successUrl=${window.location.origin}/success`;
    window.location.href = link;
  };
  
  return (
    <button onClick={handleSubscribe}>
      Upgrade to Premium - $10/month
    </button>
  );
}
```

#### Step 4: Listen for Subscriptions

**Option A: Smart Contract Events (Real-time)**

```javascript
// Backend: server.js
const { ethers } = require('ethers');
const db = require('./database');

const provider = new ethers.JsonRpcProvider('https://rpc.testnet.arc.network');
const contractAddress = '0x2BC2f391fca4144f708eEa918d94348684Bdb544';
const abi = [ /* ABI here */ ];
const contract = new ethers.Contract(contractAddress, abi, provider);

// Listen for Subscribed events
contract.on('Subscribed', async (subscriber, seller, planId, totalAmount, feeAmount, buyerData, startTime, endTime, event) => {
  try {
    const { userId } = JSON.parse(buyerData);
    
    // Update database
    await db.subscriptions.insert({
      userId,
      walletAddress: subscriber,
      planId,
      startTime: Number(startTime),
      endTime: Number(endTime),
      transactionHash: event.transactionHash,
      status: 'active'
    });
    
    // Grant access
    await db.users.update({ id: userId }, {
      isPremium: true,
      subscriptionExpiry: Number(endTime)
    });
    
    // Send confirmation email
    await sendEmail(userId, 'Subscription Confirmed', {
      plan: metadata.name,
      expiresAt: new Date(Number(endTime) * 1000)
    });
    
    console.log(`✅ Activated subscription for user ${userId}`);
  } catch (error) {
    console.error('Error processing subscription:', error);
  }
});

console.log('🔊 Listening for subscription events...');
```

**Option B: The Graph Polling (Simpler)**

```javascript
// Backend: subscriptionMonitor.js
const SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/1704298/mecha-pay/v0.0.3';

async function fetchNewSubscriptions(planId, lastChecked) {
  const query = `
    query GetNewSubscriptions($planId: Bytes!, $since: BigInt!) {
      subscribed(
        where: { 
          planId: $planId, 
          blockTimestamp_gte: $since 
        }
        orderBy: blockTimestamp
        orderDirection: asc
      ) {
        subscriber
        buyerData
        startTime
        endTime
        transactionHash
        blockTimestamp
      }
    }
  `;
  
  const response = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { planId, since: lastChecked }
    })
  });
  
  const { data } = await response.json();
  return data.subscribed;
}

// Poll every 10 seconds
let lastChecked = Math.floor(Date.now() / 1000);

setInterval(async () => {
  const subscriptions = await fetchNewSubscriptions('0x1a2b...', lastChecked);
  
  for (const sub of subscriptions) {
    const { userId } = JSON.parse(sub.buyerData);
    await activateSubscription(userId, sub);
  }
  
  if (subscriptions.length > 0) {
    lastChecked = Math.max(...subscriptions.map(s => s.blockTimestamp));
  }
}, 10000);
```

#### Step 5: Middleware Protection

```javascript
// Express.js middleware
const express = require('express');
const app = express();

async function requireSubscription(req, res, next) {
  const userWallet = req.user?.walletAddress;
  const planId = process.env.PREMIUM_PLAN_ID;
  
  if (!userWallet) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  // Check via API
  const response = await fetch(
    `https://macha-pay.vercel.app/api/v1/status?address=${userWallet}&planId=${planId}`
  );
  const status = await response.json();
  
  if (status.isActive) {
    next();
  } else {
    res.status(403).json({
      error: 'Premium subscription required',
      upgradeUrl: `https://macha-pay.vercel.app/pay/${planId}?userId=${req.user.id}`
    });
  }
}

// Protected routes
app.get('/api/premium-content', requireSubscription, (req, res) => {
  res.json({ content: 'Premium data' });
});

app.get('/api/advanced-analytics', requireSubscription, (req, res) => {
  res.json({ analytics: [...] });
});
```

---

## 🛠️ Technology Stack

### Why Each Technology Was Chosen

| Technology | Rationale | Alternatives Considered |
|------------|-----------|-------------------------|
| **Arc Testnet** | USDC as native gas token eliminates user friction. Sub-second finality provides instant confirmations. | Ethereum (high gas fees), Polygon (still requires MATIC), Base (requires ETH) |
| **Circle Wallets** | MPC-based non-custodial wallets with OAuth (Google). No seed phrases, enterprise security. | MetaMask (seed phrase UX), Privy (used for bridging only), WalletConnect (requires external wallet) |
| **Circle CCTP** | Canonical USDC (not wrapped) across 15+ chains. Official Circle protocol, battle-tested. | LayerZero (wrapped tokens), Axelar (complexity), Wormhole (security concerns) |
| **The Graph** | Decentralized indexing with GraphQL. Real-time event querying, aggregations, and analytics. | Centralized DB (less trustworthy), Moralis (vendor lock-in), Self-hosted indexer (operational burden) |
| **Next.js 16** | App Router (RSC), Server Actions, optimized bundle size. Best-in-class React framework. | Remix (less mature), Astro (not for apps), Vite+React (manual SSR) |
| **MongoDB** | Flexible schema for user data, API keys, metadata. Excellent TypeScript support. | PostgreSQL (rigid schema), Supabase (unnecessary complexity), Firebase (vendor lock-in) |
| **Hardhat** | De facto Ethereum dev environment. Ignition for deployment, testing framework. | Foundry (Rust learning curve), Truffle (outdated), Remix (not for CI/CD) |
| **Tailwind CSS** | Utility-first, rapid prototyping, excellent DX. Shadcn UI components. | Chakra UI (bundle size), Material UI (design lock-in), styled-components (performance) |

### Full Stack

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (circle-wallets/)                                      │
├─────────────────────────────────────────────────────────────────┤
│ • Next.js 16.1.6 (App Router, React Server Components)          │
│ • React 19.2.3 (Concurrent features, Suspense)                   │
│ • TypeScript 5.x (Type safety, IntelliSense)                     │
│ • Tailwind CSS 4.x (Styling, responsive design)                  │
│ • Shadcn UI (Component library)                                  │
│ • Framer Motion 12.x (Animations)                                │
│ • Wagmi 3.6.0 (React hooks for Ethereum)                         │
│ • Viem 2.47.6 (TypeScript Ethereum library)                      │
│ • React Query 5.x (Data fetching, caching)                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ BACKEND (circle-wallets/app/api/)                               │
├─────────────────────────────────────────────────────────────────┤
│ • Next.js API Routes (Serverless functions)                      │
│ • MongoDB 7.x (Database)                                         │
│ • Circle SDKs:                                                   │
│   - @circle-fin/user-controlled-wallets 10.x (Wallet auth)       │
│   - @circle-fin/developer-controlled-wallets 10.x                │
│   - @circle-fin/bridge-kit 1.7.0 (CCTP bridging)                 │
│   - @circle-fin/w3s-pw-web-sdk 1.1.11 (PIN wallet SDK)           │
│ • Privy 3.18.0 (Metamask integration for bridging)               │
│ • Ethers.js 6.16.0 (Smart contract interactions)                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ BLOCKCHAIN (Arc_contracts/)                                      │
├─────────────────────────────────────────────────────────────────┤
│ • Solidity 0.8.20 (Smart contract language)                      │
│ • Hardhat 2.28.6 (Dev environment)                               │
│ • Hardhat Ignition 0.15.16 (Deployment)                          │
│ • OpenZeppelin Contracts 5.6.1 (Security primitives)             │
│ • TypeChain 8.3.2 (TypeScript bindings)                          │
│ • Chai 4.x (Testing framework)                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ INDEXING (indexer/)                                              │
├─────────────────────────────────────────────────────────────────┤
│ • The Graph 0.98.1 (Blockchain indexer)                          │
│ • AssemblyScript 0.37.0 (Subgraph language)                      │
│ • GraphQL (Query language)                                       │
│ • The Graph Studio (Hosted service)                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE                                                   │
├─────────────────────────────────────────────────────────────────┤
│ • Arc Testnet RPC: https://rpc.testnet.arc.network              │
│ • The Graph Studio: api.studio.thegraph.com                      │
│ • IPFS (Filebase SDK 1.0.6): Decentralized metadata storage      │
│ • MongoDB Atlas: Managed database (likely)                       │
│ • Vercel: Frontend/API hosting (recommended)                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚢 Deployment Guide

### Prerequisites

- Node.js 18+ and pnpm
- Arc Testnet wallet with USDC
- Circle API key
- MongoDB connection string
- Privy App ID
- The Graph account

### 1. Deploy Smart Contract

```bash
cd Arc_contracts

# Install dependencies
pnpm install

# Set environment variables
echo "PRIVATE_KEY=your_private_key_here" > .env

# Compile contracts
pnpm hardhat compile

# Deploy to Arc Testnet
pnpm hardhat ignition deploy ./ignition/modules/SubscriptionGateway.js --network arc-testnet

# Save deployed address (shown in output)
# Example: 0x2BC2f391fca4144f708eEa918d94348684Bdb544
```

### 2. Deploy Subgraph (The Graph)

```bash
cd indexer

# Install dependencies
pnpm install

# Update subgraph.yaml with your contract address
# Edit: source.address = "0xYourContractAddress"

# Authenticate with The Graph Studio
graph auth --studio YOUR_DEPLOY_KEY

# Deploy
graph deploy --studio mecha-pay

# Save GraphQL endpoint (shown in output)
```

### 3. Deploy Frontend

```bash
cd circle-wallets

# Install dependencies
pnpm install

# Set environment variables
cat > .env.local << EOF
# Circle
CIRCLE_API_KEY=your_circle_api_key
NEXT_PUBLIC_CIRCLE_APP_ID=your_circle_app_id

# Privy
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_PRIVY_CLIENT_ID=your_privy_client_id

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mechapay

# Contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/1704298/mecha-pay/v0.0.2

# Arc Testnet
NEXT_PUBLIC_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_CHAIN_ID=5042002
NEXT_PUBLIC_USDC_ADDRESS=0x3600000000000000000000000000000000000000

# IPFS
FILEBASE_ACCESS_KEY=your_filebase_key
FILEBASE_SECRET_KEY=your_filebase_secret
EOF

# Build
pnpm build

# Deploy to Vercel
vercel --prod

# Or run locally
pnpm dev
```

### 4. Production Checklist

- [ ] Smart contract verified on ArcScan
- [ ] Subgraph deployed and syncing
- [ ] MongoDB indexes created (api_keys.keyHash, api_keys.userId)
- [ ] Environment variables set in Vercel
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Error tracking (Sentry) configured
- [ ] Analytics (PostHog/Amplitude) integrated
- [x] Domain configured (macha-pay.vercel.app)
- [ ] SSL certificate valid
- [ ] API documentation published

---

## 👨‍💻 Development Guide

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/yourorg/autopay.git
cd autopay

# Install dependencies for all components
cd Arc_contracts && pnpm install && cd ..
cd circle-wallets && pnpm install && cd ..
cd indexer && pnpm install && cd ..

# Start local development
cd circle-wallets
pnpm dev
# Open http://localhost:3000
```

### Running Tests

```bash
# Smart contract tests
cd Arc_contracts
pnpm hardhat test
pnpm hardhat coverage

# Subgraph tests
cd indexer
graph test

# Frontend (if tests exist)
cd circle-wallets
pnpm test
```

### Repository Structure

```
autopay/
├── Arc_contracts/          # Smart contracts
│   ├── contracts/
│   │   └── Contract.sol    # SubscriptionGateway
│   ├── ignition/           # Deployment scripts
│   ├── test/               # Contract tests
│   └── hardhat.config.js
│
├── circle-wallets/         # Next.js application
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── pay/            # Payment pages
│   │   └── page.tsx        # Landing page
│   ├── components/         # React components
│   ├── lib/                # Utilities
│   └── public/             # Static assets
│
├── indexer/                # The Graph subgraph
│   ├── src/                # Subgraph handlers
│   ├── schema.graphql      # GraphQL schema
│   ├── subgraph.yaml       # Subgraph manifest
│   └── tests/              # Subgraph tests
│
├── docs/                   # Documentation
└── README.md               # This file
```

### Code Style

- **TypeScript**: Strict mode, explicit types
- **Solidity**: Follow OpenZeppelin conventions
- **Formatting**: Prettier + ESLint
- **Commits**: Conventional commits (feat:, fix:, docs:)

### Contribution Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 🔒 Security

### API Key Security

**Generation**:
```javascript
const crypto = require('crypto');

function generateApiKey() {
  const key = crypto.randomBytes(24).toString('hex'); // 48 chars
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const prefix = key.substring(0, 8);
  const mask = key.substring(key.length - 4);
  
  return { key, hash, prefix, mask };
}
```

**Storage** (MongoDB):
```javascript
{
  userId: "circle_uuid_123",
  merchantAddress: "0x742d35Cc...",
  name: "Production API Key",
  keyHash: "a1b2c3d4e5f6...",  // SHA-256 hash (never store plaintext)
  prefix: "mp_live_",
  mask: "...xyz123",
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  revokedAt: null
}
```

**Validation**:
```javascript
async function validateApiKey(providedKey) {
  const hash = crypto.createHash('sha256').update(providedKey).digest('hex');
  const apiKey = await db.apiKeys.findOne({ keyHash: hash, revokedAt: null });
  return apiKey;
}
```

### Circle Wallet Security

- **MPC Architecture**: Private keys are split across multiple parties (Circle's infrastructure)
- **OAuth**: Google authentication, no password management
- **PIN Protection**: 6-digit PIN required for transactions
- **Device Binding**: Wallets tied to device tokens
- **Non-Custodial**: Users own keys (via MPC shares)

### Smart Contract Security

**Audited Patterns**:
- ✅ OpenZeppelin SafeERC20 for transfers
- ✅ Reentrancy protection (direct transfers only)
- ✅ Access control (onlyOwner modifier)
- ✅ Input validation (require statements)
- ✅ Monotonic timestamp protection
- ✅ Fee cap (max 10%)

**Known Limitations**:
- ⚠️ Testnet only (not production-ready)
- ⚠️ No formal audit (consider Certik/OpenZeppelin)
- ⚠️ No pause mechanism (consider adding)

### CORS Configuration

```typescript
// circle-wallets/lib/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
};
```

**Production**: Restrict `Access-Control-Allow-Origin` to your domain(s).

---

## 🚀 Advanced Topics

### The Graph Queries

```graphql
# Get all plans for a seller
query SellerPlans($seller: Bytes!) {
  plans(where: { seller: $seller }, orderBy: createdAt, orderDirection: desc) {
    id
    price
    duration
    ipfsHash
    active
    subscriptionCount
    totalGrossVolume
    totalFeesCollected
  }
}

# Get daily revenue statistics
query DailyRevenue($startDate: BigInt!) {
  dailyStats(where: { dayStartTimestamp_gte: $startDate }, orderBy: dayStartTimestamp) {
    id
    dayStartTimestamp
    subscriptionsCreated
    totalGrossVolume
    totalFeesCollected
  }
}

# Get active subscriptions for a user
query UserSubscriptions($subscriber: Bytes!) {
  subscriptionStates(
    where: { 
      subscriber: $subscriber, 
      status: ACTIVE 
    }
  ) {
    plan {
      id
      ipfsHash
      price
      duration
    }
    lastEndTime
    totalSpent
  }
}
```

### Custom CCTP Bridging Logic

```typescript
import { ViemAdapter } from '@circle-fin/adapter-viem-v2';
import { CCTPProvider } from '@circle-fin/provider-cctp-v2';
import { createPublicClient, createWalletClient, http } from 'viem';

async function bridgeUSDC(sourceChain, destChain, amount) {
  const publicClient = createPublicClient({
    chain: sourceChain.viemChain,
    transport: http(sourceChain.rpcUrl)
  });
  
  const walletClient = createWalletClient({
    chain: sourceChain.viemChain,
    transport: http(sourceChain.rpcUrl),
    account: userAccount
  });
  
  const adapter = new ViemAdapter({ publicClient, walletClient });
  const provider = new CCTPProvider({ adapter });
  
  // Burn USDC on source chain
  const burnTxHash = await provider.burn({
    amount,
    destinationDomain: destChain.domain,
    mintRecipient: userAddress
  });
  
  // Wait for attestation (Circle's backend)
  const attestation = await provider.getAttestation(burnTxHash);
  
  // Mint on destination chain
  const mintTxHash = await provider.mint({
    burnTxHash,
    attestation
  });
  
  return { burnTxHash, mintTxHash };
}
```

### Event Listening Best Practices

```javascript
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://rpc.testnet.arc.network');
const contract = new ethers.Contract(contractAddress, abi, provider);

// Reconnection logic
let reconnectAttempts = 0;
const MAX_RECONNECTS = 5;

function setupEventListeners() {
  contract.on('Subscribed', handleSubscribed);
  
  contract.on('error', (error) => {
    console.error('Contract event error:', error);
    if (reconnectAttempts < MAX_RECONNECTS) {
      reconnectAttempts++;
      console.log(`Reconnecting... (${reconnectAttempts}/${MAX_RECONNECTS})`);
      setTimeout(setupEventListeners, 5000);
    }
  });
}

async function handleSubscribed(subscriber, seller, planId, totalAmount, feeAmount, buyerData, startTime, endTime, event) {
  // Process subscription with retry logic
  let retries = 3;
  while (retries > 0) {
    try {
      await processSubscription({ subscriber, planId, buyerData, endTime });
      break;
    } catch (error) {
      retries--;
      if (retries === 0) {
        // Log to error tracking (Sentry)
        console.error('Failed to process subscription:', error);
        // Could push to dead letter queue for manual processing
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

setupEventListeners();
```

---

## 🐛 Troubleshooting

### Common Issues

#### "Insufficient USDC Balance"
**Cause**: User doesn't have enough USDC on Arc Testnet  
**Solution**: Bridge USDC from another chain using the built-in bridge, or get testnet USDC from [faucet.circle.com](https://faucet.circle.com)

#### "Transaction Failed: Insufficient Allowance"
**Cause**: USDC spending not approved for SubscriptionGateway contract  
**Solution**: Call `approve()` on USDC contract first. Frontend should handle this automatically.

#### "Plan Not Found"
**Cause**: Invalid planId or plan doesn't exist  
**Solution**: Verify planId from The Graph API or contract directly. Check if plan was created successfully.

#### "Circle Wallet PIN Not Set"
**Cause**: User hasn't completed wallet initialization  
**Solution**: Navigate to Dashboard > Wallet > Set PIN

#### "CCTP Bridge Stuck"
**Cause**: Attestation service delay (rare)  
**Solution**: Wait 1-2 minutes. Attestations usually complete in 15-30 seconds. Check Circle's status page.

#### "API Key Invalid"
**Cause**: Key revoked, malformed, or incorrect  
**Solution**: Generate new API key from dashboard. Ensure `Authorization: Bearer {key}` header is correct.

#### "CORS Error"
**Cause**: Frontend origin not allowed  
**Solution**: Check CORS configuration in `circle-wallets/lib/cors.ts`. Add your domain to allowed origins.

---

### FAQ

**Q: Is this production-ready?**  
A: No, this is built for Arc Testnet. For mainnet:
- Audit smart contracts
- Add pause mechanism
- Implement rate limiting
- Add monitoring/alerting
- Consider L1 deployment costs

**Q: Can I use my own wallet instead of Circle?**  
A: Yes, but you'll need to modify the payment flow to support MetaMask/WalletConnect directly. Circle wallets provide better UX for non-crypto users.

**Q: How do I test bridging without real USDC?**  
A: Use Circle's faucet for testnet USDC on any supported chain, then bridge to Arc.

**Q: Can subscriptions auto-renew?**  
A: Not currently. You'd need to implement recurring payments, which requires additional smart contract logic (e.g., Gelato Automate, Chainlink Keepers).

**Q: How do I customize the payment page?**  
A: The payment page is in `circle-wallets/app/pay/[planId]/page.tsx`. You can white-label it or extract into a separate hosted checkout.

**Q: What happens if Arc Testnet goes down?**  
A: Your application would be unavailable. For production, consider multi-chain support or Arc mainnet (when available).

---

## 🗺️ Roadmap

### Current Version: v0.0.2 (Testnet)

**Completed**:
- ✅ Smart contract deployment (Arc Testnet)
- ✅ The Graph subgraph indexing
- ✅ Payment page with Circle wallets
- ✅ CCTP bridging (15+ chains)
- ✅ Dashboard for merchants
- ✅ RESTful API with authentication
- ✅ IPFS metadata storage

---

### Next Release: v0.1.0 (Beta)

**Planned Features**:
- [ ] Auto-renewal subscriptions (Gelato Automate)
- [ ] Email notifications (Resend/SendGrid)
- [ ] Subscription gifting
- [ ] Multi-plan bundles
- [ ] Promo codes/discounts
- [ ] Webhook system (replace event listeners)
- [ ] Admin panel improvements
- [ ] Mobile app (React Native)

---

### Future: v1.0.0 (Mainnet)

**Requirements**:
- [ ] Smart contract audit (Certik/OpenZeppelin)
- [ ] Arc Mainnet deployment
- [ ] USDC mainnet support
- [ ] Legal compliance (Terms, Privacy Policy)
- [ ] Customer support system
- [ ] Merchant onboarding flow
- [ ] Yield generation on idle USDC
- [ ] Fiat on-ramps (Stripe, MoonPay)
- [ ] Multi-currency support (EUR, GBP via Circle)

---

## 💎 Credits & License

### Built With

- **Circle**: Infrastructure (Wallets, CCTP, USDC)
- **The Graph**: Decentralized indexing
- **Arc Testnet**: USDC-native blockchain
- **Hardhat**: Smart contract development
- **Next.js**: Full-stack React framework
- **Vercel**: Deployment platform

### Open Source Libraries

- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) - Secure smart contract primitives
- [Wagmi](https://wagmi.sh) - React hooks for Ethereum
- [Viem](https://viem.sh) - TypeScript Ethereum library
- [Shadcn UI](https://ui.shadcn.com) - Beautiful components
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) - Animation library

### Team

- **Lead Developer**: [Your Name]
- **Smart Contract Engineer**: [Name]
- **Frontend Developer**: [Name]
- **Designer**: [Name]

### Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting PRs.

### License

MIT License - See [LICENSE](LICENSE) file for details.

---

### Support


- **Docs**: [macha-pay.vercel.app/docs](https://macha-pay.vercel.app/docs)

---

<div align="center">

**Built with ❤️ for the Web3 community**

[Website](https://macha-pay.vercel.app) • [Documentation](https://macha-pay.vercel.app/docs) 
</div>

