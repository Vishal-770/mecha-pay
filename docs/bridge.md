Today 2:47 AM
can this be done from privy metamask eoa usdc on any supported testnet to bridge to a user controlled wallet of cirlce on arc test net ? if yes give code

Circle AI
2:47 AM
/**
 * Bridge USDC from Privy Metamask EOA (Ethereum Sepolia) to Circle User-Controlled Wallet (Arc Testnet)
 * using CCTP V2 via Circle Bridge Kit SDK.
 *
 * Prerequisites:
 * - npm install @circle-fin/bridge-kit@1.1.1 @circle-fin/adapter-ethers-v6@1.1.1 ethers
 * - npm install @circle-fin/adapter-circle-wallets@1.0.0
 *
 * Environment Variables to set:
 * - PRIVY_EOA_PRIVATE_KEY: Private key of the Privy Metamask EOA on Ethereum Sepolia
 * - CIRCLE_API_KEY: Circle API key (format: TEST_API_KEY:abc:def or Base64)
 * - CIRCLE_ENTITY_SECRET: Circle entity secret (64 lowercase alphanumeric chars)
 * - ARC_TESTNET_WALLET_ADDRESS: The Circle User-Controlled Wallet address on Arc Testnet
 * - ETHEREUM_SEPOLIA_WALLET_ADDRESS: The Privy Metamask EOA address on Ethereum Sepolia
 * - BRIDGE_AMOUNT: Amount of USDC to bridge (e.g., "1.00")
 */

import { BridgeKit } from "@circle-fin/bridge-kit"; // Removed BridgeStep as it's not exported
import { createAdapterFromPrivateKey as createEthersAdapter } from "@circle-fin/adapter-ethers-v6";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";

// ============================================================
// PLACEHOLDER VARIABLES - Fill these in before running
// ============================================================
const PRIVY_EOA_PRIVATE_KEY = process.env.PRIVY_EOA_PRIVATE_KEY || "YOUR_PRIVY_EOA_PRIVATE_KEY_HERE";
const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY || "YOUR_CIRCLE_API_KEY_HERE";
const CIRCLE_ENTITY_SECRET = process.env.CIRCLE_ENTITY_SECRET || "YOUR_CIRCLE_ENTITY_SECRET_HERE";

// The Circle User-Controlled Wallet address on Arc Testnet
// To obtain this address:
// 1. Log in to the Circle Developer Console (https://console.circle.com)
// 2. Navigate to "User-Controlled Wallets" under the Programmable Wallets section
// 3. Create a new wallet set and wallet for Arc Testnet blockchain
// 4. Copy the wallet address (0x...) from the wallet details
const ARC_TESTNET_WALLET_ADDRESS = process.env.ARC_TESTNET_WALLET_ADDRESS || "YOUR_ARC_TESTNET_CIRCLE_WALLET_ADDRESS_HERE";

// The Privy Metamask EOA address on Ethereum Sepolia
const ETHEREUM_SEPOLIA_WALLET_ADDRESS = process.env.ETHEREUM_SEPOLIA_WALLET_ADDRESS || "YOUR_ETHEREUM_SEPOLIA_EOA_ADDRESS_HERE";

// Amount of USDC to bridge (human-readable, e.g., "1.00" = 1 USDC)
const BRIDGE_AMOUNT = process.env.BRIDGE_AMOUNT || "1.00";

// ============================================================
// Main Bridge Function
// ============================================================

