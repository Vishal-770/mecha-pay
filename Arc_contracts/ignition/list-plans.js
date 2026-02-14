const { ethers } = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0x252f9FC6660F848C4EcA3425198722bc711eBb31";
  
  const SELLER_ADDRESS = "0x0CfB00Dc12f550D47A511Bb98B9fAE1D1240dcbA";
  console.log("Fetching plans for seller:", SELLER_ADDRESS);

  const SubscriptionEscrow = await ethers.getContractAt("SubscriptionEscrow", CONTRACT_ADDRESS);

  const filter = SubscriptionEscrow.filters.PlanCreated(null, SELLER_ADDRESS);

  // Arc Testnet RPC limits eth_getLogs to a 10,000 block range
  const currentBlock = await ethers.provider.getBlockNumber();
  const fromBlock = Math.max(0, currentBlock - 9999);
  
  console.log(`Querying events from block ${fromBlock} to ${currentBlock}...`);

  const events = await SubscriptionEscrow.queryFilter(filter, fromBlock, currentBlock);

  console.log(`\nFound ${events.length} plans:\n`);

  for (const event of events) {
    const { planId, price, duration, metadata } = event.args;
    console.log("-----------------------------------------");
    console.log(`Plan ID  : ${planId}`);
    console.log(`Price    : ${ethers.formatUnits(price, 6)} USDC`);
    console.log(`Duration : ${Number(duration) / (24 * 60 * 60)} days`);
    console.log(`Metadata : ${metadata}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
