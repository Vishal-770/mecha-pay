# Arc Subscription Gateway

This project implements a decentralized subscription escrow system on the **Arc Testnet**, using **Circle's USDC** (ERC-20 interface) for payments.

## Deployed Address
**Arc Testnet**: `0x2BC2f391fca4144f708eEa918d94348684Bdb544`

---

## 🏛 Setup

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Environment Configuration**:
   Create a `.env` file and add your private key:
   ```bash
   PRIVATE_KEY=your_private_key_here
   ```

---

## 🚀 Commands

### Compilation & Testing
- **Compile Contracts**: `pnpm hardhat compile`
- **Run Local Tests**: `pnpm hardhat test`

### Arc Testnet Operations
- **Deploy Contract**:
  ```bash
  pnpm hardhat ignition deploy ./ignition/modules/SubscriptionGateway.js --network arc-testnet
  ```

---

## 📊 Network Details (Arc Testnet)
- **RPC**: `https://rpc.testnet.arc.network`
- **Chain ID**: `5042002`
- **USDC Address (ERC-20)**: `0x3600000000000000000000000000000000000000`

---

## Subgraph Deployment

- **IPFS Build CID**: `QmPzZBXPbRPLi64G2YkZGkaGtD4Mv9EHKH3kuEYrNj8CEx`
- **Studio Page**: `https://thegraph.com/studio/subgraph/mecha-pay`
- **Query Endpoint (v0.0.1)**: `https://api.studio.thegraph.com/query/1704298/mecha-pay/v0.0.2`
