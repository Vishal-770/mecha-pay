const { ethers } = require("hardhat");

async function main() {
  const usdcAddress = "0x3600000000000000000000000000000000000000";
  console.log("Deploying SubscriptionGateway on Arc Testnet...");
  
  const gateway = await ethers.deployContract("SubscriptionGateway", [usdcAddress]);
  await gateway.waitForDeployment();
  
  const address = await gateway.getAddress();
  console.log("SubscriptionGateway successfully deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
