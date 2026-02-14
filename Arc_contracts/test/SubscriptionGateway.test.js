const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SubscriptionGateway", function () {
  let mockUSDC;
  let gateway;
  let owner;
  let seller;
  let subscriber;
  let otherAccount;

  const INITIAL_FEE_BPS = 250; // 2.5%
  const PLAN_PRICE = ethers.parseUnits("50", 6); // 50 USDC
  const PLAN_DURATION = 30 * 24 * 60 * 60; // 30 days
  const IPFS_METADATA = "ipfs://QmYourPlanMetadataHash";

  beforeEach(async function () {
    [owner, seller, subscriber, otherAccount] = await ethers.getSigners();

    // Deploy Mock USDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();

    // Deploy SubscriptionGateway (Now named SubscriptionGateway in Contract.sol)
    const SubscriptionGateway = await ethers.getContractFactory("SubscriptionGateway");
    gateway = await SubscriptionGateway.deploy(mockUSDC.target);

    // Initial setups
    await gateway.setFee(INITIAL_FEE_BPS);

    // Mint USDC and Approve
    await mockUSDC.mint(subscriber.address, ethers.parseUnits("1000", 6));
    await mockUSDC.connect(subscriber).approve(gateway.target, ethers.parseUnits("1000", 6));
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
    it("Should create a plan successfully with on-chain data", async function () {
      const tx = await gateway.connect(seller).createPlan(PLAN_PRICE, PLAN_DURATION, IPFS_METADATA);
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => gateway.interface.parseLog(log)?.name === "PlanCreated");
      const planId = event.args[0];

      const plan = await gateway.plans(planId);
      expect(plan.seller).to.equal(seller.address);
      expect(plan.price).to.equal(PLAN_PRICE);
      expect(plan.duration).to.equal(PLAN_DURATION);
      expect(plan.ipfsHash).to.equal(IPFS_METADATA);
      expect(plan.active).to.be.true;
    });

    it("Should allow seller to toggle their plan status", async function () {
      const tx = await gateway.connect(seller).createPlan(PLAN_PRICE, PLAN_DURATION, IPFS_METADATA);
      const receipt = await tx.wait();
      const planId = receipt.logs.find(log => gateway.interface.parseLog(log)?.name === "PlanCreated").args[0];

      await gateway.connect(seller).setPlanStatus(planId, false);
      expect((await gateway.plans(planId)).active).to.be.false;

      await gateway.connect(seller).setPlanStatus(planId, true);
      expect((await gateway.plans(planId)).active).to.be.true;
    });

    it("Should prevent others from toggling the plan status", async function () {
      const tx = await gateway.connect(seller).createPlan(PLAN_PRICE, PLAN_DURATION, IPFS_METADATA);
      const receipt = await tx.wait();
      const planId = receipt.logs.find(log => gateway.interface.parseLog(log)?.name === "PlanCreated").args[0];

      await expect(gateway.connect(otherAccount).setPlanStatus(planId, false)).to.be.revertedWith("Not the seller");
    });
  });

  describe("Subscriptions (Stateless & Direct Payout)", function () {
    let planId;
    const BUYER_DATA = "user_12345_offchain_id";

    beforeEach(async function () {
      const tx = await gateway.connect(seller).createPlan(PLAN_PRICE, PLAN_DURATION, IPFS_METADATA);
      const receipt = await tx.wait();
      planId = receipt.logs.find(log => gateway.interface.parseLog(log)?.name === "PlanCreated").args[0];
    });

    it("Should transfer USDC directly to seller (minus fee)", async function () {
      const sellerInitialBal = await mockUSDC.balanceOf(seller.address);
      const gatewayInitialBal = await mockUSDC.balanceOf(gateway.target);

      await gateway.connect(subscriber).subscribe(planId, BUYER_DATA);

      const feeAmount = (PLAN_PRICE * BigInt(INITIAL_FEE_BPS)) / 10000n;
      const sellerAmount = PLAN_PRICE - feeAmount;

      const sellerFinalBal = await mockUSDC.balanceOf(seller.address);
      const gatewayFinalBal = await mockUSDC.balanceOf(gateway.target);

      expect(sellerFinalBal - sellerInitialBal).to.equal(sellerAmount);
      expect(gatewayFinalBal - gatewayInitialBal).to.equal(feeAmount);
    });

    it("Should emit the Subscribed event with correct data", async function () {
      const tx = await gateway.connect(subscriber).subscribe(planId, BUYER_DATA);
      const receipt = await tx.wait();
      const startTime = await time.latest();
      const endTime = startTime + PLAN_DURATION;

      await expect(tx)
        .to.emit(gateway, "Subscribed")
        .withArgs(
          subscriber.address,
          seller.address,
          planId,
          PLAN_PRICE,
          (PLAN_PRICE * BigInt(INITIAL_FEE_BPS)) / 10000n,
          BUYER_DATA,
          startTime,
          endTime
        );
    });

    it("Should revert if the plan is inactive", async function () {
      await gateway.connect(seller).setPlanStatus(planId, false);
      await expect(gateway.connect(subscriber).subscribe(planId, BUYER_DATA))
        .to.be.revertedWith("Plan is inactive");
    });

    it("Should work even if fee is 0%", async function () {
      await gateway.connect(owner).setFee(0);
      const sellerInitialBal = await mockUSDC.balanceOf(seller.address);

      await gateway.connect(subscriber).subscribe(planId, BUYER_DATA);

      expect(await mockUSDC.balanceOf(seller.address) - sellerInitialBal).to.equal(PLAN_PRICE);
      expect(await mockUSDC.balanceOf(gateway.target)).to.equal(0);
    });
  });

  describe("Fee Withdrawal", function () {
    it("Should allow the owner to withdraw collected fees", async function () {
      // Create and subscribe to generate fees
      const tx = await gateway.connect(seller).createPlan(PLAN_PRICE, PLAN_DURATION, IPFS_METADATA);
      const receipt = await tx.wait();
      const planId = receipt.logs.find(log => gateway.interface.parseLog(log)?.name === "PlanCreated").args[0];
      
      await gateway.connect(subscriber).subscribe(planId, "data");

      const fees = await mockUSDC.balanceOf(gateway.target);
      expect(fees).to.be.greaterThan(0);

      const recipientBalBefore = await mockUSDC.balanceOf(otherAccount.address);
      await gateway.connect(owner).withdrawFees(otherAccount.address, fees);
      const recipientBalAfter = await mockUSDC.balanceOf(otherAccount.address);

      expect(recipientBalAfter - recipientBalBefore).to.equal(fees);
      expect(await mockUSDC.balanceOf(gateway.target)).to.equal(0);
    });

    it("Should prevent non-owners from withdrawing fees", async function () {
      await expect(gateway.connect(otherAccount).withdrawFees(otherAccount.address, 100))
        .to.be.revertedWith("Not owner");
    });
  });
});
