# Mecha Pay Subgraph

This directory contains The Graph protocol subgraph for indexing Mecha Pay's subscription events on Arc Testnet.

## 📊 Deployed Subgraph

**Network**: Arc Testnet (Chain ID: 5042002)  
**Studio URL**: [https://thegraph.com/studio/subgraph/mecha-pay](https://thegraph.com/studio/subgraph/mecha-pay)  
**Query Endpoint**: `[HIDDEN]` (Use `NEXT_PUBLIC_SUBGRAPH_URL` environment variable)  
**Contract**: [`0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2`](https://testnet.arcscan.app/address/0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Schema](#schema)
- [Setup & Installation](#setup--installation)
- [Development](#development)
- [Deployment](#deployment)
- [Queries](#queries)
- [Testing](#testing)

---

## 🎯 Overview

The Mecha Pay subgraph indexes all events from the SubscriptionGateway smart contract and provides a GraphQL API for querying:

- **Plans**: Subscription plans created by merchants
- **Subscriptions**: Active and expired subscriptions
- **Sellers**: Merchant statistics (revenue, subscriber count)
- **Subscribers**: User subscription history
- **Daily Stats**: Aggregated daily metrics

**Why The Graph?**
- ✅ Real-time event indexing
- ✅ Efficient GraphQL queries
- ✅ Aggregated statistics
- ✅ Decentralized infrastructure
- ✅ No custom backend needed

---

## 📐 Schema

Located at `schema.graphql`:

### Core Entities

#### Plan
```graphql
type Plan @entity {
  id: Bytes!                    # planId
  seller: Seller!               # Plan creator
  price: BigInt!                # Subscription price (USDC, 6 decimals)
  duration: BigInt!             # Duration in seconds
  ipfsHash: String!             # Metadata CID
  active: Boolean!              # Plan status
  createdAt: BigInt!            # Creation timestamp
  updatedAt: BigInt!            # Last update timestamp
  subscriptionCount: Int!       # Total subscriptions
  totalGrossVolume: BigInt!     # Total revenue (before fees)
  totalFeesCollected: BigInt!   # Protocol fees collected
  lastSubscriptionAt: BigInt    # Last subscription timestamp
}
```

#### SubscriptionState
```graphql
type SubscriptionState @entity {
  id: String!                   # subscriber-planId
  subscriber: Subscriber!       # User who subscribed
  seller: Seller!               # Plan seller
  plan: Plan!                   # Subscription plan
  status: SubscriptionStatus!   # ACTIVE or EXPIRED
  subscriptionCount: Int!       # Number of renewals
  totalSpent: BigInt!           # Total USDC spent
  totalFeesPaid: BigInt!        # Total fees paid
  firstStartTime: BigInt!       # First subscription start
  lastStartTime: BigInt!        # Most recent start
  lastEndTime: BigInt!          # Most recent expiry
  lastBuyerData: String!        # Latest buyer metadata
  firstSeenAt: BigInt!          # First subscription timestamp
  updatedAt: BigInt!            # Last update timestamp
  lastTxHash: Bytes!            # Latest transaction hash
}
```

#### Seller
```graphql
type Seller @entity {
  id: Bytes!                    # Seller address
  planCount: Int!               # Total plans created
  activePlanCount: Int!         # Currently active plans
  subscriptionCount: Int!       # Total subscriptions received
  totalGrossRevenue: BigInt!    # Revenue before fees
  totalNetRevenue: BigInt!      # Revenue after fees
  totalFeeContributed: BigInt!  # Fees paid to protocol
  totalFeeWithdrawn: BigInt!    # Fees withdrawn (if owner)
  createdAt: BigInt!            # First plan creation
  updatedAt: BigInt!            # Last activity
}
```

#### Subscriber
```graphql
type Subscriber @entity {
  id: Bytes!                    # Subscriber address
  subscriptionCount: Int!       # Total subscriptions
  activeSubscriptionCount: Int! # Current active subscriptions
  totalSpent: BigInt!           # Total USDC spent
  totalFeesPaid: BigInt!        # Total fees paid
  firstSeenAt: BigInt!          # First subscription
  updatedAt: BigInt!            # Last subscription
}
```

#### DailyStats
```graphql
type DailyStats @entity {
  id: String!                   # YYYY-MM-DD
  dayStartTimestamp: BigInt!    # Day start (Unix)
  plansCreated: Int!            # Plans created today
  subscriptionsCreated: Int!    # Subscriptions created today
  totalGrossVolume: BigInt!     # Total revenue today
  totalFeesCollected: BigInt!   # Fees collected today
  totalFeeWithdrawals: BigInt!  # Fees withdrawn today
  updatedAt: BigInt!            # Last update
}
```

### Event Entities

All smart contract events are also indexed as immutable entities:
- `PlanCreated`
- `Subscribed`
- `PlanStatusUpdated`
- `PlanUpdated`
- `FeeUpdated`
- `FeesWithdrawn`

---

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+
- The Graph CLI (`@graphprotocol/graph-cli`)
- Graph Studio account

### Install Dependencies

```bash
cd indexer
pnpm install

# Install Graph CLI globally
pnpm add -g @graphprotocol/graph-cli
```

### Authentication

```bash
# Get deploy key from https://thegraph.com/studio/subgraph/mecha-pay
graph auth --studio YOUR_DEPLOY_KEY
```

---

## 💻 Development

### Generate Types

After modifying `schema.graphql`:

```bash
graph codegen
```

This generates TypeScript types in `generated/`:
- `schema.ts` - Entity types
- Contract types and event interfaces

### Build Subgraph

```bash
graph build
```

Compiles AssemblyScript to WASM and validates configuration.

### Local Development

```bash
# Start local Graph Node (requires Docker)
git clone https://github.com/graphprotocol/graph-node
cd graph-node/docker
./setup.sh
docker-compose up

# Create local subgraph
graph create --node http://localhost:8020/ mecha-pay

# Deploy locally
graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 mecha-pay
```

---

## 🚀 Deployment

### Deploy to The Graph Studio

```bash
# Build
graph build

# Deploy
graph deploy --studio mecha-pay
```

**Deployment Output**:
```
Build completed: QmPzZBXPbRPLi64G2YkZGkaGtD4Mv9EHKH3kuEYrNj8CEx
Deployed to: https://thegraph.com/studio/subgraph/mecha-pay
Queries (HTTP): [HIDDEN]
```

### Update Deployment

```bash
# Bump version in subgraph.yaml
# version: 0.0.3

# Rebuild and redeploy
graph build
graph deploy --studio mecha-pay
```

---

## 🔍 Queries

### Using GraphQL Playground

Visit: [https://thegraph.com/studio/subgraph/mecha-pay](https://thegraph.com/studio/subgraph/mecha-pay)

### Example Queries

#### Get All Active Plans

```graphql
query ActivePlans {
  plans(where: { active: true }, orderBy: createdAt, orderDirection: desc) {
    id
    seller {
      id
    }
    price
    duration
    ipfsHash
    subscriptionCount
    totalGrossVolume
  }
}
```

#### Get Plans for a Specific Seller

```graphql
query SellerPlans($seller: Bytes!) {
  plans(
    where: { seller: $seller }
    orderBy: subscriptionCount
    orderDirection: desc
  ) {
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
```

**Variables**:
```json
{
  "seller": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb6"
}
```

#### Get Subscriber's Active Subscriptions

```graphql
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
    lastStartTime
    lastEndTime
    totalSpent
  }
}
```

#### Get Daily Revenue Statistics

```graphql
query DailyRevenue($startDate: BigInt!) {
  dailyStats(
    where: { dayStartTimestamp_gte: $startDate }
    orderBy: dayStartTimestamp
    orderDirection: desc
  ) {
    id
    dayStartTimestamp
    plansCreated
    subscriptionsCreated
    totalGrossVolume
    totalFeesCollected
  }
}
```

**Variables**:
```json
{
  "startDate": "1704067200"
}
```

#### Get Seller Statistics

```graphql
query SellerStats($seller: Bytes!) {
  seller(id: $seller) {
    planCount
    activePlanCount
    subscriptionCount
    totalGrossRevenue
    totalNetRevenue
    totalFeeContributed
    createdAt
    updatedAt
  }
}
```

### Using JavaScript/TypeScript

```typescript
const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL;

async function fetchPlans(seller: string) {
  const query = `
    query SellerPlans($seller: Bytes!) {
      plans(where: { seller: $seller }) {
        id
        price
        duration
        ipfsHash
        subscriptionCount
      }
    }
  `;

  const response = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { seller }
    })
  });

  const { data } = await response.json();
  return data.plans;
}
```

---

## 🧪 Testing

### Run Tests

```bash
graph test
```

### Test Structure

Located in `tests/subscription-gateway.test.ts`:

```typescript
import { describe, test, assert } from "matchstick-as/assembly/index";
import { handlePlanCreated } from "../src/subscription-gateway";

describe("PlanCreated handler", () => {
  test("Should create Plan entity", () => {
    // Create mock event
    const event = createPlanCreatedEvent(
      planId,
      seller,
      price,
      duration,
      ipfsHash
    );
    
    // Call handler
    handlePlanCreated(event);
    
    // Assert
    assert.fieldEquals("Plan", planId, "price", price.toString());
    assert.fieldEquals("Plan", planId, "active", "true");
  });
});
```

---

## 📂 File Structure

```
indexer/
├── abis/
│   └── SubscriptionGateway.json    # Contract ABI
├── src/
│   └── subscription-gateway.ts     # Event handlers
├── tests/
│   ├── subscription-gateway.test.ts
│   └── subscription-gateway-utils.ts
├── generated/                      # Auto-generated types
├── schema.graphql                  # GraphQL schema
├── subgraph.yaml                   # Subgraph manifest
├── networks.json                   # Network configurations
└── package.json
```

---

## 🔧 Configuration

### subgraph.yaml

```yaml
specVersion: 1.3.0
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: SubscriptionGateway
    network: arc-testnet
    source:
      address: "0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2"
      abi: SubscriptionGateway
      startBlock: 33756576
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.9
      language: wasm/assemblyscript
      entities:
        - Plan
        - Seller
        - Subscriber
        - SubscriptionState
        - DailyStats
      abis:
        - name: SubscriptionGateway
          file: ./abis/SubscriptionGateway.json
      eventHandlers:
        - event: PlanCreated(indexed bytes32,indexed address,uint256,uint32,string)
          handler: handlePlanCreated
        - event: Subscribed(indexed address,indexed address,indexed bytes32,uint256,uint256,string,uint32,uint32)
          handler: handleSubscribed
        - event: PlanStatusUpdated(indexed bytes32,bool)
          handler: handlePlanStatusUpdated
        - event: PlanUpdated(indexed bytes32,uint256,uint32,string)
          handler: handlePlanUpdated
      file: ./src/subscription-gateway.ts
```

---

## 📚 Additional Resources

- **Main README**: [../README.md](../README.md)
- **Smart Contracts**: [../Arc_contracts/README.md](../Arc_contracts/README.md)
- **The Graph Docs**: [https://thegraph.com/docs](https://thegraph.com/docs)
- **AssemblyScript**: [https://www.assemblyscript.org](https://www.assemblyscript.org)

---

## 🙋 Support

- **Issues**: [GitHub Issues](https://github.com/yourorg/autopay/issues)
- **Discord**: [Join our server](https://discord.gg/mechapay)
- **The Graph Discord**: [https://discord.gg/graphprotocol](https://discord.gg/graphprotocol)

---

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.