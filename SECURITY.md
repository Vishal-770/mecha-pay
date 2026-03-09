# Security Policy

## 🔒 Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          | Status |
| ------- | ------------------ | ------ |
| 0.0.2   | :white_check_mark: | Testnet (Current) |
| 0.0.1   | :x:                | Deprecated |

**Note**: This project is currently in **testnet/beta**. Do not use in production with real funds until mainnet release (v1.0.0).

---

## 🚨 Reporting a Vulnerability

We take the security of Mecha Pay seriously. If you discover a security vulnerability, please follow these steps:

### Preferred Method: Private Disclosure

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please report security issues via:

1. **Email**: security@mechapay.com
2. **Subject**: [SECURITY] Brief description
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
   - Your contact information

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 5 business days
- **Status Update**: Every 7 days until resolution
- **Fix Timeline**: Critical issues within 30 days, others within 90 days
- **Credit**: You will be credited in release notes (unless you prefer anonymity)

### Disclosure Policy

- **Coordinated Disclosure**: We ask that you give us reasonable time to fix the issue before public disclosure
- **Public Acknowledgment**: After the fix is deployed, we'll publish a security advisory crediting you (with your permission)
- **Bug Bounty**: We may offer rewards for critical vulnerabilities (TBD for mainnet)

---

## 🛡️ Security Measures

### Smart Contracts

**Current Protections**:
- ✅ OpenZeppelin SafeERC20 for all token transfers
- ✅ Access control (onlyOwner for admin functions)
- ✅ Input validation (require statements)
- ✅ Reentrancy protection (direct transfers only, no external calls in critical paths)
- ✅ Monotonic timestamp protection for Arc Testnet compatibility
- ✅ Fee cap (maximum 10% protocol fee)
- ✅ Zero address checks

**Testnet Limitations** (Not Production Ready):
- ⚠️ **No formal audit** (planned for v1.0.0)
- ⚠️ **No pause mechanism** (consider adding before mainnet)
- ⚠️ **No upgrade pattern** (current contracts are immutable)
- ⚠️ **Limited gas optimization** (focus on correctness first)

**Planned for Mainnet** (v1.0.0):
- 🔜 Professional security audit (Certik, OpenZeppelin, or similar)
- 🔜 Pausable functionality for emergency stops
- 🔜 Timelock for admin functions
- 🔜 Multi-sig wallet for contract ownership
- 🔜 Formal verification of critical functions

### API Security

**Current Implementation**:
- ✅ **API Key Hashing**: SHA-256, never stored in plaintext
- ✅ **CORS Protection**: Configured for specific origins
- ✅ **Rate Limiting**: 100 requests/minute per API key
- ✅ **Input Validation**: All endpoints validate input parameters
- ✅ **MongoDB Security**: Parameterized queries prevent injection

**Schema**:
```javascript
{
  keyHash: "SHA-256 hash",  // Never store raw keys
  userId: "circle_uuid",
  merchantAddress: "0x...",
  revokedAt: null           // Instant revocation capability
}
```

### Wallet Security

**Circle User-Controlled Wallets**:
- ✅ **MPC Architecture**: Private keys split across multiple parties
- ✅ **OAuth Authentication**: Google login, no password management
- ✅ **PIN Protection**: 6-digit PIN required for all transactions
- ✅ **Device Binding**: Wallets tied to device tokens
- ✅ **Non-Custodial**: Users own keys via MPC shares
- ✅ **Circle Infrastructure**: Enterprise-grade key management

**Best Practices for Users**:
- Keep your PIN secure (never share)
- Use a strong Google account with 2FA enabled
- Don't share device tokens or user tokens
- Verify transaction details before confirming

### Infrastructure Security

**Frontend (Next.js)**:
- ✅ Environment variables never exposed to client
- ✅ HTTPS only (enforced on Vercel)
- ✅ Content Security Policy headers
- ✅ XSS protection via React's built-in escaping
- ✅ CSRF protection on state-changing endpoints

**Database (MongoDB)**:
- ✅ Connection string not exposed
- ✅ Parameterized queries
- ✅ Least privilege access
- ✅ Encrypted connections (TLS)
- ✅ Regular backups

---

## 🔐 Known Security Considerations

### Testnet Risks