async function bridgeUSDCToArcTestnet(): Promise<void> {
  console.log("=== USDC Bridge: Ethereum Sepolia (Privy EOA) -> Arc Testnet (Circle User-Controlled Wallet) ===");
  console.log(`Source: Ethereum Sepolia | Address: ${ETHEREUM_SEPOLIA_WALLET_ADDRESS}`);
  console.log(`Destination: Arc Testnet | Address: ${ARC_TESTNET_WALLET_ADDRESS}`);
  console.log(`Amount: ${BRIDGE_AMOUNT} USDC`);
  console.log("");

  // Validate placeholder variables
  if (PRIVY_EOA_PRIVATE_KEY === "YOUR_PRIVY_EOA_PRIVATE_KEY_HERE") {
    throw new Error("Please set PRIVY_EOA_PRIVATE_KEY environment variable or replace the placeholder.");
  }
  if (CIRCLE_API_KEY === "YOUR_CIRCLE_API_KEY_HERE") {
    throw new Error("Please set CIRCLE_API_KEY environment variable or replace the placeholder.");
  }
  if (CIRCLE_ENTITY_SECRET === "YOUR_CIRCLE_ENTITY_SECRET_HERE") {
    throw new Error("Please set CIRCLE_ENTITY_SECRET environment variable or replace the placeholder.");
  }
  if (ARC_TESTNET_WALLET_ADDRESS === "YOUR_ARC_TESTNET_CIRCLE_WALLET_ADDRESS_HERE") {
    throw new Error("Please set ARC_TESTNET_WALLET_ADDRESS environment variable or replace the placeholder.");
  }
  if (ETHEREUM_SEPOLIA_WALLET_ADDRESS === "YOUR_ETHEREUM_SEPOLIA_EOA_ADDRESS_HERE") {
    throw new Error("Please set ETHEREUM_SEPOLIA_WALLET_ADDRESS environment variable or replace the placeholder.");
  }

  // ============================================================
  // Step 1: Create the source adapter (Privy Metamask EOA)
  // Using ethers-v6 adapter with the private key of the Privy EOA
  // In a browser environment with Privy, you would use createAdapterFromProvider
  // with the Privy-provided EIP1193 provider instead.
  // ============================================================
  console.log("Step 1: Creating source adapter for Privy Metamask EOA (Ethereum Sepolia)...");
  const sourceAdapter = createEthersAdapter({
    privateKey: PRIVY_EOA_PRIVATE_KEY,
  });
  console.log("Source adapter created successfully.");
  console.log("");

  // ============================================================
  // Step 2: Create the destination adapter (Circle User-Controlled Wallets)
  // The Circle Wallets adapter handles the destination (Arc Testnet) side.
  // For User-Controlled Wallets, the address must be passed explicitly.
  // ============================================================
  console.log("Step 2: Creating destination adapter for Circle User-Controlled Wallet (Arc Testnet)...");
  const destinationAdapter = createCircleWalletsAdapter({
    apiKey: CIRCLE_API_KEY,
    entitySecret: CIRCLE_ENTITY_SECRET,
  });
  console.log("Destination adapter created successfully.");
  console.log("");

  // ============================================================
  // Step 3: Initialize Bridge Kit
  // ============================================================
  console.log("Step 3: Initializing Bridge Kit...");
  const kit = new BridgeKit();
  console.log("Bridge Kit initialized.");
  console.log("");

  // ============================================================
  // Step 4: Set up event listeners to track bridge progress
  // These listeners provide visibility into each step of the CCTP V2 flow:
  // - approve: USDC approval for the CCTP TokenMessenger contract
  // - burn: depositForBurn call on Ethereum Sepolia (source chain)
  // - fetchAttestation: Polling Circle's attestation service for the signed message
  // - mint: receiveMessage call on Arc Testnet (destination chain) to mint USDC
  // ============================================================
  console.log("Step 4: Setting up event listeners for bridge progress tracking...");

  kit.on("approve", (payload) => {
    console.log("[Event: approve] USDC approval transaction submitted.");
    if (payload && typeof payload === "object") {
      const p = payload as Record<string, unknown>;
      if (p.explorerUrl) {
        console.log(`[Event: approve] Explorer URL: ${p.explorerUrl}`);
      }
      if (p.txHash) {
        console.log(`[Event: approve] Transaction Hash: ${p.txHash}`);
      }
    }
  });

  kit.on("burn", (payload) => {
    console.log("[Event: burn] depositForBurn transaction submitted on Ethereum Sepolia.");
    console.log("[Event: burn] This calls the CCTP TokenMessenger contract, specifying the Arc Testnet recipient address.");
    if (payload && typeof payload === "object") {
      const p = payload as Record<string, unknown>;
      if (p.explorerUrl) {
        console.log(`[Event: burn] Explorer URL: ${p.explorerUrl}`);
      }
      if (p.txHash) {
        console.log(`[Event: burn] Transaction Hash: ${p.txHash}`);
      }
    }
  });

  kit.on("fetchAttestation", (payload) => {
    console.log("[Event: fetchAttestation] Fetching attestation from Circle's attestation service...");
    console.log("[Event: fetchAttestation] Circle's attestation service signs the burn message after sufficient confirmations.");
    if (payload && typeof payload === "object") {
      const p = payload as Record<string, unknown>;
      if (p.attestation) {
        console.log("[Event: fetchAttestation] Attestation received successfully.");
      }
    }
  });

  kit.on("mint", (payload) => {
    console.log("[Event: mint] receiveMessage transaction submitted on Arc Testnet.");
    console.log("[Event: mint] USDC is being minted to the Circle User-Controlled Wallet on Arc Testnet.");
    if (payload && typeof payload === "object") {
      const p = payload as Record<string, unknown>;
      if (p.explorerUrl) {
        console.log(`[Event: mint] Explorer URL: ${p.explorerUrl}`);
      }
      if (p.txHash) {
        console.log(`[Event: mint] Transaction Hash: ${p.txHash}`);
      }
    }
  });

  console.log("Event listeners registered.");
  console.log("");

  // ============================================================
  // Step 5: Execute the bridge
  //
  // The Bridge Kit handles the complete CCTP V2 flow automatically:
  //
  // 5a. APPROVE: Approves USDC for the CCTP TokenMessenger contract on Ethereum Sepolia
  //     - Calls USDC.approve(tokenMessengerAddress, amount) on Ethereum Sepolia
  //
  // 5b. BURN (depositForBurn): Burns USDC on Ethereum Sepolia
  //     - Calls TokenMessenger.depositForBurn(amount, destinationDomain, recipientAddress, burnToken)
  //     - destinationDomain = Arc Testnet CCTP domain
  //     - recipientAddress = ARC_TESTNET_WALLET_ADDRESS (Circle User-Controlled Wallet)
  //
  // 5c. FETCH ATTESTATION: Polls Circle's attestation API
  //     - Waits for the burn transaction to reach required confirmations
  //     - Retrieves the signed attestation from Circle's attestation service
  //
  // 5d. MINT (receiveMessage): Mints USDC on Arc Testnet
  //     - Calls MessageTransmitter.receiveMessage(message, attestation) on Arc Testnet
  //     - USDC is minted directly to ARC_TESTNET_WALLET_ADDRESS
  //
  // NOTE: For Circle User-Controlled Wallets (adapter-circle-wallets), the wallet
  // address MUST be passed explicitly in the bridge call.
  // ============================================================
  console.log("Step 5: Executing CCTP V2 bridge transfer...");
  console.log("This process involves: Approve -> depositForBurn -> Fetch Attestation -> receiveMessage");
  console.log("");

  try {
    const result = await kit.bridge({
      from: {
        adapter: sourceAdapter,
        chain: "Ethereum_Sepolia",
        // No address needed for private key adapters (ethers-v6)
        // The address is derived from the private key automatically
      },
      to: {
        adapter: destinationAdapter,
        chain: "Arc_Testnet",
        // For Circle Wallets adapter, the address MUST be provided explicitly
        address: ARC_TESTNET_WALLET_ADDRESS,
        // recipientAddress ensures USDC is minted to the Circle User-Controlled Wallet
        recipientAddress: ARC_TESTNET_WALLET_ADDRESS,
      },
      amount: BRIDGE_AMOUNT,
      token: "USDC",
      config: {
        // Use SLOW for standard CCTP V2 transfer (no additional fee)
        // Use FAST for faster transfer (may incur additional fees)
        transferSpeed: "SLOW",
      },
    });

    // ============================================================
    // Step 6: Process and display results
    // ============================================================
    console.log("");
    console.log("=== Bridge Result ===");
    console.log(`State: ${result.state}`);
    console.log(`Amount: ${result.amount} ${result.token}`);

    if (result.source) {
      console.log(`Source Chain: ${result.source.chain?.name || "Ethereum Sepolia"}`);
      console.log(`Source Address: ${result.source.address}`);
    }

    if (result.destination) {
      console.log(`Destination Chain: ${result.destination.chain?.name || "Arc Testnet"}`);
      console.log(`Destination Address: ${result.destination.address}`);
    }

    if (result.state === "success") {
      console.log("");
      console.log("✅ Bridge completed successfully!");
      console.log(`USDC has been minted to the Circle User-Controlled Wallet at: ${ARC_TESTNET_WALLET_ADDRESS}`);
      console.log("");
      console.log("=== Transaction Steps ===");
      if (result.steps && result.steps.length > 0) {
        // Fix: Use 'any' type for the 'step' parameter as BridgeStep is not exported
        result.steps.forEach((step: any, index: number) => {
          console.log(`Step ${index + 1}: ${step.name || "Unknown"}`);
          if (step.explorerUrl) {
            console.log(`  Explorer URL: ${step.explorerUrl}`);
          }
          if (step.txHash) {
            console.log(`  Transaction Hash: ${step.txHash}`);
          }
        });
      }
    } else if (result.state === "error") {
      console.error("❌ Bridge failed!");
      console.error("Steps:", JSON.stringify(result.steps, null, 2));
    } else {
      console.log("⏳ Bridge is pending...");
      console.log("Steps:", JSON.stringify(result.steps, null, 2));
    }

  } catch (error) {
    console.error("❌ Bridge execution failed with error:");
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      if (error.stack) {
        console.error(`Stack: ${error.stack}`);
      }
    } else {
      console.error(error);
    }
    throw error;
  } finally {
    // Clean up event listeners
    kit.off("approve", () => {});
    kit.off("burn", () => {});
    kit.off("fetchAttestation", () => {});
    kit.off("mint", () => {});
  }
}

