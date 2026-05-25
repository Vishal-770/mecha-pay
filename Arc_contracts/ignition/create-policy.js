const { ethers } = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2";

  // Dummy plan details
  const price = ethers.parseUnits("1", 6); // 1 USDC
  const duration = 30 * 24 * 60 * 60; // 30 days
  const metadata = "Dummy Plan - Monthly";

  console.log("Creating plan on contract:", CONTRACT_ADDRESS);

  const SubscriptionGateway = await ethers.getContractAt(
    "SubscriptionGateway",
    CONTRACT_ADDRESS,
  );

  const [signer] = await ethers.getSigners();
  console.log("Using wallet:", await signer.getAddress());

  const tx = await SubscriptionGateway.createPlan(price, duration, metadata);
  console.log("Tx hash:", tx.hash);

  console.log("Transaction sent. Waiting for confirmation...");
  const receipt = await tx.wait();

  let planId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = SubscriptionGateway.interface.parseLog(log);
      if (parsed && parsed.name === "PlanCreated") {
        planId = parsed.args.planId;
        break;
      }
    } catch (_) {
      // Ignore non-matching logs.
    }
  }

  if (planId) {
    console.log("Policy (Plan) successfully created!");
    console.log("Plan ID:", planId);
  } else {
    console.log("Plan created, but PlanCreated event was not parsed.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
