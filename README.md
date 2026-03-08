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
<a href="https://mechapay.com/pay/0x1a2b...?userId=user_123&successUrl=https://myapp.com/thanks">
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

