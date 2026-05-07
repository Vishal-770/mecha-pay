const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
    const rpcUrl = "https://rpc.testnet.arc.network";
    const privateKey = process.env.PRIVATE_KEY;
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "Contract.sol", "SubscriptionGateway.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    console.log("Deploying SubscriptionGateway...");
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    
    // Arc Testnet USDC Address
    const usdcAddress = "0x3600000000000000000000000000000000000000";
    
    const contract = await factory.deploy(usdcAddress);
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("SubscriptionGateway deployed to:", address);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
