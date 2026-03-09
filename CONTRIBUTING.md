# Contributing to Mecha Pay

First off, thank you for considering contributing to Mecha Pay! It's people like you that make Mecha Pay such a great tool for the Web3 community.

## 🌟 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to support@mechapay.com.

### Our Standards

**Positive behaviors include:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behaviors include:**
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

## 🚀 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include as many details as possible:

**Bug Report Template:**
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. macOS, Windows, Linux]
 - Browser: [e.g. Chrome, Safari]
 - Node version: [e.g. 18.17.0]
 - Network: [e.g. Arc Testnet, Base Sepolia]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear and descriptive title**
- **Step-by-step description** of the suggested enhancement
- **Explain why this enhancement would be useful** to most users
- **List any alternatives** you've considered

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes** with clear, descriptive commits
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Submit a pull request**

**PR Title Format:**
```
<type>(<scope>): <subject>

Examples:
feat(contracts): add subscription pause mechanism
fix(api): resolve CORS issue on /api/v1/status
docs(readme): update deployment instructions
chore(deps): upgrade ethers to v6.16.0
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 💻 Development Setup

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB (local or Atlas)
- Circle API key
- Privy App ID
- Git

### Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/autopay.git
cd autopay

# Install dependencies for all components
cd Arc_contracts && pnpm install && cd ..
cd circle-wallets && pnpm install && cd ..
cd indexer && pnpm install && cd ..

# Set up environment variables
cd circle-wallets
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development server
pnpm dev
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

# Frontend tests (if available)
cd circle-wallets
pnpm test
```

## 📝 Coding Standards

### TypeScript/JavaScript

- **Use TypeScript** for all new code
- **ESLint + Prettier** for formatting (run `pnpm lint`)
- **Strict mode** enabled
- **Explicit types** (avoid `any`)
- **Async/await** over promises
- **Named exports** preferred over default exports

**Example:**
```typescript
// Good ✅
export async function fetchPlan(planId: string): Promise<Plan> {
  const response = await fetch(`/api/plans/${planId}`);
  return response.json();
}

// Bad ❌
export default async function fetchPlan(planId) {
  return fetch(`/api/plans/${planId}`).then(r => r.json());
}
```

### Solidity

- **Follow OpenZeppelin conventions**
- **NatSpec comments** for all public/external functions
- **Use SafeERC20** for token transfers
- **Checks-Effects-Interactions** pattern
- **Gas optimization** where reasonable
- **No assembly** without strong justification

**Example:**
```solidity
/**
 * @notice Subscribe to a plan
 * @param planId The plan identifier
 * @param buyerData JSON metadata about the buyer
 */
function subscribe(bytes32 planId, string calldata buyerData) external {
    Plan storage plan = plans[planId];
    require(plan.active, "Plan is inactive");
    
    // ... implementation
}
```

### Git Commits

- **Conventional Commits** format
- **Present tense** ("Add feature" not "Added feature")
- **Imperative mood** ("Move cursor to..." not "Moves cursor to...")
- **Descriptive** but concise

**Good commit messages:**
```
feat(api): add subscription renewal endpoint
fix(contracts): prevent reentrancy in subscribe()
docs(integration): add webhook examples
test(subgraph): add plan creation tests
```

**Bad commit messages:**
```
Update stuff
Fix bug
WIP
asdfasdf
```

## 🏗️ Project Structure

```
autopay/
├── Arc_contracts/          # Smart contracts
│   ├── contracts/          # Solidity contracts
│   ├── ignition/           # Deployment scripts
│   └── test/               # Contract tests
│
├── circle-wallets/         # Next.js frontend
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── lib/                # Utilities and helpers
│   └── public/             # Static assets
│
├── indexer/                # The Graph subgraph
│   ├── src/                # Subgraph mappings
│   ├── schema.graphql      # GraphQL schema
│   └── subgraph.yaml       # Subgraph config
│
└── docs/                   # Documentation
```

## 🧪 Testing Guidelines

### Test Coverage Requirements

- **Smart Contracts**: Minimum 80% coverage
- **API Routes**: Test all endpoints
- **Critical Paths**: 100% coverage for payment flows

### Test Structure

```typescript
describe('SubscriptionGateway', () => {
  describe('createPlan', () => {
    it('should create a plan with valid parameters', async () => {
      // Arrange
      const price = ethers.parseUnits('10', 6);
      const duration = 30 * 24 * 60 * 60;
      
      // Act
      const tx = await contract.createPlan(price, duration, 'QmHash');
      
      // Assert
      expect(tx).to.emit(contract, 'PlanCreated');
    });
    
    it('should revert with zero price', async () => {
      await expect(
        contract.createPlan(0, 3600, 'QmHash')
      ).to.be.revertedWith('Price must be > 0');
    });
  });
});
```

## 📚 Documentation

When adding new features:

1. **Update README.md** if it affects user-facing behavior
2. **Add inline comments** for complex logic
3. **Write NatSpec** for smart contract functions
4. **Update API docs** for new endpoints
5. **Add examples** in the integration guide

## 🔍 Code Review Process

All submissions require review before merging:

1. **Automated checks** must pass (linting, tests, build)
2. **At least one approval** from maintainers
3. **Responsive to feedback** within 3 days
4. **Squash commits** before merging (we'll do this)

### What Reviewers Look For

- ✅ Code follows style guidelines
- ✅ Tests are included and passing
- ✅ Documentation is updated
- ✅ No breaking changes (or clearly documented)
- ✅ Security considerations addressed
- ✅ Performance implications considered

## 🎯 Areas Needing Contribution

We especially welcome contributions in:

- 🐛 **Bug Fixes**: Check [issues labeled "bug"](https://github.com/yourorg/autopay/labels/bug)
- 📚 **Documentation**: Improve clarity, add examples
- 🧪 **Tests**: Increase coverage, add edge cases
- 🌐 **Internationalization**: Add support for more languages
- ♿ **Accessibility**: Improve WCAG compliance
- 🎨 **UI/UX**: Design improvements, mobile optimization
- ⚡ **Performance**: Optimize gas usage, reduce bundle size

**Good First Issues**: Look for issues tagged [`good first issue`](https://github.com/yourorg/autopay/labels/good%20first%20issue)

## 🏷️ Semantic Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Incompatible API changes
- **MINOR**: Backwards-compatible functionality
- **PATCH**: Backwards-compatible bug fixes

## 📞 Communication

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas, general discussion
- **Discord**: Real-time chat (link in README)
- **Twitter**: Updates and announcements

## 🙏 Recognition

Contributors are recognized in:

- **README.md** Contributors section
- **Release notes** for significant contributions
- **Hall of Fame** on our website (coming soon)

## 📄 License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

**Thank you for contributing to Mecha Pay! Every contribution, no matter how small, is valuable. 💙**

Questions? Reach out to us at support@mechapay.com or join our [Discord](https://discord.gg/mechapay).