// ============================================================
// MANUAL CCTP V2 FLOW INSTRUCTIONS (for reference)
// If you need to manually execute the CCTP V2 flow without Bridge Kit:
//
// STEP A - APPROVE USDC:
//   Contract: USDC on Ethereum Sepolia (0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238)
//   Method: approve(spender, amount)
//   spender: CCTP TokenMessenger on Ethereum Sepolia (0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5)
//   amount: USDC amount in base units (6 decimals, e.g., 1 USDC = 1000000)
//
// STEP B - DEPOSIT FOR BURN:
//   Contract: CCTP TokenMessenger on Ethereum Sepolia (0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5)
//   Method: depositForBurn(amount, destinationDomain, mintRecipient, burnToken)
//   amount: USDC amount in base units
//   destinationDomain: Arc Testnet CCTP domain (check Circle docs for Arc Testnet domain ID)
//   mintRecipient: ARC_TESTNET_WALLET_ADDRESS padded to 32 bytes (bytes32)
//   burnToken: USDC address on Ethereum Sepolia (0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238)
//
// STEP C - FETCH ATTESTATION:
//   After the burn transaction is confirmed, retrieve the attestation:
//   API: GET https://iris-api-sandbox.circle.com/v1/attestations/{messageHash}
//   messageHash: keccak256 hash of the message emitted in the MessageSent event
//   Poll until status is "complete" and attestation is available
//
// STEP D - RECEIVE MESSAGE (MINT):
//   Contract: CCTP MessageTransmitter on Arc Testnet
//   Method: receiveMessage(message, attestation)
//   message: The message bytes from the MessageSent event on Ethereum Sepolia
//   attestation: The signed attestation from Circle's attestation service
//   This mints USDC to the ARC_TESTNET_WALLET_ADDRESS on Arc Testnet
//
// HOW TO OBTAIN A CIRCLE USER-CONTROLLED WALLET ON ARC TESTNET:
//   1. Sign up at https://console.circle.com
//   2. Create a new project and enable Programmable Wallets
//   3. Navigate to User-Controlled Wallets
//   4. Create a wallet set for Arc Testnet blockchain
//   5. Create a new wallet within that wallet set
//   6. The wallet address (0x...) is your ARC_TESTNET_WALLET_ADDRESS
//   7. Users authenticate via Circle's SDK to control their wallets
// ============================================================

