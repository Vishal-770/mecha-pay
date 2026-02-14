Circle AI
6:14 PM
import { initiateUserControlledWalletsClient } from '@circle-fin/user-controlled-wallets';
import { ethers } from 'ethers';

// ============================================================
// PLACEHOLDER VARIABLES - Fill these in before running
// ============================================================
const CIRCLE_API_KEY = 'YOUR_CIRCLE_API_KEY';
const USER_ID = 'YOUR_USER_ID'; // The user ID in your system
const USER_WALLET_ID = '{{user-wallet-id}}'; // Replace with actual wallet ID

// Contract and transaction details
const CONTRACT_ADDRESS = '0xcd3d4d703f1884313e8f3188a8c60cc6d389ebd1';
const RECIPIENT_ADDRESS = '0xa1404d9E7646b0112C49aE0296D6347C956D0867';
const TRANSFER_AMOUNT = 100 * 10 ** 6; // 100 USDC with 6 decimals

// EVM chain transaction parameters (adjust for your target network)
const CHAIN_ID = 1; // 1 = Ethereum Mainnet, adjust as needed (e.g., 137 for Polygon)
const GAS_LIMIT = '0x30000'; // 196608 gas limit in hex
const GAS_PRICE = '0x3B9ACA00'; // 1 Gwei in hex
const NONCE = 0; // Replace with the actual nonce for the wallet address
const VALUE = '0x0'; // No ETH value being sent

// ============================================================
// Contract ABI - only the transfer function is needed
// ============================================================
const CONTRACT_ABI = [
  'function transfer(address recipient, uint256 amount) returns (bool)',
];

async function main() {
  // ============================================================
  // Step 1: Initialize the Circle User-Controlled Wallets client
  // ============================================================
  const client = initiateUserControlledWalletsClient({
    apiKey: CIRCLE_API_KEY,
  });

  console.log('Circle User-Controlled Wallets client initialized.');

  // ============================================================
  // Step 2: Create a user token for authentication
  // ============================================================
  const userTokenResponse = await client.createUserToken({
    userId: USER_ID,
  });

  if (!userTokenResponse.data || !userTokenResponse.data.userToken) {
    throw new Error('Failed to create user token. Response data is undefined.');
  }

  const userToken = userTokenResponse.data.userToken;
  console.log(`User token created successfully: ${userToken.substring(0, 20)}...`);

  // ============================================================
  // Step 3: Encode the contract function data using ethers.js
  // ============================================================
  console.log('Encoding contract function data using ethers.js...');

  // Create an Interface instance from the ABI
  const contractInterface = new ethers.Interface(CONTRACT_ABI);

  // Encode the function call data for transfer(address, uint256)
  const encodedData = contractInterface.encodeFunctionData('transfer', [
    RECIPIENT_ADDRESS,
    BigInt(TRANSFER_AMOUNT),
  ]);

  console.log(`Encoded function data: ${encodedData}`);

  // ============================================================
  // Step 4: Construct the raw EVM transaction
  // ============================================================
  console.log('Constructing raw EVM transaction...');

  // Build the transaction object using ethers.js Transaction
  const transaction = ethers.Transaction.from({
    to: CONTRACT_ADDRESS,
    data: encodedData,
    value: VALUE,
    gasLimit: GAS_LIMIT,
    gasPrice: GAS_PRICE,
    nonce: NONCE,
    chainId: CHAIN_ID,
    type: 0, // Legacy transaction type
  });

  // Serialize the unsigned transaction to get the raw hex-encoded transaction
  // ethers.js serializes an unsigned transaction for signing
  const unsignedSerializedTx = transaction.unsignedSerialized;

  console.log(`Raw unsigned transaction (hex): ${unsignedSerializedTx}`);
  console.log(`Transaction details:`);
  console.log(`  - To (Contract): ${CONTRACT_ADDRESS}`);
  console.log(`  - Recipient: ${RECIPIENT_ADDRESS}`);
  console.log(`  - Amount: ${TRANSFER_AMOUNT} (${TRANSFER_AMOUNT / 10 ** 6} USDC)`);
  console.log(`  - Chain ID: ${CHAIN_ID}`);
  console.log(`  - Gas Limit: ${GAS_LIMIT}`);
  console.log(`  - Gas Price: ${GAS_PRICE}`);
  console.log(`  - Nonce: ${NONCE}`);

  // ============================================================
  // Step 5: Sign the raw transaction using Circle's API
  // ============================================================
  console.log('Signing the raw transaction using Circle User-Controlled Wallets API...');

  const signTransactionResponse = await client.signTransaction({
    userToken: userToken,
    walletId: USER_WALLET_ID,
    rawTransaction: unsignedSerializedTx, // Hex-encoded raw transaction for EVM chains
    memo: 'Transfer USDC to recipient',
  });

  if (!signTransactionResponse.data) {
    throw new Error('Failed to sign transaction. Response data is undefined.');
  }

  const challengeId = signTransactionResponse.data.challengeId;

  if (!challengeId) {
    throw new Error('Challenge ID is undefined in the sign transaction response.');
  }

  // ============================================================
  // Step 6: Output the result
  // ============================================================
  console.log('Transaction signing initiated successfully!');
  console.log(`Challenge ID: ${challengeId}`);
  console.log('');
  console.log('Next Steps:');
  console.log('  1. Use the Challenge ID to complete the user challenge flow.');
  console.log('  2. The user must authenticate (e.g., via PIN) to authorize the signing.');
  console.log('  3. Once the challenge is completed, the transaction will be signed.');
  console.log('  4. You can then broadcast the signed transaction to the blockchain.');
}

