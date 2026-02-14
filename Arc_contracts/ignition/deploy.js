const { ethers } = require("hardhat");

async function main() {
  const USDC_ADDRESS = "0x3600000000000000000000000000000000000000"; // Circle USDC (ERC-20) on Arc Testnet

  console.log("Deploying SubscriptionEscrow with USDC:", USDC_ADDRESS);

  const SubscriptionEscrow = await ethers.getContractFactory("SubscriptionEscrow");
  const escrow = await SubscriptionEscrow.deploy(USDC_ADDRESS);

  await escrow.waitForDeployment();

  console.log("SubscriptionEscrow deployed to:", await escrow.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