// Run the bridge
bridgeUSDCToArcTestnet()
  .then(() => {
    console.log("");
    console.log("Bridge script completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Bridge script failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  });

Typescript


Instructions on how to use this code:

Save the code: Save the provided TypeScript code into a file named bridge-usdc.ts (or any other .ts extension).

Install dependencies: Open your terminal or command prompt in the directory where you saved the file and run the following commands to install the necessary packages:

npm install @circle-fin/bridge-kit@1.1.1 @circle-fin/adapter-ethers-v6@1.1.1 ethers
npm install @circle-fin/adapter-circle-wallets@1.0.0
npm install -D typescript ts-node # Install TypeScript and ts-node if you don't have them

Bash


Set environment variables: Before running the script, you need to set the following environment variables. You can do this by creating a .env file in the same directory or by setting them directly in your shell.

PRIVY_EOA_PRIVATE_KEY: The private key of your Privy Metamask EOA on Ethereum Sepolia.
CIRCLE_API_KEY: Your Circle API key (e.g., TEST_API_KEY:abc:def or Base64 encoded).
CIRCLE_ENTITY_SECRET: Your Circle entity secret (a 64-character lowercase alphanumeric string).
ARC_TESTNET_WALLET_ADDRESS: The address of your Circle User-Controlled Wallet on Arc Testnet.
ETHEREUM_SEPOLIA_WALLET_ADDRESS: The address of your Privy Metamask EOA on Ethereum Sepolia.
BRIDGE_AMOUNT: The amount of USDC you want to bridge (e.g., "1.00" for 1 USDC).
Example .env file:

PRIVY_EOA_PRIVATE_KEY="YOUR_PRIVY_EOA_PRIVATE_KEY_HERE"
CIRCLE_API_KEY="YOUR_CIRCLE_API_KEY_HERE"
CIRCLE_ENTITY_SECRET="YOUR_CIRCLE_ENTITY_SECRET_HERE"
ARC_TESTNET_WALLET_ADDRESS="YOUR_ARC_TESTNET_CIRCLE_WALLET_ADDRESS_HERE"
ETHEREUM_SEPOLIA_WALLET_ADDRESS="YOUR_ETHEREUM_SEPOLIA_EOA_ADDRESS_HERE"
BRIDGE_AMOUNT="1.00"


Important: Replace the placeholder values with your actual credentials and addresses. Never expose your private keys or API secrets in public repositories.

Run the script: Execute the script using ts-node:

ts-node bridge-usdc.ts

Bash


The script will then initiate the CCTP V2 bridge process, logging each step (approve, burn, fetch attestation, mint) to the console. Upon successful completion, it will confirm that USDC has been minted to your Circle User-Controlled Wallet on Arc Testnet.

gas estimations are taken care intetnally ?

Circle AI
2:51 AM
Yes, the Circle Bridge Kit, which is used in the generated code, handles gas estimations internally for the transactions it performs during the bridging process (like approving USDC, burning on the source chain, and minting on the destination chain).

However, the Bridge Kit also provides a separate estimate function that allows you to get gas and provider fee estimations before initiating a transfer. This is optional but recommended if you want to display these costs to your users or make decisions based on them.

So, to summarize:

During the kit.bridge() call: Gas for the necessary transactions (approve, burn, mint) is handled automatically by the underlying adapters and network interactions.
Before the kit.bridge() call: You can use await kit.estimate(params) to get an upfront estimation of the gas fees and any provider fees associated with the transfer.