main().catch((error) => {
  console.error('An error occurred:', error instanceof Error ? error.message : error);
  process.exit(1);
});

Typescript


Instructions on how to use this code:
Save the code: Save the provided code as a TypeScript file (e.g., transferUSDC.ts).
Install dependencies: Ensure you have Node.js and npm/yarn installed. Then, install the necessary packages:
npm install @circle-fin/user-controlled-wallets ethers
# or
yarn add @circle-fin/user-controlled-wallets ethers

Bash


Fill in Placeholder Variables:
YOUR_CIRCLE_API_KEY: Replace with your actual Circle API Key.
YOUR_USER_ID: Replace with the ID of the user in your system who owns the wallet.
{{user-wallet-id}}: Replace with the actual ID of the user's wallet from which you want to transfer USDC.
CONTRACT_ADDRESS: This is the USDC contract address. Verify it for your target chain.
RECIPIENT_ADDRESS: The address to which you want to send the USDC.
TRANSFER_AMOUNT: The amount of USDC to transfer (e.g., 100 * 10 ** 6 for 100 USDC, assuming 6 decimals).
CHAIN_ID: Adjust this to the correct chain ID for your target network (e.g., 1 for Ethereum Mainnet, 137 for Polygon Mainnet).
GAS_LIMIT, GAS_PRICE, NONCE: These are crucial for EVM transactions. You'll need to determine appropriate values for your network and the wallet's current nonce. The NONCE must be the current transaction count of the USER_WALLET_ID.
Compile and Run:
If you're using TypeScript directly, you might need to compile it first:
npx ts-node transferUSDC.ts
# or if you have a tsconfig.json
tsc transferUSDC.ts && node transferUSDC.js

Bash


Alternatively, you can convert it to JavaScript and run it:
# Manually remove type annotations or use a transpiler
node transferUSDC.js

Bash


Handle the Challenge ID: After running, the script will output a Challenge ID. This ID is essential for completing the transaction. You will need to integrate this challengeId into your user-facing application to initiate the user authentication flow (e.g., PIN entry, biometrics) via the Circle User-Controlled Wallets SDK.
Broadcast the Signed Transaction: Once the user successfully completes the challenge, the transaction will be signed. You will then receive the signed transaction hash, which you can broadcast to the blockchain network using a web3 provider (like Ethers.js or Web3.js) to finalize the transfer.
