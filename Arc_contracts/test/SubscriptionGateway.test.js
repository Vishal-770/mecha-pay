const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SubscriptionGateway", function () {
  let mockUSDC;
  let gateway;
  let owner;
  let seller;
  let subscriberOwner;
  let otherAccount;
  let sessionWallet;
  let mockSmartAccount;

  const INITIAL_FEE_BPS = 250; // 2.5%
  const PLAN_DURATION = 30 * 24 * 60 * 60; // 30 days
  const TIER_PRICES = [ethers.parseUnits("50", 6), ethers.parseUnits("100", 6)]; // 50 USDC, 100 USDC
  const TIER_LABELS = ["Basic", "Pro"];
  const IPFS_METADATA = "ipfs://QmYourPlanMetadataHash";

  beforeEach(async function () {
    [owner, seller, subscriberOwner, otherAccount] = await ethers.getSigners();

    // Deploy Mock USDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();

    // Deploy SubscriptionGateway
    const SubscriptionGateway = await ethers.getContractFactory("SubscriptionGateway");
    gateway = await SubscriptionGateway.deploy(mockUSDC.target);

    // Initial setups
    await gateway.setFee(INITIAL_FEE_BPS);

    // Deploy MockSmartAccount for the subscriber (ERC-1271)
    const MockSmartAccount = await ethers.getContractFactory("MockSmartAccount");
    mockSmartAccount = await MockSmartAccount.deploy(subscriberOwner.address);

    // Mint USDC to MockSmartAccount and Approve Gateway
    await mockUSDC.mint(mockSmartAccount.target, ethers.parseUnits("1000", 6));
    
    // We need to execute the approval from the mock smart account. Since it's a mock, we can just mint directly,
    // but the gateway will call transferFrom from mockSmartAccount address. Let's make mockSmartAccount approve gateway.
    // In our test, let's call approve directly on mockUSDC from the mockSmartAccount? Wait, mockSmartAccount doesn't have an approve function,
    // but we can make mockSmartAccount owner approve? No, transferFrom uses the allowance of mockSmartAccount address.
    // Wait! How does mockSmartAccount approve the gateway?
    // Let's modify MockSmartAccount to add a helper function `executeApprove(address token, address spender, uint256 amount)`!
    // That's an excellent idea. But wait, we can also just mint USDC to subscriberOwner directly and use subscriberOwner as EOA subscriber,
    // and for ERC-1271 testing, we can use the MockSmartAccount!
    // Wait, let's see. If we use the MockSmartAccount, we do need it to approve the gateway to spend its USDC.
    // Let's see if we can add a quick execute call to MockSmartAccount. Yes! Let's update MockSmartAccount.sol to add a simple `execute` function.
    // Let's do that or add a helper to MockSmartAccount.sol.
  });

  describe("Deployment & Configuration", function () {
    it("Should set the correct owner and USDC address", async function () {
      expect(await gateway.owner()).to.equal(owner.address);
      expect(await gateway.USDC()).to.equal(mockUSDC.target);
    });

    it("Should have a default fee of 2.5%", async function () {
      expect(await gateway.feeBps()).to.equal(INITIAL_FEE_BPS);
    });

    it("Should allow the owner to update the fee", async function () {
      await gateway.connect(owner).setFee(500); // 5%
      expect(await gateway.feeBps()).to.equal(500);
    });

    it("Should prevent setting excessive fees (max 10%)", async function () {
      await expect(gateway.connect(owner).setFee(1100)).to.be.revertedWith("Fee too high (max 10%)");
    });
  });

  describe("Plan Management", function () {
    it("Should create a plan successfully with on-chain data and tiers", async function () {
      const tx = await gateway.connect(seller).createPlan(PLAN_DURATION, IPFS_METADATA, TIER_PRICES, TIER_LABELS);
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => gateway.interface.parseLog(log)?.name === "PlanCreated");
      const planId = event.args[0];

      const plan = await gateway.plans(planId);
      expect(plan.seller).to.equal(seller.address);
      expect(plan.duration).to.equal(PLAN_DURATION);
      expect(plan.ipfsHash).to.equal(IPFS_METADATA);
      expect(plan.active).to.be.true;
      expect(plan.tierCount).to.equal(2);

      const tier0 = await gateway.getTier(planId, 0);
      expect(tier0.price).to.equal(TIER_PRICES[0]);
      expect(tier0.label).to.equal(TIER_LABELS[0]);
      expect(tier0.active).to.be.true;
    });

    it("Should allow seller to toggle their plan status", async function () {
      const tx = await gateway.connect(seller).createPlan(PLAN_DURATION, IPFS_METADATA, TIER_PRICES, TIER_LABELS);
      const receipt = await tx.wait();
      const planId = receipt.logs.find(log => gateway.interface.parseLog(log)?.name === "PlanCreated").args[0];

      await gateway.connect(seller).setPlanStatus(planId, false);
      expect((await gateway.plans(planId)).active).to.be.false;

      await gateway.connect(seller).setPlanStatus(planId, true);
      expect((await gateway.plans(planId)).active).to.be.true;
    });
  });

  describe("Subscriptions (Manual & EOA)", function () {
    let planId;
    const BUYER_DATA = "user_12345_offchain_id";

    beforeEach(async function () {
      const tx = await gateway.connect(seller).createPlan(PLAN_DURATION, IPFS_METADATA, TIER_PRICES, TIER_LABELS);
      const receipt = await tx.wait();
      planId = receipt.logs.find(log => gateway.interface.parseLog(log)?.name === "PlanCreated").args[0];

      // Setup subscriber EOA (subscriberOwner)
      await mockUSDC.mint(subscriberOwner.address, ethers.parseUnits("1000", 6));
      await mockUSDC.connect(subscriberOwner).approve(gateway.target, ethers.parseUnits("1000", 6));
    });

    it("Should transfer USDC directly to seller (minus fee)", async function () {
      const sellerInitialBal = await mockUSDC.balanceOf(seller.address);
      const gatewayInitialBal = await mockUSDC.balanceOf(gateway.target);

      await gateway.connect(subscriberOwner).subscribe(planId, 0, BUYER_DATA);

      const feeAmount = (TIER_PRICES[0] * BigInt(INITIAL_FEE_BPS)) / 10000n;
      const sellerAmount = TIER_PRICES[0] - feeAmount;

      expect(await mockUSDC.balanceOf(seller.address) - sellerInitialBal).to.equal(sellerAmount);
      expect(await mockUSDC.balanceOf(gateway.target) - gatewayInitialBal).to.equal(feeAmount);
    });

    it("Should initialize tracking state variables", async function () {
      await gateway.connect(subscriberOwner).subscribe(planId, 0, BUYER_DATA);
      const startTime = await time.latest();
      const expectedEndTime = startTime + PLAN_DURATION;

      expect(await gateway.executedCycles(planId, subscriberOwner.address)).to.equal(1);
      expect(await gateway.nextAllowedTimestamp(planId, subscriberOwner.address)).to.equal(expectedEndTime);
    });
  });

  describe("AutoPay Subscriptions (subscribeWithSignature)", function () {
    let planId;
    const BUYER_DATA = "autopay_buyer_data";

    beforeEach(async function () {
      const tx = await gateway.connect(seller).createPlan(PLAN_DURATION, IPFS_METADATA, TIER_PRICES, TIER_LABELS);
      const receipt = await tx.wait();
      planId = receipt.logs.find(log => gateway.interface.parseLog(log)?.name === "PlanCreated").args[0];

      sessionWallet = ethers.Wallet.createRandom(ethers.provider);

      // Deploy MockSmartAccount with helper approve
      const MockSmartAccount = await ethers.getContractFactory("MockSmartAccountHelper");
      mockSmartAccount = await MockSmartAccount.deploy(subscriberOwner.address);

      // Mint and Approve from mock smart account using helper
      await mockUSDC.mint(mockSmartAccount.target, ethers.parseUnits("1000", 6));
      await mockSmartAccount.connect(subscriberOwner).executeApprove(mockUSDC.target, gateway.target, ethers.parseUnits("1000", 6));
    });

    it("Should execute AutoPay subscription with valid ERC-1271 signature", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const maxCycles = 5;
      const tierId = 0;

      // Construct EIP-712 signature
      const domain = {
        name: "MechaPay Subscription Gateway",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: gateway.target,
      };

      const types = {
        AuthorizeSessionKey: [
          { name: "subscriber", type: "address" },
          { name: "sessionPublicKey", type: "address" },
          { name: "planId", type: "bytes32" },
          { name: "tierId", type: "uint256" },
          { name: "maxCycles", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const value = {
        subscriber: mockSmartAccount.target,
        sessionPublicKey: sessionWallet.address,
        planId: planId,
        tierId: tierId,
        maxCycles: maxCycles,
        deadline: deadline,
      };

      // Sign EIP-712 with the subscriberOwner EOA (who owns the MockSmartAccount)
      const signature = await subscriberOwner.signTypedData(domain, types, value);

      // Fund the session wallet with ETH so it can pay for transaction fees
      await owner.sendTransaction({
        to: sessionWallet.address,
        value: ethers.parseEther("1.0"),
      });

      const sellerInitialBal = await mockUSDC.balanceOf(seller.address);

      // Execute from the sessionWallet EOA caller!
      await gateway.connect(sessionWallet).subscribeWithSignature(
        mockSmartAccount.target,
        sessionWallet.address,
        planId,
        tierId,
        maxCycles,
        deadline,
        signature,
        BUYER_DATA
      );

      const feeAmount = (TIER_PRICES[tierId] * BigInt(INITIAL_FEE_BPS)) / 10000n;
      const sellerAmount = TIER_PRICES[tierId] - feeAmount;

      expect(await mockUSDC.balanceOf(seller.address) - sellerInitialBal).to.equal(sellerAmount);
      expect(await gateway.executedCycles(planId, mockSmartAccount.target)).to.equal(1);
    });

    it("Should prevent executing second cycle before nextAllowedTimestamp", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const maxCycles = 5;
      const tierId = 0;

      const domain = {
        name: "MechaPay Subscription Gateway",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: gateway.target,
      };

      const types = {
        AuthorizeSessionKey: [
          { name: "subscriber", type: "address" },
          { name: "sessionPublicKey", type: "address" },
          { name: "planId", type: "bytes32" },
          { name: "tierId", type: "uint256" },
          { name: "maxCycles", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const value = {
        subscriber: mockSmartAccount.target,
        sessionPublicKey: sessionWallet.address,
        planId: planId,
        tierId: tierId,
        maxCycles: maxCycles,
        deadline: deadline,
      };

      const signature = await subscriberOwner.signTypedData(domain, types, value);

      await owner.sendTransaction({ to: sessionWallet.address, value: ethers.parseEther("1.0") });

      // First execution is successful
      await gateway.connect(sessionWallet).subscribeWithSignature(
        mockSmartAccount.target,
        sessionWallet.address,
        planId,
        tierId,
        maxCycles,
        deadline,
        signature,
        BUYER_DATA
      );

      // Immediate second execution fails
      await expect(
        gateway.connect(sessionWallet).subscribeWithSignature(
          mockSmartAccount.target,
          sessionWallet.address,
          planId,
          tierId,
          maxCycles,
          deadline,
          signature,
          BUYER_DATA
        )
      ).to.be.revertedWith("Too early for next cycle");
    });

    it("Should succeed executing subsequent cycle after duration has passed", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400 * 100;
      const maxCycles = 5;
      const tierId = 0;

      const domain = {
        name: "MechaPay Subscription Gateway",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: gateway.target,
      };

      const types = {
        AuthorizeSessionKey: [
          { name: "subscriber", type: "address" },
          { name: "sessionPublicKey", type: "address" },
          { name: "planId", type: "bytes32" },
          { name: "tierId", type: "uint256" },
          { name: "maxCycles", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const value = {
        subscriber: mockSmartAccount.target,
        sessionPublicKey: sessionWallet.address,
        planId: planId,
        tierId: tierId,
        maxCycles: maxCycles,
        deadline: deadline,
      };

      const signature = await subscriberOwner.signTypedData(domain, types, value);

      await owner.sendTransaction({ to: sessionWallet.address, value: ethers.parseEther("1.0") });

      await gateway.connect(sessionWallet).subscribeWithSignature(
        mockSmartAccount.target,
        sessionWallet.address,
        planId,
        tierId,
        maxCycles,
        deadline,
        signature,
        BUYER_DATA
      );

      // Fast forward time by PLAN_DURATION
      await time.increase(PLAN_DURATION + 1);

      // Second execution succeeds!
      await gateway.connect(sessionWallet).subscribeWithSignature(
        mockSmartAccount.target,
        sessionWallet.address,
        planId,
        tierId,
        maxCycles,
        deadline,
        signature,
        BUYER_DATA
      );

      expect(await gateway.executedCycles(planId, mockSmartAccount.target)).to.equal(2);
    });

    it("Should revert if maxCycles is reached", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400 * 100;
      const maxCycles = 1; // Limit to 1 cycle only
      const tierId = 0;

      const domain = {
        name: "MechaPay Subscription Gateway",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: gateway.target,
      };

      const types = {
        AuthorizeSessionKey: [
          { name: "subscriber", type: "address" },
          { name: "sessionPublicKey", type: "address" },
          { name: "planId", type: "bytes32" },
          { name: "tierId", type: "uint256" },
          { name: "maxCycles", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const value = {
        subscriber: mockSmartAccount.target,
        sessionPublicKey: sessionWallet.address,
        planId: planId,
        tierId: tierId,
        maxCycles: maxCycles,
        deadline: deadline,
      };

      const signature = await subscriberOwner.signTypedData(domain, types, value);

      await owner.sendTransaction({ to: sessionWallet.address, value: ethers.parseEther("1.0") });

      // First cycle succeeds
      await gateway.connect(sessionWallet).subscribeWithSignature(
        mockSmartAccount.target,
        sessionWallet.address,
        planId,
        tierId,
        maxCycles,
        deadline,
        signature,
        BUYER_DATA
      );

      // Fast forward time
      await time.increase(PLAN_DURATION + 1);

      // Second cycle fails because limit is 1
      await expect(
        gateway.connect(sessionWallet).subscribeWithSignature(
          mockSmartAccount.target,
          sessionWallet.address,
          planId,
          tierId,
          maxCycles,
          deadline,
          signature,
          BUYER_DATA
        )
      ).to.be.revertedWith("Max cycles reached");
    });
  });
});