1. **Testnet Tokens Have No Value**: Do not send real USDC to testnet contracts
2. **Contract Not Audited**: Use at your own risk
3. **Network Stability**: Arc Testnet may experience downtime
4. **Data Persistence**: Testnet databases may be reset

### Smart Contract Risks

1. **Immutability**: Contracts cannot be upgraded (intentional design)
2. **Front-Running**: Subscription transactions could be front-run (low impact)
3. **Oracle Dependency**: IPFS metadata relies on external service
4. **Timestamp Manipulation**: Miners can manipulate block.timestamp by ~15 seconds (mitigated by monotonic checks)

### API Risks

1. **API Key Exposure**: If leaked, attacker can query your plan data (revoke immediately)
2. **Rate Limiting**: May impact legitimate high-volume use cases (contact us)
3. **CORS Misconfiguration**: Overly permissive origins in development (tighten for production)

---

## 🔍 Security Checklist for Integrators

Before going live:

- [ ] Store API keys in environment variables, never in code
- [ ] Use HTTPS for all API calls
- [ ] Implement rate limiting on your end
- [ ] Validate all user inputs before sending to Mecha Pay APIs
- [ ] Handle errors gracefully (don't expose sensitive info)
- [ ] Monitor for unusual activity (unexpected subscriptions)
- [ ] Set up alerts for high-value transactions
- [ ] Test thoroughly on testnet before mainnet
- [ ] Review smart contract code yourself
- [ ] Consider insurance for smart contract risks (mainnet)

---

## 📜 Audit History

| Version | Auditor | Date | Report | Status |
|---------|---------|------|--------|--------|
| v0.0.2 | Self-review | 2024-03 | Internal | ⚠️ Testnet Only |
| v1.0.0 | TBD | TBD | Pending | 🔜 Planned |

**Audit Scope for v1.0.0**:
- Smart contracts (SubscriptionGateway)
- API authentication and authorization
- Frontend security (XSS, CSRF, injection)
- Infrastructure configuration

---

## 🛠️ Security Tools Used

- **Hardhat**: Smart contract development and testing
- **Slither**: Static analysis for Solidity
- **MythX**: Automated smart contract security analysis (planned)
- **OpenZeppelin Contracts**: Audited, battle-tested primitives
- **ESLint Security Plugin**: JavaScript/TypeScript security linting
- **OWASP Dependency Check**: Dependency vulnerability scanning (planned)

---

## 📚 Security Resources

### Smart Contract Security

- [ConsenSys Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [OpenZeppelin Security](https://docs.openzeppelin.com/contracts/4.x/security)
- [Solidity Security Considerations](https://docs.soliditylang.org/en/latest/security-considerations.html)

### Web3 Security

- [OWASP Blockchain Security Guide](https://owasp.org/www-project-blockchain/)
- [Trail of Bits Security Guidelines](https://github.com/crytic/building-secure-contracts)
- [Rekt News](https://rekt.news/) - Learn from others' security incidents

### API Security

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

---

## 🏆 Bug Bounty Program

**Status**: Not yet active (planned for mainnet)

**Scope** (when launched):
- Smart contracts
- API endpoints
- Frontend application
- Infrastructure

**Out of Scope**:
- Social engineering attacks
- Physical attacks
- Denial of Service (DoS/DDoS)
- Testnet issues (report via normal channels)

**Rewards** (estimated):
- Critical: $5,000 - $50,000
- High: $1,000 - $5,000
- Medium: $500 - $1,000
- Low: $100 - $500

**Details**: TBD (will be announced on [macha-pay.vercel.app](https://macha-pay.vercel.app))

---

## 📞 Contact

- **Security Email**: security@mechapay.com
- **General Support**: support@mechapay.com
- **Discord**: [Join our server](https://discord.gg/mechapay)
- **Twitter**: [@MechaPay](https://twitter.com/mechapay)

---

## 🙏 Responsible Disclosure Hall of Fame

We would like to thank the following security researchers for responsibly disclosing vulnerabilities:

*None yet - be the first!*

---

**Last Updated**: March 28, 2024  
**Version**: 0.0.2 (Testnet)

---

*Mecha Pay is committed to the security and privacy of our users. Thank you for helping us keep our platform safe.*
