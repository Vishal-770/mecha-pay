# Changelog

All notable changes to Mecha Pay will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Auto-renewal subscriptions with Gelato Automate
- Email notification system
- Subscription gifting feature
- Multi-plan bundles
- Promo codes and discounts
- Webhook system for real-time notifications
- Mobile app (React Native)

---

## [0.0.2] - 2024-03-28

### Added
- **Payment Page**: Standalone checkout experience at `/pay/[planId]`
  - Circle wallet authentication (Google OAuth)
  - USDC balance checking
  - Optional CCTP bridging from 15+ chains
  - Success redirects with query parameters
- **CCTP Bridging**: Integrated Circle's Cross-Chain Transfer Protocol
  - Support for 15+ EVM testnets (Base, Arbitrum, Optimism, etc.)
  - Burn-and-mint architecture for canonical USDC
  - Automatic attestation handling
- **API System**: RESTful API with authentication
  - API key generation with SHA-256 hashing
  - Endpoints: `/api/v1/plans`, `/api/v1/subscriptions`, `/api/v1/status`
  - Public status verification API
- **The Graph Subgraph**: Real-time event indexing
  - GraphQL API for plan and subscription queries
  - Aggregated seller and subscriber statistics
  - Daily revenue analytics
- **Dashboard Improvements**:
  - API key management page
  - Revenue analytics charts
  - Subscriber demographics
  - Bridge interface for cross-chain USDC transfers
- **Documentation**:
  - Comprehensive README with 1700+ lines
  - Smart contract documentation with full ABI
  - API reference with examples
  - Integration guide for merchants
  - CONTRIBUTING.md
  - SECURITY.md

### Changed
- Updated payment flow: Plan details visible before login
- Improved Circle wallet initialization process
- Enhanced error handling across all components
- Optimized subgraph queries for better performance

### Fixed
- CORS issues on public API endpoints
- Circle wallet PIN setup flow
- USDC approval handling in payment page
- Monotonic timestamp edge cases on Arc Testnet

### Security
- Implemented SHA-256 hashing for API keys
- Added rate limiting (100 req/min per key)
- Input validation on all API endpoints
- CORS configuration for production

---

## [0.0.1] - 2024-02-15

### Added
- **Smart Contracts**:
  - `SubscriptionGateway` contract deployed to Arc Testnet
  - Plan creation with IPFS metadata
  - Subscription payment processing
  - Protocol fee system (2.5% default)
  - Direct seller payouts
- **Frontend Application**:
  - Next.js 16 with App Router
  - Circle User-Controlled Wallets integration
  - Privy wallet support for bridging
  - Dashboard for plan management
  - Landing page
- **Core Features**:
  - Create subscription plans
  - Subscribe to plans with USDC
  - Plan status management (active/inactive)
  - Plan updates (price, duration, metadata)
  - IPFS metadata storage via Filebase
- **Development Tools**:
  - Hardhat development environment
  - Smart contract tests
  - TypeScript support throughout
  - ESLint and Prettier configuration

### Deployed
- **Contract Address**: `0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2`
- **Network**: Arc Testnet (Chain ID: 5042002)
- **Frontend**: Deployed to Vercel

---

## [0.0.0] - 2024-01-10

### Initial Setup
- Project repository created
- Basic project structure established
- Dependencies configured
- Development environment setup

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 0.0.2 | 2024-03-28 | Payment page, CCTP bridging, API system, subgraph |
| 0.0.1 | 2024-02-15 | Smart contracts, basic frontend, plan management |
| 0.0.0 | 2024-01-10 | Initial setup |

---

## Upgrade Notes

### Upgrading to 0.0.2 from 0.0.1

**Breaking Changes**: None

**New Features**:
1. Payment page available at `/pay/[planId]`
2. API keys can be generated from dashboard
3. The Graph subgraph provides real-time data

**Migration Steps**:
1. Update frontend dependencies: `pnpm install`
2. Add new environment variables:
   ```
   NEXT_PUBLIC_SUBGRAPH_URL=your_subgraph_url
   FILEBASE_ACCESS_KEY=your_key
   FILEBASE_SECRET_KEY=your_secret
   ```
3. Deploy updated frontend
4. No smart contract changes required

---

## Future Roadmap

### v0.1.0 (Beta) - Q2 2024
- [ ] Auto-renewal subscriptions
- [ ] Email notifications
- [ ] Subscription gifting
- [ ] Multi-plan bundles
- [ ] Promo codes
- [ ] Webhook system
- [ ] Mobile app beta

### v1.0.0 (Mainnet) - Q4 2024
- [ ] Professional security audit
- [ ] Arc Mainnet deployment
- [ ] USDC mainnet support
- [ ] Legal compliance (Terms, Privacy)
- [ ] Customer support system
- [ ] Merchant onboarding
- [ ] Yield generation
- [ ] Fiat on-ramps

---

## Links

- **Repository**: [https://github.com/yourorg/autopay](https://github.com/yourorg/autopay)
- **Website**: [https://macha-pay.vercel.app](https://macha-pay.vercel.app)
- **Documentation**: [https://macha-pay.vercel.app/docs](https://macha-pay.vercel.app/docs)
- **The Graph**: [https://thegraph.com/studio/subgraph/mecha-pay](https://thegraph.com/studio/subgraph/mecha-pay)

---

**Format**: [Keep a Changelog](https://keepachangelog.com/)  
**Versioning**: [Semantic Versioning](https://semver.org/)
