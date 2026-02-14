> ## Documentation Index
> Fetch the complete documentation index at: https://developers.circle.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Transfer USDC on testnet from Ethereum to Avalanche using CCTP V1

> Explore this script to transfer USDC on testnet between two EVM-compatible chains via CCTP V1

<Warning>
  **This is CCTP V1 version. For the latest version, see [CCTP](/cctp)**.
</Warning>

This guide demonstrates how to use the [viem](https://viem.sh/) framework and
the [CCTP V1 API](/cctp/v1/cctp-apis) in a simple script that enables a user to
transfer USDC from a wallet address on the **Ethereum Sepolia testnet** to
another wallet address on the **Avalanche Fuji testnet**.

To get started with CCTP V1, follow the example script provided
[on GitHub](https://github.com/circlefin/evm-cctp-contracts/blob/d1c24577fb627b08483dc42e4d8a37a810b369f7/docs/index.js).
The example uses
[web3.js](https://web3js.readthedocs.io/en/v1.8.1/getting-started.html) to
transfer USDC from a wallet address on Ethereum Sepolia testnet to another
wallet address on Avalanche Fuji testnet.

The script has five steps:

1. In this first step, you initiate a transfer of USDC from one blockchain to
   another, and specify the recipient wallet address on the destination chain.
   This step approves the Ethereum Sepolia **TokenMessenger** contract to
   withdraw USDC from the provided Ethereum Sepolia wallet address.

```javascript JavaScript theme={null}
const approveTx = await usdcEthContract.methods
  .approve(ETH_TOKEN_MESSENGER_CONTRACT_ADDRESS, amount)
  .send({ gas: approveTxGas });
```

2. In this second step, you facilitate a burn of the specified amount of USDC on
   the source chain. This step executes the `depositForBurn` function on the
   Ethereum Sepolia **TokenMessenger** contract deployed on
   [Sepolia testnet](https://sepolia.etherscan.io/address/0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5).

```javascript JavaScript theme={null}
const burnTx = await ethTokenMessengerContract.methods
  .depositForBurn(
    amount,
    AVAX_DESTINATION_DOMAIN,
    destinationAddressInBytes32,
    USDC_ETH_CONTRACT_ADDRESS,
  )
  .send();
```

3. In this third step, you make sure you have the correct message and hash it.
   This step extracts `messageBytes` emitted by the **MessageSent** event from
   `depositForBurn` transaction logs and hashes the retrieved `messageBytes`
   using the **keccak256** hashing algorithm.

```javascript JavaScript theme={null}
const transactionReceipt = await web3.eth.getTransactionReceipt(
  burnTx.transactionHash,
);
const eventTopic = web3.utils.keccak256("MessageSent(bytes)");
const log = transactionReceipt.logs.find((l) => l.topics[0] === eventTopic);
const messageBytes = web3.eth.abi.decodeParameters(["bytes"], log.data)[0];
const messageHash = web3.utils.keccak256(messageBytes);
```

4. In this fourth step, you request the attestation from Circle, which provides
   authorization to mint the specified amount of USDC on the destination chain.
   This step polls the attestation service to acquire the signature using the
   `messageHash` from the previous step.

<Note>
  **Rate Limit**

  The attestation service rate limit is 35 requests per second. If you exceed 35
  requests per second, the service blocks all API requests for the next 5 minutes
  and returns an HTTP 429 response.
</Note>

```javascript JavaScript theme={null}
let attestationResponse = { status: "pending" };
while (attestationResponse.status != "complete") {
  const response = await fetch(
    `https://iris-api-sandbox.circle.com/attestations/${messageHash}`,
  );
  attestationResponse = await response.json();
  await new Promise((r) => setTimeout(r, 2000));
}
```

5. In this final step, you enable USDC to be minted on the destination chain.
   This step calls the `receiveMessage` function on the Avalanche Fuji
   **MessageTransmitter** contract to receive USDC at the Avalanche Fuji wallet
   address.

```javascript JavaScript theme={null}
const receiveTx = await avaxMessageTransmitterContract.receiveMessage(
  receivingMessageBytes,
  signature,
);
```

You have successfully transferred USDC between two EVM-compatible chains using
CCTP V1 end-to-end.


Built with [Mintlify](https://mintlify.com).