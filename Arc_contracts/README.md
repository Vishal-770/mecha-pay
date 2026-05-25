# Arc Subscription Gateway Smart Contracts

This directory contains the Solidity smart contracts for Mecha Pay's subscription payment system, deployed on **Arc Testnet** where USDC is the native gas token.

## 📜 Deployed Contract

**Network**: Arc Testnet (Chain ID: 5042002)  
**Contract**: `SubscriptionGateway`  
**Address**: [`0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2`](https://testnet.arcscan.app/address/0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2)  
**USDC Token**: `0x3600000000000000000000000000000000000000` (Native ERC-20)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Contract Architecture](#contract-architecture)
- [Setup & Installation](#setup--installation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Verification](#verification)
- [Security](#security)
- [Interacting with Contracts](#interacting-with-contracts)

---

## 🎯 Overview

The **SubscriptionGateway** contract enables merchants to create subscription plans and receive USDC payments from subscribers. Key features:

- ✅ **Hybrid Storage**: Plans on-chain, subscriptions event-based
- ✅ **Direct Payouts**: Sellers receive funds immediately (minus protocol fee)
- ✅ **Gas Efficient**: Event-based subscription tracking
- ✅ **Arc Compatible**: Monotonic timestamp protection
- ✅ **USDC Only**: Enforces 6-decimal USDC token
- ✅ **Fee Capped**: Maximum 10% protocol fee

---

## 🏗️ Contract Architecture

### SubscriptionGateway.sol

**State Variables**:
```solidity
IERC20 public immutable USDC;           // 0x3600...0000 on Arc Testnet
address public owner;                    // Contract owner (fee recipient)
uint256 public feeBps;                   // Protocol fee (250 = 2.5%)
uint256 public planNonce;                // Incremental plan ID
uint32 public lastSubTimestamp;          // Monotonic timestamp tracker
mapping(bytes32 => Plan) public plans;   // Plan storage
```

**Core Functions**:
- `createPlan(price, duration, ipfsHash)` - Create subscription plan
- `subscribe(planId, buyerData)` - Subscribe to a plan
- `setPlanStatus(planId, active)` - Enable/disable plan
- `updatePlan(planId, price, duration, ipfsHash)` - Update plan details
- `setFee(newFeeBps)` - Update protocol fee (owner only)
- `withdrawFees(to, amount)` - Withdraw protocol fees (owner only)

**Events**:
- `PlanCreated` - New plan created
- `Subscribed` - New subscription (includes startTime, endTime)
- `PlanStatusUpdated` - Plan activated/deactivated
- `PlanUpdated` - Plan details changed
- `FeeUpdated` - Protocol fee changed
- `FeesWithdrawn` - Protocol fees withdrawn

---

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Private key with Arc Testnet USDC for gas

### Install Dependencies

```bash
cd Arc_contracts
pnpm install
```

### Environment Configuration

Create a `.env` file:

```bash
PRIVATE_KEY=your_private_key_here
```

**Security**: Never commit your `.env` file or private keys!

---

## 💻 Development

### Compile Contracts

```bash
pnpm hardhat compile
```

This generates:
- `artifacts/` - Contract ABIs and bytecode
- `typechain-types/` - TypeScript bindings

### Clean Build

```bash
pnpm hardhat clean
pnpm hardhat compile
```

### Local Blockchain

```bash
# Start local Hardhat node
pnpm hardhat node

# Deploy to local node (new terminal)
pnpm hardhat ignition deploy ./ignition/modules/SubscriptionGateway.js --network localhost
```

---

## 🧪 Testing

### Run All Tests

```bash
pnpm hardhat test
```

### Run Specific Test

```bash
pnpm hardhat test test/SubscriptionGateway.test.js
```

### Coverage Report

```bash
pnpm hardhat coverage
```

**Target**: Minimum 80% coverage

### Test Structure

```javascript
describe("SubscriptionGateway", function () {
  describe("createPlan", function () {
    it("Should create a plan with valid parameters", async function () {
      const price = ethers.parseUnits("10", 6);
      const duration = 30 * 24 * 60 * 60; // 30 days
      
      await expect(contract.createPlan(price, duration, "QmHash"))
        .to.emit(contract, "PlanCreated");
    });
    
    it("Should revert with zero price", async function () {
      await expect(contract.createPlan(0, 3600, "QmHash"))
        .to.be.revertedWith("Price must be > 0");
    });
  });
});
```

---

## 🚀 Deployment

### Deploy to Arc Testnet

```bash
pnpm hardhat ignition deploy ./ignition/modules/SubscriptionGateway.js --network arc-testnet
```

**Output**:
```
Deployed SubscriptionGateway to: 0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2
```

### Deployment Module

Located at `ignition/modules/SubscriptionGateway.js`:

```javascript
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("SubscriptionGateway", (m) => {
  const usdcAddress = "0x3600000000000000000000000000000000000000";
  const subscriptionGateway = m.contract("SubscriptionGateway", [usdcAddress]);
  return { subscriptionGateway };
});
```

### Custom Deployment Script

```javascript
const hre = require("hardhat");

async function main() {
  const usdcAddress = "0x3600000000000000000000000000000000000000";
  
  const SubscriptionGateway = await hre.ethers.getContractFactory("SubscriptionGateway");
  const gateway = await SubscriptionGateway.deploy(usdcAddress);
  
  await gateway.waitForDeployment();
  
  console.log("SubscriptionGateway deployed to:", await gateway.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

---

## ✅ Verification

### Verify on ArcScan

```bash
pnpm hardhat verify --network arc-testnet 0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2 "0x3600000000000000000000000000000000000000"
```

**Verified Contract**: [View on ArcScan](https://testnet.arcscan.app/address/0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2)

---

## 🔒 Security

### Security Features

1. **SafeERC20**: OpenZeppelin's SafeERC20 for all token transfers
2. **Access Control**: `onlyOwner` modifier for admin functions
3. **Input Validation**: `require` statements for all parameters
4. **Reentrancy Protection**: Direct transfers only, no external calls
5. **Monotonic Timestamps**: Arc Testnet compatibility
6. **Fee Cap**: Maximum 10% protocol fee (1000 basis points)
7. **Zero Address Checks**: Prevents sending funds to 0x0

### Audit Status

- ⚠️ **Current**: Self-reviewed (testnet only)
- 🔜 **Planned**: Professional audit for mainnet (v1.0.0)

### Security Tools

```bash
# Static analysis with Slither
pip install slither-analyzer
slither contracts/Contract.sol
```

### Known Limitations

- No pause mechanism (planned for mainnet)
- No upgrade pattern (immutable by design)
- Limited gas optimization (correctness prioritized)

---

## 🔧 Interacting with Contracts

### Using Hardhat Console

```bash
pnpm hardhat console --network arc-testnet
```

```javascript
const gateway = await ethers.getContractAt(
  "SubscriptionGateway",
  "0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2"
);

// Create a plan
const price = ethers.parseUnits("10", 6); // 10 USDC
const duration = 30 * 24 * 60 * 60; // 30 days
const tx = await gateway.createPlan(price, duration, "QmIPFSHash");
await tx.wait();

// Get plan details
const planId = "0x..."; // From PlanCreated event
const plan = await gateway.plans(planId);
console.log(plan);
```

### Using ethers.js

```javascript
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider("https://rpc.testnet.arc.network");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contractAddress = "0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2";
const abi = [/* ABI from artifacts */];

const contract = new ethers.Contract(contractAddress, abi, wallet);

// Subscribe to a plan
const planId = "0x1a2b3c4d...";
const buyerData = JSON.stringify({ userId: "user_123" });

const tx = await contract.subscribe(planId, buyerData);
const receipt = await tx.wait();
console.log("Subscribed! TX:", receipt.hash);
```

### Using Cast (Foundry)

```bash
# Read plan details
cast call 0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2 \
  "plans(bytes32)(address,uint256,uint32,string,bool)" \
  0x1a2b3c4d... \
  --rpc-url https://rpc.testnet.arc.network

# Create plan
cast send 0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2 \
  "createPlan(uint256,uint32,string)" \
  10000000 2592000 "QmHash" \
  --private-key $PRIVATE_KEY \
  --rpc-url https://rpc.testnet.arc.network
```

---

## 📊 Network Details

### Arc Testnet

| Property | Value |
|----------|-------|
| **Chain ID** | 5042002 |
| **RPC URL** | https://rpc.testnet.arc.network |
| **Explorer** | https://testnet.arcscan.app |
| **USDC Address** | 0x3600000000000000000000000000000000000000 |
| **Native Gas Token** | USDC (18 decimals for gas, 6 for ERC-20) |
| **Block Time** | ~0.5 seconds |

### Hardhat Configuration

Located at `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    "arc-testnet": {
      url: "https://rpc.testnet.arc.network",
      chainId: 5042002,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

---

## 📚 Additional Resources

- **Main README**: [../README.md](../README.md)
- **Smart Contract Docs**: [../README.md#smart-contract-documentation](../README.md#smart-contract-documentation)
- **Integration Guide**: [../README.md#integration-guide](../README.md#integration-guide)
- **API Documentation**: [../README.md#api-documentation](../README.md#api-documentation)
- **The Graph Subgraph**: [../indexer/README.md](../indexer/README.md)

---

## 🙋 Support

- **Issues**: [GitHub Issues](https://github.com/yourorg/autopay/issues)
- **Discord**: [Join our server](https://discord.gg/mechapay)
- **Email**: support@mechapay.com

---

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.
