const { ethers } = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0x252f9FC6660F848C4EcA3425198722bc711eBb31";
  
  // Use the Plan ID from your previous creation
  const PLAN_ID = "0x0eb041ca61413d3038c172c94c66d157db1c0673099cacd1e2da292934a9b067";
  
  console.log(`Fetching subscribers for Plan: ${PLAN_ID}`);

  const SubscriptionEscrow = await ethers.getContractAt("SubscriptionEscrow", CONTRACT_ADDRESS);

  // Filter by planId (the second indexed parameter)
  const filter = SubscriptionEscrow.filters.Subscribed(null, PLAN_ID);

  // Use the same block range protection for Arc Testnet
  const currentBlock = await ethers.provider.getBlockNumber();
  const fromBlock = Math.max(0, currentBlock - 9999);
  
  console.log(`Querying events from block ${fromBlock} to ${currentBlock}...`);
  const events = await SubscriptionEscrow.queryFilter(filter, fromBlock, currentBlock);

  console.log(`\nFound ${events.length} subscribers:\n`);

  for (const event of events) {
    const { subscriber, startTime, endTime, amount, subscriptionId } = event.args;
    
    // Check current status
    const isActive = await SubscriptionEscrow.isSubscribed(PLAN_ID, subscriber);
    const status = isActive ? "✅ ACTIVE" : "❌ EXPIRED/CANCELLED";

    console.log("-----------------------------------------");
    console.log(`Subscriber : ${subscriber}`);
    console.log(`Status     : ${status}`);
    console.log(`Joined     : ${new Date(Number(startTime) * 1000).toLocaleString()}`);
    console.log(`Ends       : ${new Date(Number(endTime) * 1000).toLocaleString()}`);
    console.log(`Sub ID     : ${subscriptionId}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
