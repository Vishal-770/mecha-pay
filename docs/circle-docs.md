# Circle Docs

## Docs

- [Start building with AI](https://developers.circle.com/ai/chatbot.md)
- [Use Circle's MCP Server in Your IDE](https://developers.circle.com/ai/mcp.md)
- [Get an attestation](https://developers.circle.com/api-reference/cctp/all/get-attestation.md): Retrieves the signed attestation for a USDC burn event on the source chain.
- [Get USDC transfer fees](https://developers.circle.com/api-reference/cctp/all/get-burn-usdc-fees.md): Retrieves the applicable fees for a USDC transfer between the specified source and destination domains. The fee is returned in basis points (1 = 0.01%).
- [Get USDC Fast Transfer allowance](https://developers.circle.com/api-reference/cctp/all/get-fast-burn-usdc-allowance.md): Retrieves the available USDC Fast Transfer allowance remaining.
- [Get a list of messages](https://developers.circle.com/api-reference/cctp/all/get-messages.md): Retrieves message and attestation details for CCTP V1 messages.
- [Get messages and attestations](https://developers.circle.com/api-reference/cctp/all/get-messages-v2.md): Retrieves messages and attestations for a given transaction hash or nonce. Each message for a given transaction hash is ordered by ascending log index.
- [List attestation public keys](https://developers.circle.com/api-reference/cctp/all/get-public-keys.md): Retrieves a list of the currently active public keys for verifying attestation signatures.
- [Get public keys](https://developers.circle.com/api-reference/cctp/all/get-public-keys-v2.md): Returns the public keys for validating attestations across all supported versions of CCTP.
- [Re-attest a pre-finality message](https://developers.circle.com/api-reference/cctp/all/reattest-message.md): The re-attestation flow allows the relayer to obtain a higher level of finality than was originally requested on the source chain, while still being forced to pay the fee since allowance was reserved. This flow resolves the case where a sender specifies a finality threshold lower than the destination chain recipient requires.

- [Create a CUBIX bank account](https://developers.circle.com/api-reference/circle-mint/account/create-business-cubix-account.md)
- [Create a deposit address](https://developers.circle.com/api-reference/circle-mint/account/create-business-deposit-address.md): Generates a new blockchain address for a wallet for a given currency/chain pair. Circle may reuse addresses on blockchains that support reuse. For example, if you're requesting two addresses for depositing USD and ETH, both on Ethereum, you may see the same Ethereum address returned. Depositing cryptocurrency to a generated address will credit the associated wallet with the value of the deposit. Note: Circle Mint Singapore customers must verify all transfer recipients using the UI in the Circle Console, as transfers from unverified addresses will be held in `pending` status. 

- [Create a payout](https://developers.circle.com/api-reference/circle-mint/account/create-business-payout.md): Create a redemption (offramp) payout. This payout converts a digital asset to fiat currency.

- [Create a PIX bank account](https://developers.circle.com/api-reference/circle-mint/account/create-business-pix-account.md)
- [Create a recipient address](https://developers.circle.com/api-reference/circle-mint/account/create-business-recipient-address.md): Stores an external blockchain address. Once added, the recipient address must be verified to ensure that you know and trust each new address. 

**For France customers:**

Circle Mint France customers must verify all transfer recipients using the UI in the Circle Console, as transfers from unverified addresses will be held in pending status. Please see Help Center articles below for details:
- [Circle Mint France Travel Rule](https://help.circle.com/s/article/Circle-Mint-France-Travel-Rule)
- [Circle Mint France wallet verification](https://help.circle.com/s/article/Circle-Mint-France-wallet-verification)

- [Create a transfer](https://developers.circle.com/api-reference/circle-mint/account/create-business-transfer.md): A transfer can be made from an existing business account to a blockchain location.
- [Create a wire bank account](https://developers.circle.com/api-reference/circle-mint/account/create-business-wire-account.md)
- [Create a mock Wire payment](https://developers.circle.com/api-reference/circle-mint/account/create-mock-wire-payment.md): In the sandbox environment, initiate a mock wire payment that mimics the behavior of funds sent through the bank (wire) account linked to master wallet.
- [Delete a recipient address](https://developers.circle.com/api-reference/circle-mint/account/delete-business-recipient-address.md): Deletes an external blockchain address. The recipient address must be in an 'active' or 'pending' state in order to be deleted successfully.

- [Get a CUBIX bank account](https://developers.circle.com/api-reference/circle-mint/account/get-business-cubix-account.md)
- [Get CUBIX instructions](https://developers.circle.com/api-reference/circle-mint/account/get-business-cubix-account-instructions.md): Get the CUBIX transfer instructions into the Circle bank account given your fiat account id.
- [List all deposit addresses](https://developers.circle.com/api-reference/circle-mint/account/get-business-deposit-address.md): Returns a list of deposit addresses for a given wallet.
- [Get a deposit by ID](https://developers.circle.com/api-reference/circle-mint/account/get-business-deposit-by-id.md): Returns a deposit by ID.
- [Get a payout](https://developers.circle.com/api-reference/circle-mint/account/get-business-payout.md)
- [Get a PIX bank account](https://developers.circle.com/api-reference/circle-mint/account/get-business-pix-account.md)
- [Get PIX instructions](https://developers.circle.com/api-reference/circle-mint/account/get-business-pix-account-instructions.md): Get the PIX transfer instructions into the Circle bank account given your bank account id.
- [Get a transfer](https://developers.circle.com/api-reference/circle-mint/account/get-business-transfer.md)
- [Get a wire bank account](https://developers.circle.com/api-reference/circle-mint/account/get-business-wire-account.md)
- [Get wire instructions](https://developers.circle.com/api-reference/circle-mint/account/get-business-wire-account-instructions.md): Get the wire transfer instructions into the Circle bank account given your bank account ID.
- [List all balances](https://developers.circle.com/api-reference/circle-mint/account/list-business-balances.md): Retrieves the balance of funds that are available for use.
- [List all CUBIX bank accounts.](https://developers.circle.com/api-reference/circle-mint/account/list-business-cubix-accounts.md)
- [List all deposits](https://developers.circle.com/api-reference/circle-mint/account/list-business-deposits.md): Searches for deposits sent to your business account. If the date parameters are omitted, returns the most recent deposits. This endpoint returns up to 50 deposits in descending chronological order or pageSize, if provided.
- [List all payouts](https://developers.circle.com/api-reference/circle-mint/account/list-business-payouts.md): Lists all payouts for your account.

Note that this endpoint does not return the tracking reference number for the payouts in the response. If you need that information you must get each payout individually by ID.

- [List all PIX bank accounts.](https://developers.circle.com/api-reference/circle-mint/account/list-business-pix-accounts.md)
- [List all recipient addresses](https://developers.circle.com/api-reference/circle-mint/account/list-business-recipient-addresses.md): Returns a list of recipient addresses that have each been verified and are eligible for transfers. Any recipient addresses pending administrator verification are not included in the response.

- [List all transfers](https://developers.circle.com/api-reference/circle-mint/account/list-business-transfers.md): Searches for transfers from your business account. If the date parameters are omitted, returns the most recent transfers. This endpoint returns up to 50 transfers in descending chronological order or pageSize, if provided.
- [List all wire bank accounts](https://developers.circle.com/api-reference/circle-mint/account/list-business-wire-accounts.md)
- [List daily burn fee calculations](https://developers.circle.com/api-reference/circle-mint/account/list-net-burn-fee-daily-calculations.md): Returns daily burn fee calculations. This endpoint returns up to 50 daily fee calculations in descending chronological order or `pageSize`, if provided.
- [Create FX account](https://developers.circle.com/api-reference/circle-mint/cross-currency/create-fx-account.md): Creates a currency trading account
- [Create FX trade](https://developers.circle.com/api-reference/circle-mint/cross-currency/create-fx-trade.md): Creates a cross-currency trade
- [Create a mock PIX payment](https://developers.circle.com/api-reference/circle-mint/cross-currency/create-mock-pix-payment.md): Initiates a mock PIX payment in the sandbox environment that mimics the behavior of funds sent through the bank account linked to the main wallet.
- [Get daily currency exchange limits](https://developers.circle.com/api-reference/circle-mint/cross-currency/get-daily-fx-limits.md): Returns daily currency exchange limits and usages.
- [Get FX trade](https://developers.circle.com/api-reference/circle-mint/cross-currency/get-fx-trade-id.md): Returns an FX trade by ID.
- [Get all FX trades](https://developers.circle.com/api-reference/circle-mint/cross-currency/get-fx-trades.md): Returns all cross-currency trades. You can include an optional `settlementId` query parameter to filter the trades to only a specific settlement.
- [Get quote](https://developers.circle.com/api-reference/circle-mint/cross-currency/get-quote.md): Fetches an indicative exchange rate between two currencies. Either the from currency or to currency must be USD.
Note: The current market exchange rate will be applied when Circle receives the deposit.

- [Get settlement](https://developers.circle.com/api-reference/circle-mint/cross-currency/get-settlement-id.md): Returns a settlement by ID.
- [Get settlement instructions](https://developers.circle.com/api-reference/circle-mint/cross-currency/get-settlement-instructions.md): Returns settlement instructions for a specific currency.
- [Get all settlements](https://developers.circle.com/api-reference/circle-mint/cross-currency/get-settlements.md): Returns all settlements.
- [Create a notification subscription](https://developers.circle.com/api-reference/circle-mint/general/create-subscription.md): Subscribe to receiving notifications at a given endpoint. The endpoint should be able to handle AWS SNS subscription requests. For more details see https://docs.aws.amazon.com/mobile/sdkforxamarin/developerguide/sns-send-http.html. Note, the sandbox environment allows a maximum of 3 active subscriptions; otherwise, this is limited to 1 active subscription and subsequent create requests will be rejected with a Limit Exceeded error.

- [Remove a notification subscription](https://developers.circle.com/api-reference/circle-mint/general/delete-subscription.md): To remove a subscription, all its subscription requests' statuses must be either 'confirmed', 'deleted' or a combination of those. A subscription with at least one 'pending' subscription request cannot be removed.
- [Get configuration info](https://developers.circle.com/api-reference/circle-mint/general/get-account-config.md): Retrieves general configuration information.
- [List all stablecoins](https://developers.circle.com/api-reference/circle-mint/general/list-stablecoins.md): Retrieves total circulating supply for supported stablecoins across all chains. This endpoint is rate limited to one call per minute (based on IP).
- [List all notification subscriptions](https://developers.circle.com/api-reference/circle-mint/general/list-subscriptions.md): Retrieve a list of existing notification subscriptions with details.
- [Ping](https://developers.circle.com/api-reference/circle-mint/general/ping.md): Checks that the service is running.
- [Create an external entity](https://developers.circle.com/api-reference/circle-mint/institutional/create-external-entity.md): Creates an external entity for the institutional account.

To access the Core API for Institutions, contact your Circle account representative.

- [Get all external entities](https://developers.circle.com/api-reference/circle-mint/institutional/get-all-external-entities.md): Returns all external entities for the institutional account.

To access the Core API for Institutions, contact your Circle account representative.

Note that the `businessUniqueIdentifier` and `identifierIssuingCountryCode` must both be provided, or not at all. Only providing one will result in an error.

- [Get an external entity by wallet ID](https://developers.circle.com/api-reference/circle-mint/institutional/get-external-entity-by-wallet-id.md): Returns an external entity by wallet ID.

To access the Core API for Institutions, contact your Circle account representative.

- [Create a payment intent](https://developers.circle.com/api-reference/circle-mint/payments/create-payment-intent.md): Create a transient or continuous payment intent
- [Expire a payment intent](https://developers.circle.com/api-reference/circle-mint/payments/expire-payment-intent.md)
- [Get a payment](https://developers.circle.com/api-reference/circle-mint/payments/get-payment.md)
- [Get a payment intent](https://developers.circle.com/api-reference/circle-mint/payments/get-payment-intent.md)
- [List all payment intents](https://developers.circle.com/api-reference/circle-mint/payments/list-payment-intents.md)
- [List all payments](https://developers.circle.com/api-reference/circle-mint/payments/list-payments.md)
- [Refund a payment intent](https://developers.circle.com/api-reference/circle-mint/payments/refund-payment-intent.md)
- [Create a recipient](https://developers.circle.com/api-reference/circle-mint/payouts/create-address-book-recipient.md)
- [Create a payout](https://developers.circle.com/api-reference/circle-mint/payouts/create-payout.md): 
Create a crypto payout.  

The following table includes the supported pairs of `amount.currency` and `toAmount.currency` for address book payouts:

| amount.currency  | toAmount.currency |
| ---------------- | ----------------- |
| USD              | USD               |
| EUR              | EUR               |

- [Delete a recipient](https://developers.circle.com/api-reference/circle-mint/payouts/delete-address-book-recipient.md)
- [Get a recipient](https://developers.circle.com/api-reference/circle-mint/payouts/get-address-book-recipient.md)
- [Get a payout](https://developers.circle.com/api-reference/circle-mint/payouts/get-payout.md)
- [List all recipients](https://developers.circle.com/api-reference/circle-mint/payouts/list-address-book-recipients.md)
- [List all payouts](https://developers.circle.com/api-reference/circle-mint/payouts/list-payouts.md)
- [Modify a recipient](https://developers.circle.com/api-reference/circle-mint/payouts/modify-address-book-recipient.md)
- [Create daily custody balance report](https://developers.circle.com/api-reference/circle-mint/reserve-management/report-daily-custody-balances.md): Creates a daily custody balance report for USDC and EURC and sends it to Circle.

**Note:** Only one report is allowed per day per currency.

- [Create a notification subscription](https://developers.circle.com/api-reference/contracts/common/create-subscription.md): Create a notification subscription by configuring an endpoint to receive notifications. For details, see the [Notification Flows](https://developers.circle.com/wallets/webhook-notification-flows) guide.

- [Delete a notification subscription](https://developers.circle.com/api-reference/contracts/common/delete-subscription.md): Delete an existing subscription.
- [Get a notification signature public key](https://developers.circle.com/api-reference/contracts/common/get-notification-signature.md): Get the public key and algorithm used to digitally sign webhook notifications. Verifying the digital signature ensures the notification came from Circle.

In the headers of each webhook, you can find
  1. `X-Circle-Signature`: a header containing the digital signature generated by Circle.
  2. `X-Circle-Key-Id`: a header containing the UUID. This is will be used as the `ID` as URL parameter to retrieve the relevant public key.

- [Retrieve a notification subscription](https://developers.circle.com/api-reference/contracts/common/get-subscription.md): Retrieve an existing notification subscription.
- [Get all notification subscriptions](https://developers.circle.com/api-reference/contracts/common/get-subscriptions.md): Retrieve an array of existing notification subscriptions.
- [Ping](https://developers.circle.com/api-reference/contracts/common/ping.md): Checks that the service is running.
- [Update a notification subscription](https://developers.circle.com/api-reference/contracts/common/update-subscription.md): Update subscription endpoint to receive notifications.

- [Create Event Monitor](https://developers.circle.com/api-reference/contracts/smart-contract-platform/create-event-monitor.md): Create a new event monitor based on the provided blockchain, contract address, and event signature.
- [Delete Event Monitor](https://developers.circle.com/api-reference/contracts/smart-contract-platform/delete-event-monitor.md): Delete an existing event monitor given its ID.
- [Deploy a contract](https://developers.circle.com/api-reference/contracts/smart-contract-platform/deploy-contract.md): Deploy a smart contract on a specified blockchain using the contract's ABI and bytecode. The deployment will originate from one of your Circle Wallets.
- [Deploy a contract from a template](https://developers.circle.com/api-reference/contracts/smart-contract-platform/deploy-contract-template.md): Deploy a smart contract using a template.
- [Estimate a contract deployment](https://developers.circle.com/api-reference/contracts/smart-contract-platform/estimate-contract-deploy.md): Estimate the network fee for deploying a smart contract on a specified blockchain, given the contract bytecode.
- [Estimate fee for a contract template deployment](https://developers.circle.com/api-reference/contracts/smart-contract-platform/estimate-contract-template-deploy.md): Estimate the fee required to deploy contract by template.
- [Get a contract](https://developers.circle.com/api-reference/contracts/smart-contract-platform/get-contract.md): Get a single contract that you've imported or deployed. Retrieved using the contracts ID as opposed to the on-chain address.
- [Get Event Monitors](https://developers.circle.com/api-reference/contracts/smart-contract-platform/get-event-monitors.md): Fetch a list of event monitors, optionally filtered by blockchain, contract address, and event signature.
- [Import a contract](https://developers.circle.com/api-reference/contracts/smart-contract-platform/import-contract.md): Add an existing smart contract to your library of contracts. It also can be done in the Developer Services Console.
- [List contracts](https://developers.circle.com/api-reference/contracts/smart-contract-platform/list-contracts.md): Fetch a list of contracts that you've imported and/or deployed.
- [Get Event Logs](https://developers.circle.com/api-reference/contracts/smart-contract-platform/list-event-logs.md): Fetch all event logs, optionally filtered by blockchain and contract address.
- [Execute a query function on a contract](https://developers.circle.com/api-reference/contracts/smart-contract-platform/query-contract.md): Query the state of a contract by providing the address and blockchain.
- [Update a contract](https://developers.circle.com/api-reference/contracts/smart-contract-platform/update-contract.md): Update the off-chain properties, such as description, of a contract that you've imported or deployed. Updated using the contracts ID as opposed to the on-chain address.
- [Update an Event Monitor](https://developers.circle.com/api-reference/contracts/smart-contract-platform/update-event-monitor.md): Update an existing event monitor given its ID.
- [Create a webhook subscription](https://developers.circle.com/api-reference/cpn/common/create-subscription.md): Create a webhook subscription by configuring an endpoint to receive notifications.

- [Delete a notification subscription](https://developers.circle.com/api-reference/cpn/common/delete-subscription.md): Delete an existing subscription.
- [Get a notification signature public key](https://developers.circle.com/api-reference/cpn/common/get-notification-signature.md): Get the public key and algorithm used to digitally sign webhook notifications. Verifying the digital signature ensures the notification came from Circle.

In the headers of each webhook, you can find

  - `X-Circle-Signature`: a header containing the digital signature generated by Circle.

  - `X-Circle-Key-Id`: a header containing the UUID. This is will be used as the `ID` as URL parameter to retrieve the relevant public key.

- [Get a notification subscription](https://developers.circle.com/api-reference/cpn/common/get-subscription.md): Returns an existing notification subscription.
- [Get all webhook subscriptions](https://developers.circle.com/api-reference/cpn/common/get-subscriptions.md): Returns an array of existing webhook subscriptions.
- [Ping](https://developers.circle.com/api-reference/cpn/common/ping.md): Checks that the service is running.
- [Update a notification subscription](https://developers.circle.com/api-reference/cpn/common/update-subscription.md): Update subscription endpoint to receive notifications.

- [Accelerate a stuck transaction](https://developers.circle.com/api-reference/cpn/cpn-platform/accelerate-transaction.md): - Accelerate a transaction based on the payment ID. It should be used when a transaction associated with the payment is broadcasted but not confirmed for a long period of time (i.e 10 minutes). This is usually due to gas fees being too low and not picked up by any miner/validator.

- The /accelerate endpoint essentially creates another transaction with the same params as the broadcasted transaction. If multiple broadcasted transactions exist, it will use the newest created one. Afterwards, OFI can sign with a higher gas fee and submit via /submit endpoint to accelerate blockchain confirmation.

- Requirements for using this endpoint:

  - No COMPLETED transaction exist for the payment (otherwise onchain transaction has completed)

  - No CREATED transaction exist for the payment, otherwise OFI should sign that transaction and submit

  - No PENDING transaction exist for the payment, otherwise OFI should wait for transaction to be broadcasted

- In another word, all existing transaction for the payment should either be FAILED (which is no longer effective) or BROADCASTED (which means they are stuck onchain and not confirmed)

- [Create a payment](https://developers.circle.com/api-reference/cpn/cpn-platform/create-payment.md): Creates a payment by using the quote created previously and submitting recipient information (travel rule). The payment will remain valid if the onchain settlement occurs before settlementExpireDate.
- [Create a quote](https://developers.circle.com/api-reference/cpn/cpn-platform/create-quotes.md): Creates one or more quotes for the given source/destination parameters. Returns quotes sorted in the following order:

  - Ascending of `sourceAmount` if your quote is based on `destinationAmount`.

  - Descending of `destinationAmount` if your quote is based on `sourceAmount`.

- [Create a support ticket](https://developers.circle.com/api-reference/cpn/cpn-platform/create-support-ticket.md): Create transaction-related issues (for example, settlement delays, missing information, or refunds). These tickets are stored centrally in the CPN platform and routed to the appropriate party for resolution.

- [Create a transaction](https://developers.circle.com/api-reference/cpn/cpn-platform/create-transaction.md): Creates an unsigned onchain transaction for a specific payment.
- [Create a transaction (V2)](https://developers.circle.com/api-reference/cpn/cpn-platform/create-transaction-v2.md): Create a V2 transaction for signing
- [Get a payment](https://developers.circle.com/api-reference/cpn/cpn-platform/get-payment.md): Returns the PII fields needed to collect to make this payment (i.e. travel rule and beneficiary account data)
- [Get payment configurations](https://developers.circle.com/api-reference/cpn/cpn-platform/get-payment-configurations-overview.md): Returns the overview of supported countries, currencies, payment methods, blockchains.
- [Get payment requirements for a quote](https://developers.circle.com/api-reference/cpn/cpn-platform/get-payment-requirements.md): Retrieves the PII fields needed to collect to make this payment (travel rule and beneficiary account data).
- [Get details of a quote](https://developers.circle.com/api-reference/cpn/cpn-platform/get-quote.md): Retrieve details of a specific quote (e.g., re-check expiration, fees).
- [Get refund details](https://developers.circle.com/api-reference/cpn/cpn-platform/get-refund.md): Retrieves the full refund object associated with a specific payment. This can be used by OFIs to reconcile refund status and verify refund completion.
- [Get details for an RFI](https://developers.circle.com/api-reference/cpn/cpn-platform/get-rfi.md): Retrieve details of a specific RFI for a payment. If the BFI initiates an RFI after the payment is created, the OFI will be notified via webhook. This webhook will detail what specific information the OFI needs to send. 

After receiving the webhook. The OFI is expected to encrypt the requested data and send it to the BFI using CPN's RFI submit endpoint. Failure to respond to an RFI will result in a failed payment. The OFI will receive webhooks with the decision based on the submitted information.

- [Get a transaction](https://developers.circle.com/api-reference/cpn/cpn-platform/get-transaction.md): Retrieves a specific transaction by its ID for a given payment
- [Get a transaction by ID (V2)](https://developers.circle.com/api-reference/cpn/cpn-platform/get-transaction-v2.md): Get a transaction by ID
- [List payments](https://developers.circle.com/api-reference/cpn/cpn-platform/list-payments.md): Returns a list of all payments that fit the specified parameters.
- [Get supported payment routes](https://developers.circle.com/api-reference/cpn/cpn-platform/list-routes.md): Returns a list of route details including trade limits. This information can determine
what corridors and parameters are valid for subsequent quote creation.

- [Submit RFI data](https://developers.circle.com/api-reference/cpn/cpn-platform/submit-rfi.md): Submit encrypted RFI data to complete an RFI request from the BFI.
- [Submit a signed transaction for broadcast](https://developers.circle.com/api-reference/cpn/cpn-platform/submit-transaction.md): Return the signed hex string of the transaction, Circle will validate the content and broadcast to the chain.
- [Submit a signed transaction for broadcast (V2)](https://developers.circle.com/api-reference/cpn/cpn-platform/submit-transaction-v2.md): Submit a signed V2 transaction for broadcast
- [Upload RFI file](https://developers.circle.com/api-reference/cpn/cpn-platform/upload-rfi-file.md): Upload encrypted RFI file.
- [Create a transfer attestation for transferring tokens](https://developers.circle.com/api-reference/gateway/all/create-transfer-attestation.md): Generates a transfer attestation and operator signature for transferring tokens between domains
- [Estimate fees and expiration block heights for a transfer](https://developers.circle.com/api-reference/gateway/all/estimate-transfer.md): Calculates the required fees and expiration block heights for a transfer without requiring signatures or executing the transaction.
- [Get pending deposits for specified addresses](https://developers.circle.com/api-reference/gateway/all/get-deposits.md): Returns pending deposits for each specified depositor address across different domains where that address is valid.
- [Get Gateway info for supported domains and tokens](https://developers.circle.com/api-reference/gateway/all/get-gateway-info.md): Provides information about the API and details of the supported domains and tokens.
- [Get token balances for specified addresses](https://developers.circle.com/api-reference/gateway/all/get-token-balances.md): Returns the current available balance of each specified address across different domains where that address is valid
- [Get full TransferSpec by transferSpecHash](https://developers.circle.com/api-reference/gateway/all/get-transfer-spec.md): Retrieve the full TransferSpec for a given transferSpecHash.
- [Maker deliver operation failed](https://developers.circle.com/api-reference/stablefx/all/contract-maker-deliver-failed.md): The maker deliver operation on the contract has failed. The maker's deliver transaction failed to confirm onchain.
- [Record trade operation failed](https://developers.circle.com/api-reference/stablefx/all/contract-record-trade-failed.md): The record trade operation on the contract has failed. The initial onchain recording of the trade was unsuccessful.
- [Taker deliver operation failed](https://developers.circle.com/api-reference/stablefx/all/contract-taker-deliver-failed.md): The taker deliver operation on the contract has failed. The taker's deliver transaction failed to confirm onchain.
- [Create a quote](https://developers.circle.com/api-reference/stablefx/all/create-quote.md): Creates a quote for a trade between two currencies. You should provide an `amount` for the `from` parameter or the `to` parameter, but not for both.
- [Create a webhook subscription](https://developers.circle.com/api-reference/stablefx/all/create-subscription.md): Create a webhook subscription by configuring an endpoint to receive notifications.

- [Create a trade](https://developers.circle.com/api-reference/stablefx/all/create-trade.md): Accepts a quote and creates a trade.
- [Delete a notification subscription](https://developers.circle.com/api-reference/stablefx/all/delete-subscription.md): Delete an existing subscription.
- [Fund trades](https://developers.circle.com/api-reference/stablefx/all/fund-trade.md): Executes funding for trades using Permit2 signatures. This endpoint relays the signed permit data to complete the funding operation for trades.

- [Generate funding presign data](https://developers.circle.com/api-reference/stablefx/all/generate-funding-presign-data.md): Returns the Permit2 EIP-712 payload that the trader must sign for funding operations.
- [Generate trade presign data](https://developers.circle.com/api-reference/stablefx/all/generate-trade-signature-data.md): Returns the EIP-712 payload that the trader must sign for a CPS trade.
- [Get a notification signature public key](https://developers.circle.com/api-reference/stablefx/all/get-notification-signature.md): Get the public key and algorithm used to digitally sign webhook notifications. Verifying the digital signature ensures the notification came from Circle.

In the headers of each webhook, you can find

  - `X-Circle-Signature`: a header containing the digital signature generated by Circle.

  - `X-Circle-Key-Id`: a header containing the UUID. This is will be used as the `ID` as URL parameter to retrieve the relevant public key.

- [Get a notification subscription](https://developers.circle.com/api-reference/stablefx/all/get-subscription.md): Returns an existing notification subscription.
- [Get all webhook subscriptions](https://developers.circle.com/api-reference/stablefx/all/get-subscriptions.md): Returns an array of all webhook subscriptions.
- [Get a trade](https://developers.circle.com/api-reference/stablefx/all/get-trade-by-id.md): Returns a trade specified by the ID path parameter
- [Get fee for a trade](https://developers.circle.com/api-reference/stablefx/all/get-trade-fee.md): Returns the fee associated with the trade ID provided in the path parameter.
- [Get all trades](https://developers.circle.com/api-reference/stablefx/all/list-trades.md): Returns a paginated list of all trades.
- [Register a trade signature](https://developers.circle.com/api-reference/stablefx/all/register-trade-signature.md): Registers a signed EIP-712 payload from the trader that confirms trade intent.
- [Trade breached](https://developers.circle.com/api-reference/stablefx/all/trade-breached.md): The StableFX trade has breached its maturity date.
- [Trade completed](https://developers.circle.com/api-reference/stablefx/all/trade-completed.md): The StableFX trade has been completed successfully. Both the maker and the taker have funded their side and the trade is fully settled.
- [Trade confirmed](https://developers.circle.com/api-reference/stablefx/all/trade-confirmed.md): The StableFX trade has been confirmed by the exchange.
- [Trade failed](https://developers.circle.com/api-reference/stablefx/all/trade-failed.md): The StableFX trade has failed.
- [Trade maker funded](https://developers.circle.com/api-reference/stablefx/all/trade-maker-funded.md): The maker has funded their side of the trade. The maker's fund delivery transaction has been confirmed onchain.
- [Trade pending settlement](https://developers.circle.com/api-reference/stablefx/all/trade-pending-settlement.md): The StableFX trade has been confirmed onchain and is awaiting funding from taker and maker.
- [Trade taker funded](https://developers.circle.com/api-reference/stablefx/all/trade-taker-funded.md): The taker has funded their side of the trade. The taker's fund delivery transaction has been confirmed onchain.
- [Update a notification subscription](https://developers.circle.com/api-reference/stablefx/all/update-subscription.md): Update a notification subscription by configuring an endpoint to receive notifications.

- [Retrieve a transfer](https://developers.circle.com/api-reference/wallets/buidl/get-transfer.md): Retrieve an existing transfer.
- [Retrieve a user operation](https://developers.circle.com/api-reference/wallets/buidl/get-user-op.md): Retrieve an existing user operation.
- [List transfers](https://developers.circle.com/api-reference/wallets/buidl/list-transfers.md): Retrieve a list of transfers that fit the specified parameters.
- [List user operations](https://developers.circle.com/api-reference/wallets/buidl/list-user-ops.md): Retrieve a list of all user operations that fit the specified parameters.
- [Get wallet balances by blockchain and address](https://developers.circle.com/api-reference/wallets/buidl/list-wallet-balances-by-blockchain-address.md): Retrieve wallet balances by blockchain and address.
- [Get wallet balances](https://developers.circle.com/api-reference/wallets/buidl/list-wallet-balances-by-id.md): Retrieve the balances of a wallet by its ID.
- [Get wallet NFTs by blockchain and address](https://developers.circle.com/api-reference/wallets/buidl/list-wallet-nfts-by-blockchain-address.md): Retrieve the NFTs of a wallet by applicable blockchain and address.
- [Get wallet NFTs](https://developers.circle.com/api-reference/wallets/buidl/list-wallet-nfts-by-id.md): Retrieve the NFTs of a wallet by its ID.
- [Create a notification subscription](https://developers.circle.com/api-reference/wallets/common/create-subscription.md): Create a notification subscription by configuring an endpoint to receive notifications. For details, see the [Notification Flows](https://developers.circle.com/wallets/webhook-notification-flows) guide.

- [Delete a notification subscription](https://developers.circle.com/api-reference/wallets/common/delete-subscription.md): Delete an existing subscription.
- [Get a notification signature public key](https://developers.circle.com/api-reference/wallets/common/get-notification-signature.md): Get the public key and algorithm used to digitally sign webhook notifications. Verifying the digital signature ensures the notification came from Circle.

In the headers of each webhook, you can find
  1. `X-Circle-Signature`: a header containing the digital signature generated by Circle.
  2. `X-Circle-Key-Id`: a header containing the UUID. This is will be used as the `ID` as URL parameter to retrieve the relevant public key.

- [Retrieve a notification subscription](https://developers.circle.com/api-reference/wallets/common/get-subscription.md): Retrieve an existing notification subscription.
- [Get all notification subscriptions](https://developers.circle.com/api-reference/wallets/common/get-subscriptions.md): Retrieve an array of existing notification subscriptions.
- [Ping](https://developers.circle.com/api-reference/wallets/common/ping.md): Checks that the service is running.
- [Update a notification subscription](https://developers.circle.com/api-reference/wallets/common/update-subscription.md): Update subscription endpoint to receive notifications.

- [Screen a blockchain address](https://developers.circle.com/api-reference/wallets/compliance/screen-address.md): Create a screening request for a specific blockchain address and chain.
- [Accelerate a transaction](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/create-developer-transaction-accelerate.md): Accelerates a specified transaction from a developer-controlled wallet. Additional gas fees may be incurred.
- [Cancel a transaction](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/create-developer-transaction-cancel.md): Cancels a specified transaction from a developer-controlled wallet. Gas fees may still be incurred. 
This is a best-effort operation, it won't be effective if the original transaction has already been processed by the blockchain.

- [Create a contract execution transaction](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/create-developer-transaction-contract-execution.md): Creates a transaction which executes a smart contract. ABI parameters must be passed in the request.
Related transactions may be submitted as a batch transaction in a single call.

You must provide either a `walletId` or a `walletAddress` and `blockchain` pair in the request body.

- [Create a transfer transaction](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/create-developer-transaction-transfer.md): Initiates an on-chain digital asset transfer from a specified developer-controlled wallet.

You must provide either a `walletId` or a `walletAddress` and `blockchain` pair in the request body.

- [Create a wallet upgrade transaction](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/create-developer-transaction-wallet-upgrade.md): Creates a transaction which upgrades a wallet.
- [Estimate fee for a contract execution transaction](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/create-transaction-estimate-fee.md): Estimates gas fees that will be incurred for a contract execution transaction, given its ABI parameters and blockchain.
- [Estimate fee for a transfer transaction](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/create-transfer-estimate-fee.md): Estimates gas fees that will be incurred for a transfer transaction; given its amount, blockchain, and token.
- [Validate an address](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/create-validate-address.md): Confirms that a specified address is valid for a given token on a certain blockchain.
- [Create wallets](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/create-wallet.md): Creates a new developer-controlled wallet or a batch of wallets within a wallet set, given the target blockchain and wallet name.

**Note:** Each `walletSetId` supports a maximum of 10 million wallets.

- [Create a new wallet set](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/create-wallet-set.md): Creates a new developer-controlled wallet set.

**Note:** A developer account can create up to 1,000 wallet sets, with each set supporting up to 10 million wallets.
To ensure EVM wallets are created with the same address across chains, see [Unified Wallet Addressing on EVM Chains](/w3s/unified-wallet-addressing-evm).

- [Derive a wallet](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/derive-wallet.md): Derives an EOA (Externally Owned Account) or SCA (Smart Contract Account) wallet using the address of the specified wallet and blockchain. If the target wallet already exists, its metadata will be updated with the provided metadata. This operation is only supported for EVM-based blockchains.
- [Derive wallet by address](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/derive-wallet-by-address.md): Creates a wallet on the target blockchain using the same address as the source wallet identified by source blockchain and wallet address. If the target wallet already exists, its metadata is updated.
- [Get fee parameters of a blockchain](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/get-fee-parameters.md): Get latest fee parameters of a blockchain with an optional account type (default to 'EOA').
- [Get the lowest nonce pending transaction for a wallet](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/get-lowest-nonce-transaction.md): For a nonce-supported blockchain, get the lowest nonce transaction that's in QUEUED or SENT or STUCK state for the provided wallet.
- [Get token details](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/get-token-id.md): Fetches details of a specific token given its unique identifier. Every token in your network of wallets has a UUID associated with it, regardless of whether it's already recognized or was added as a monitored token.
- [Get a transaction](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/get-transaction.md): Retrieves info for a single transaction using it's unique identifier.
- [Retrieve a wallet](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/get-wallet.md): Retrieve an existing wallet
- [Get a wallet set](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/get-wallet-set.md): Retrieve an existing wallet set.
- [Get all wallet sets](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/get-wallet-sets.md): Retrieve an array of existing wallet sets.
- [List wallets](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/get-wallets.md): Retrieves a list of all wallets that fit the specified parameters.
- [List wallets with balances](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/get-wallets-with-balances.md): Retrieves a list of all wallets that match the specified parameters. Wallet balances update automatically after each transfer.

**Note**: On Aptos, this endpoint only returns balances for tokens stored in primary storage. Tokens held in [AIP-21](https://github.com/aptos-labs/aptos-core/releases/tag/aptos-node-v1.5.0) secondary storage are excluded from balance queries and deposit notifications to prevent incorrect or misleading results from secondary storage-based state changes.
- [List transactions](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/list-transactions.md): Lists all transactions. Includes details such as status, source/destination, and transaction hash.
- [Get token balance for a wallet](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/list-wallet-balance.md): Fetches the digital asset balance for a single developer-controlled wallet using its unique identifier.

**Note**: On Aptos, this endpoint only returns balances for tokens stored in primary storage. Tokens held in [AIP-21](https://github.com/aptos-labs/aptos-core/releases/tag/aptos-node-v1.5.0) secondary storage are excluded from balance queries and deposit notifications to prevent incorrect or misleading results from secondary storage-based state changes.
- [Get NFTs for a wallet](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/list-wallet-nfts.md): Fetches the info for all NFTs stored in a single developer-controlled wallet, using the wallets unique identifier.
- [Sign delegate action](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/sign-delegate-action.md): Sign a delegate action from a specific developer-controlled wallet.

NOTE: This endpoint is only available for NEAR and NEAR-TESTNET.
- [Sign message](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/sign-message.md): Sign a message from a specified developer-controlled wallet. This endpoint supports message signing for Ethereum-based blockchains (using EIP-191), Solana and Aptos (using Ed25519 signatures). Note that Smart Contract Accounts (SCA) are specific to Ethereum and EVM-compatible chains. The difference between Ethereum's EOA and SCA can be found in the [account types guide](https://developers.circle.com/wallets/account-types). You can also check the list of Ethereum Dapps that support SCA: https://eip1271.io/."

You must provide either a `walletId` or a `walletAddress` and `blockchain` pair in the request body.

- [Sign transaction](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/sign-transaction.md): Sign a transaction from a specific developer-controlled wallet.

You must provide either a `walletId` or a `walletAddress` and `blockchain` pair in the request body.

NOTE: This endpoint is only available for the following chains: `SOL`, `SOL-DEVNET`, `NEAR`, `NEAR-TESTNET`, `EVM`, `EVM-TESTNET`. Each chain defines its own standard, please refer to [Signing APIs doc](https://learn.circle.com/w3s/signing-apis).

- [Sign typed data](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/sign-typed-data.md): | Sign the EIP-712 typed structured data from a specified developer-controlled wallet.
You must provide either a `walletId` or a `walletAddress` and `blockchain` pair in the request body.
This endpoint only supports Ethereum and EVM-compatible blockchains. Please note that not all apps currently support Smart Contract Accounts (SCA); the difference between Ethereum's EOA and SCA can be found in the [account types guide](https://developers.circle.com/wallets/account-types). You can also check the list of Ethereum apps that support SCA: https://eip1271.io/.
- [Update a wallet](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/update-wallet.md): Updates info metadata of a wallet.
- [Update a wallet set](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/update-wallet-set.md): Update the name of the wallet set
- [Set monitored tokens](https://developers.circle.com/api-reference/wallets/programmable-wallets/create-monitored-tokens.md): Add a new token to the monitored token list.
- [Delete monitored tokens](https://developers.circle.com/api-reference/wallets/programmable-wallets/delete-monitored-tokens.md): Delete tokens from the monitored token list.
- [Get configuration for entity](https://developers.circle.com/api-reference/wallets/programmable-wallets/get-entity-config.md): Get the app ID associated to the entity.
- [Get public key for entity](https://developers.circle.com/api-reference/wallets/programmable-wallets/get-public-key.md): Get the public key associated with the entity.
- [Retrieve existing monitored tokens.](https://developers.circle.com/api-reference/wallets/programmable-wallets/list-monitored-tokens.md): Get monitored tokens
- [Request testnet tokens](https://developers.circle.com/api-reference/wallets/programmable-wallets/request-testnet-tokens.md): Request testnet tokens for your wallet.
- [Update monitored tokens](https://developers.circle.com/api-reference/wallets/programmable-wallets/update-monitored-tokens.md): Upsert the monitored token list.
- [Update monitored tokens scope](https://developers.circle.com/api-reference/wallets/programmable-wallets/update-monitored-tokens-scope.md): Select between monitoring all tokens or selected tokens added to the monitored tokens list.
- [Get a deviceToken to log in with email OTP](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/create-device-token-email-login.md): Get a deviceToken to login with email OTP in SDK
- [Get deviceToken to perform social login](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/create-device-token-social-login.md): Get deviceToken to perform social login in SDK
- [Estimate fee for a contract execution transaction](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/create-transaction-estimate-fee.md): Estimates gas fees that will be incurred for a contract execution transaction, given its ABI parameters and blockchain.
- [Estimate fee for a transfer transaction](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/create-transfer-estimate-fee.md): Estimates gas fees that will be incurred for a transfer transaction; given its amount, blockchain, and token.
- [Create a user](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/create-user.md): Create a user.
- [Create a challenge for PIN setup](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/create-user-pin-challenge.md): Creates a challenge for PIN setup without setting up the wallets.
- [Create a challenge for PIN restore](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/create-user-pin-restore-challenge.md): Creates a challenge to restore a user's PIN using security questions.
- [Create a Challenge to accelerate a transaction](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/create-user-transaction-accelerate-challenge.md): Generates a challenge to accelerate a specific transaction from a user-controlled wallet. Additional gas fees may apply.
- [Create a challenge to cancel a transaction](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/create-user-transaction-cancel-challenge.md): Generates a challenge to cancel a specific transaction from a user-controlled wallet. Gas fees may still apply.
- [Create a challenge for contract execution](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/create-user-transaction-contract-execution-challenge.md): Generates a challenge for creating a transaction which executes a smart contract. ABI parameters must be passed in the request.
- [Create a challenge for a transfer](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/create-user-transaction-transfer-challenge.md): Generates a challenge for initiating an on-chain digital asset transfer from a specified user-controlled wallet
- [Create a challenge for a wallet upgrade](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/create-user-transaction-wallet-upgrade-challenge.md): Generates a challenge to create a transaction that upgrades a wallet.
- [Create wallets](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/create-user-wallet.md): Generates a challenge to create a new user-controlled wallet or a batch of wallets. You must specify the blockchain and wallet name.
- [Create a challenge for user initialization with wallet creation](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/create-user-with-pin-challenge.md): Creates a challenge for user initialization and creates one or more wallets.
- [Validate an address](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/create-validate-address.md): Confirms that a specified address is valid for a given token on a certain blockchain.
- [Get the lowest nonce pending transaction for a wallet](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/get-lowest-nonce-transaction.md): For a nonce-supported blockchain, get the lowest nonce transaction that's in QUEUED or SENT or STUCK state for the provided wallet.
- [Get token details](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/get-token-id.md): Fetches details of a specific token given its unique identifier. Every token in your network of wallets has a UUID associated with it, regardless of whether it's already recognized or was added as a monitored token.
- [Get a transaction](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/get-transaction.md): Retrieves info for a single transaction using it's unique identifier.
- [Get a user by ID](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/get-user.md): Get user by ID.
- [Get user](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/get-user-by-token.md): Retrieve the user by token.
- [Get a challenge](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/get-user-challenge.md): Retrieve a user challenge.
- [Create a user token](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/get-user-token.md): Generate user session and SDK secret key.
- [Get a wallet](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/get-wallet.md): Retrieves info for a single user-controlled wallet using it's unique identifier.
- [List transactions](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/list-transactions.md): Lists all transactions. Includes details such as status, source/destination, and transaction hash.
- [List challenges](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/list-user-challenges.md): List all challenges by status for a user.
- [List users](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/list-users.md): Get all the users under the entity.
- [Get token balance for a wallet](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/list-wallet-balance.md): Fetches the digital asset balance for a single user-controlled wallet using its unique identifier.

**Note**: On Aptos, this endpoint only returns balances for tokens stored in primary storage. Tokens held in [AIP-21](https://github.com/aptos-labs/aptos-core/releases/tag/aptos-node-v1.5.0) secondary storage are excluded from balance queries and deposit notifications to prevent incorrect or misleading results from secondary storage-based state changes.
- [Get NFTs for a wallet](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/list-wallet-nfts.md): Fetches the info for all NFTs stored in a single user-controlled wallet, using the wallets unique identifier.
- [List wallets](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/list-wallets.md): Retrieves a list of all user-controlled wallets that fit the specified parameters.
- [Get a new userToken with the refreshToken](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/refresh-user-token.md): Get a new userToken with the refreshToken passed over from sdk/performLogin which matches to the current userToken
- [Resend an OTP email to the user](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/resend-otp.md): When the users don’t receive the OTP email,  you can call this API to resend OTP email. The prior OTP email would expire after the new one is sent out.
- [Create a challenge to sign message](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/sign-user-message.md): Generates a challenge for signing a message from a specified user-controlled wallet. This endpoint supports Ethereum-based blockchains (using EIP-191), Solana and Aptos (using Ed25519 signatures). Note that Smart Contract Accounts (SCA) are specific to Ethereum and EVM-compatible chains. The difference between Ethereum's EOA and SCA can be found in the [account types guide](https://developers.circle.com/wallets/account-types). You can also check the list of Ethereum Dapps that support SCA: https://eip1271.io/.
- [Create a challenge to sign transaction](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/sign-user-transaction.md): Generate a challenge for signing the transaction from a specific user-controlled wallet.



NOTE: This endpoint supports the following blockchains: SOL, SOL-DEVNET, EVM, EVM-TESTNET. Each chain defines its own standard. For more details, see [Signing APIs](https://developers.circle.com/w3s/signing-apis).
- [Create a challenge to sign typed data](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/sign-user-typed-data.md): Generates a challenge for signing the EIP-712 typed structured data from a specified user-controlled wallet. This endpoint only supports Ethereum and EVM-compatible blockchains. Please note that not all Dapps currently support Smart Contract Accounts (SCA); the difference between Ethereum's EOA and SCA can be found in the [account types guide](https://developers.circle.com/wallets/account-types). You can also check the list of Ethereum Dapps that support SCA: https://eip1271.io/.
- [Create a challenge to update PIN](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/update-user-pin-challenge.md): Creates a challenge to update a user's PIN using the current PIN.
- [Update a wallet](https://developers.circle.com/api-reference/wallets/user-controlled-wallets/update-wallet.md): Updates info for a single user-controlled wallet using it's unique identifier.
- [Get an attestation for a crosschain transfer](https://developers.circle.com/api-reference/xreserve/all/get-attestation.md): Returns the attestation for a specified crosschain transfer using the deposit message hash.
- [Get token balances on a remote domain](https://developers.circle.com/api-reference/xreserve/all/get-balances.md): Returns the expected token balances for a specified remote domain based on the deposit amounts made into xReserve.
- [Get domain information](https://developers.circle.com/api-reference/xreserve/all/get-info.md): Returns information on source and remote domains, including its supported tokens and configuration details.
- [Get withdrawal status](https://developers.circle.com/api-reference/xreserve/all/get-withdrawal-status.md): Returns the status and transfer details of a specified withdrawal group.
- [List attestations for crosschain transfers](https://developers.circle.com/api-reference/xreserve/all/list-attestations.md): Returns an array of attestations for the specified crosschain transfers, filtered by remote domain.

Use the Link header in the response to navigate between pages.

- [Prepare a withdrawal request](https://developers.circle.com/api-reference/xreserve/all/prepare-withdrawal.md): Turns the user's burn transaction data on the remote chain into fully encoded burn intents to send to the `/withdraw` endpoint. This endpoint performs the following:
- Resolves contract and token addresses across networks.
- Determines the optimal forwarding strategy, such as redepositing to another xReserve remote domain or forwarding to a CCTP domain.
- Calculates transfer amounts and fees.
- Encodes forwarding call data with the calculated transfer amounts.
- Generates `maxBlockHeight` and `maxFee` values with safety buffers.
- Returns data in the structure expected by the withdraw endpoint.

Note: The `/withdraw` endpoint requires signatures and the remote chain `burnTxId` in addition to the burn intent prepared by this endpoint.

- [Submit signed burn intents for withdrawal](https://developers.circle.com/api-reference/xreserve/all/submit-withdrawal.md): Submits up to five signed burn intent batches per request call. Each batch may contain one burn intent or a set of up to 10.
- [Assets](https://developers.circle.com/assets.md): Build on trusted digital money: USDC and EURC for open integration, USYC for yield, and xReserve to issue branded, USDC-backed stablecoins.
- [Bridge Kit](https://developers.circle.com/bridge-kit.md)
- [Adapter Setups](https://developers.circle.com/bridge-kit/concepts/adapter-setups.md)
- [Bridge Kit Custom Fees](https://developers.circle.com/bridge-kit/concepts/custom-fees.md)
- [Quickstart: Transfer USDC from Arc to Base](https://developers.circle.com/bridge-kit/quickstarts/transfer-usdc-from-arc-to-base.md): Learn how to use Bridge Kit to transfer USDC from Arc to Base.
- [Quickstart: Transfer USDC from Arc to Solana with Circle Wallets](https://developers.circle.com/bridge-kit/quickstarts/transfer-usdc-from-arc-to-solana-with-circle-wallets.md): Learn how to use Bridge Kit with the Circle Wallets adapter to transfer USDC from Arc to Solana.
- [Quickstart: Transfer USDC from Ethereum to Solana](https://developers.circle.com/bridge-kit/quickstarts/transfer-usdc-from-ethereum-to-solana.md): Learn how to use Bridge Kit to transfer USDC from Ethereum to Solana.
- [Error Recovery and Troubleshooting](https://developers.circle.com/bridge-kit/references/error-recovery-and-troubleshooting.md)
- [Event Handling](https://developers.circle.com/bridge-kit/references/event-handling.md)
- [Bridge Kit SDK Reference](https://developers.circle.com/bridge-kit/references/sdk-reference.md)
- [Bridge Kit Supported Blockchains](https://developers.circle.com/bridge-kit/references/supported-blockchains.md)
- [Collect a Transfer Fee](https://developers.circle.com/bridge-kit/tutorials/collect-a-transfer-fee.md): Collect a custom fee from end users on crosschain transfers
- [Configure Transfer Speed and Maximum Cost](https://developers.circle.com/bridge-kit/tutorials/configure-transfer-speed.md): Set a transfer speed and maximum fee to balance performance and cost
- [Estimate Costs Before Transferring](https://developers.circle.com/bridge-kit/tutorials/estimate-costs.md): Estimate gas and provider fees before making crosschain transfers
- [Bridge Kit Installation](https://developers.circle.com/bridge-kit/tutorials/installation.md)
- [Specify Recipient Address](https://developers.circle.com/bridge-kit/tutorials/specify-recipient-address.md): Send bridged tokens to a different address than the signing wallet
- [Use the Forwarding Service](https://developers.circle.com/bridge-kit/tutorials/use-forwarding-service.md): Use the Circle Forwarding Service on crosschain transfers
- [Build Onchain Experiences](https://developers.circle.com/build-onchain.md): Compose wallets, contracts, gas sponsorship, and compliance to ship onchain apps faster.
- [Cross-Chain Transfer Protocol](https://developers.circle.com/cctp.md)
- [CCTP-Enabled HyperCore Transfers](https://developers.circle.com/cctp/concepts/cctp-on-hypercore.md)
- [Fast Transfer Allowance](https://developers.circle.com/cctp/concepts/fast-transfer-allowance.md): Understanding Circle's Fast Transfer allowance mechanism
- [CCTP Fees](https://developers.circle.com/cctp/concepts/fees.md): Understanding CCTP transfer fees for Fast and Standard transfers
- [Finality and Block Confirmations](https://developers.circle.com/cctp/concepts/finality-and-block-confirmations.md): Block confirmation requirements and attestation timing for CCTP
- [Circle Forwarding Service](https://developers.circle.com/cctp/concepts/forwarding-service.md): Forward destination chain mints to simplify crosschain transfers
- [Supported Blockchains and Domains](https://developers.circle.com/cctp/concepts/supported-chains-and-domains.md): Blockchains and domain identifiers supported by CCTP
- [Get the Fast Transfer Allowance](https://developers.circle.com/cctp/howtos/get-fast-transfer-allowance.md): Check the remaining Fast Transfer allowance for USDC transfers
- [Get the Fee for Your Transfer](https://developers.circle.com/cctp/howtos/get-transfer-fee.md): Retrieve CCTP transfer fees using the API
- [Resolve Attestation Issues](https://developers.circle.com/cctp/howtos/resolve-stuck-attestation.md): Troubleshoot and resolve common problems with CCTP attestations
- [Retry a Failed Mint](https://developers.circle.com/cctp/howtos/retry-failed-mint.md): Complete a CCTP transfer when the mint transaction fails
- [Transfer USDC from Arbitrum to HyperCore](https://developers.circle.com/cctp/howtos/transfer-usdc-from-arbitrum-to-hypercore.md)
- [Transfer USDC from Ethereum to HyperCore](https://developers.circle.com/cctp/howtos/transfer-usdc-from-ethereum-to-hypercore.md)
- [Transfer USDC from HyperEVM to HyperCore](https://developers.circle.com/cctp/howtos/transfer-usdc-from-hyperevm-to-hypercore.md)
- [Transfer USDC from Solana to HyperCore](https://developers.circle.com/cctp/howtos/transfer-usdc-from-solana-to-hypercore.md)
- [How-to: Transfer USDC with the Forwarding Service](https://developers.circle.com/cctp/howtos/transfer-usdc-with-forwarding-service.md): Transfer USDC Crosschain with the Circle Forwarding Service
- [Troubleshoot CCTP Transfers](https://developers.circle.com/cctp/howtos/troubleshoot-transfers.md): Diagnose and resolve stuck or failed crosschain USDC transfers
- [Withdraw USDC from HyperCore to EVM chains](https://developers.circle.com/cctp/howtos/withdraw-usdc-from-hypercore-to-evm.md)
- [Withdraw USDC from HyperCore to HyperEVM](https://developers.circle.com/cctp/howtos/withdraw-usdc-from-hypercore-to-hyperevm.md)
- [Migrate from CCTP V1 (Legacy) to V2](https://developers.circle.com/cctp/migration-from-v1-to-v2.md): Complete migration guide for developers upgrading CCTP integrations
- [Transfer USDC from Ethereum to Arc](https://developers.circle.com/cctp/quickstarts/transfer-usdc-ethereum-to-arc.md): Build a script to transfer USDC between EVM blockchains using CCTP
- [Transfer USDC from Solana to Arc](https://developers.circle.com/cctp/quickstarts/transfer-usdc-solana-to-arc.md): Transfer USDC from Solana to an EVM blockchain using CCTP
- [Attestation Verification](https://developers.circle.com/cctp/references/attestation-verification.md): Technical reference for verifying CCTP attestation signatures
- [Contract Addresses](https://developers.circle.com/cctp/references/contract-addresses.md): CCTP smart contract addresses for EVM-compatible blockchains
- [EVM Contract Interfaces](https://developers.circle.com/cctp/references/contract-interfaces.md): Public methods and events for CCTP smart contracts on EVM-compatible blockchains
- [CoreDepositWallet Contract Interface](https://developers.circle.com/cctp/references/coredepositwallet-contract-interface.md)
- [HyperCore CCTP-Enablement Contract Addresses](https://developers.circle.com/cctp/references/hypercore-contract-addresses.md)
- [CCTP Solana Programs and Interfaces](https://developers.circle.com/cctp/references/solana-programs.md): Programs for CCTP support on the Solana blockchain
- [CCTP Starknet Contracts and Interfaces](https://developers.circle.com/cctp/references/starknet-contracts.md): Contracts for CCTP support on the Starknet blockchain
- [CCTP Technical Guide](https://developers.circle.com/cctp/references/technical-guide.md): Technical explainer for CCTP
- [Cross-Chain Transfer Protocol V1](https://developers.circle.com/cctp/v1.md): Move USDC securely across blockchains and simplify user experience
- [CCTP Aptos Packages and Interfaces V1](https://developers.circle.com/cctp/v1/aptos-packages.md): Packages for CCTP V1 support on the Aptos blockchain
- [CCTP API Hosts and Endpoints V1](https://developers.circle.com/cctp/v1/cctp-apis.md): API hosts and endpoints for CCTP V1
- [CCTP Supported Blockchains V1](https://developers.circle.com/cctp/v1/cctp-supported-blockchains.md)
- [CCTP EVM Contracts and Interfaces V1](https://developers.circle.com/cctp/v1/evm-smart-contracts.md): CCTP V1 smart contracts for EVM-compatible blockchains
- [CCTP Message Passing V1](https://developers.circle.com/cctp/v1/generic-message-passing.md): CCTP V1 architecture on EVM and non-EVM domains
- [CCTP Limits V1](https://developers.circle.com/cctp/v1/limits.md): Limits for CCTP V1 burning and minting
- [CCTP Message Format V1](https://developers.circle.com/cctp/v1/message-format.md): Format arbitrary and application-specific messages using CCTP V1
- [CCTP Noble Cosmos Module V1](https://developers.circle.com/cctp/v1/noble-cosmos-module.md): Cosmos SDK Module for CCTP V1 support on Noble
- [CCTP Block Confirmations V1](https://developers.circle.com/cctp/v1/required-block-confirmations.md): Block confirmation requirements for attestations by chain
- [CCTP Solana Programs and Interfaces V1](https://developers.circle.com/cctp/v1/solana-programs.md): Programs for CCTP V1 support on the Solana blockchain
- [CCTP Sui Packages and Interfaces V1](https://developers.circle.com/cctp/v1/sui-packages.md): Packages for CCTP V1 support on the Sui blockchain
- [CCTP Chain Domains V1](https://developers.circle.com/cctp/v1/supported-domains.md): Mapping of supported CCTP V1 domains
- [Transfer USDC on devnet between Solana and other chains using CCTP V1](https://developers.circle.com/cctp/v1/transfer-testnet-usdc-between-solana-devnet.md): Explore this tutorial for transferring USDC between Solana devnet and other testnets via CCTP V1
- [Transfer USDC on testnet between Aptos and Base using CCTP V1](https://developers.circle.com/cctp/v1/transfer-usdc-on-testnet-from-aptos-to-base.md): Explore this tutorial for transferring USDC between Aptos testnet and Base Sepolia Testnet via CCTP V1
- [Transfer USDC on testnet from Ethereum to Avalanche using CCTP V1](https://developers.circle.com/cctp/v1/transfer-usdc-on-testnet-from-ethereum-to-avalanche.md): Explore this script to transfer USDC on testnet between two EVM-compatible chains via CCTP V1
- [Transfer USDC on testnet between Noble and Ethereum using CCTP V1](https://developers.circle.com/cctp/v1/transfer-usdc-on-testnet-from-noble-to-ethereum.md): Explore this tutorial for transferring USDC on testnet between Noble via CCTP V1 and Ethereum
- [Transfer USDC on testnet between Sui and Ethereum using CCTP V1](https://developers.circle.com/cctp/v1/transfer-usdc-on-testnet-from-sui-to-ethereum.md): Explore this tutorial for transferring USDC between Sui testnet and Ethereum Sepolia Testnet via CCTP V1
- [Idempotent Requests](https://developers.circle.com/circle-mint/a-note-on-idempotent-requests.md): Ensure that your transactions are executed only once in case they need to be retried.
- [Additional APIs](https://developers.circle.com/circle-mint/additional-apis.md)
- [API Keys](https://developers.circle.com/circle-mint/api-keys.md): Get the API keys you need to authenticate client requests—and learn how to keep them safe.
- [API Logs](https://developers.circle.com/circle-mint/api-logs.md): View API log entries in the Developer Tab to review transactions and debug any errors.
- [Authentication](https://developers.circle.com/circle-mint/authentication.md): Use API keys to authenticate your client requests when utilizing Circle APIs.
- [Blockchain Confirmations](https://developers.circle.com/circle-mint/blockchain-confirmations.md)
- [API Resource Data Models](https://developers.circle.com/circle-mint/circle-api-resources.md): Discover the many resources used by Circle APIs to enable payouts, payments, and transfers.
- [Circle APIs: API and Entity Errors](https://developers.circle.com/circle-mint/circle-apis-api-errors.md)
- [Notifications Quickstart](https://developers.circle.com/circle-mint/circle-apis-notifications-quickstart.md): Configure a notification subscriber endpoint and be notified when a payment is received.
- [Sandbox Environment](https://developers.circle.com/circle-mint/circle-apis-production-sandbox-environments.md): Learn about Circle's sandbox environment for safe development and testing.
- [Circle SDKs](https://developers.circle.com/circle-mint/circle-sdks.md): Use our SDKs to quickly get your codebase up and running with Circle APIs.
- [Quickstart: Crypto Deposits](https://developers.circle.com/circle-mint/crypto-payments-quickstart.md)
- [Send USDC from your Circle Mint Account](https://developers.circle.com/circle-mint/crypto-payouts.md)
- [Quickstart: Crypto Refunds](https://developers.circle.com/circle-mint/crypto-refunds.md)
- [Quickstart: Exchange Local Currency for USDC](https://developers.circle.com/circle-mint/exchange-local-currency-usdc.md)
- [Getting Started](https://developers.circle.com/circle-mint/getting-started-with-the-circle-apis.md): Connect your applications to Circle to use USDC for payments, payouts, and transfers.
- [Overview](https://developers.circle.com/circle-mint/introducing-circle-mint.md): Use Circle Mint to manage funds securely and distribute them seamlessly to crypto wallets around the world, 24/7.
- [Notifications Data Models](https://developers.circle.com/circle-mint/notifications-data-models.md): Learn about the events and data models used in Circle Notifications.
- [Date Filtering and Pagination Queries](https://developers.circle.com/circle-mint/pagination-and-filtering.md): Quickly locate any transaction using Circle's date and pagination query parameters.
- [Postman Suite](https://developers.circle.com/circle-mint/postman.md): Use Circle's Postman collections to easily send API requests and try out our APIs.
- [Quickstart: Deposit via Blockchain Wallet](https://developers.circle.com/circle-mint/quickstart-deposit-via-blockchain-wallet.md): Learn the basics of sending funds to your Circle account from an external blockchain wallet.
- [Quickstart: Deposit via Funds Transfer](https://developers.circle.com/circle-mint/quickstart-deposit-via-funds-transfer.md): Learn the basics of sending funds to your Circle account from an external bank account.
- [Quickstart: Withdraw to Bank](https://developers.circle.com/circle-mint/quickstart-withdraw-to-bank.md): Learn the basics of sending funds from your Circle account to an external bank account.
- [Quickstart: Withdraw via Blockchain Wallet](https://developers.circle.com/circle-mint/quickstart-withdraw-via-blockchain-wallet.md): Learn the basics of sending funds from your Circle account to an external blockchain wallet.
- [Sandbox to Production Transition Guide](https://developers.circle.com/circle-mint/sandbox-to-production-transition-guide.md): Move your code from sandbox into production so you can take your site live and accept transactions.
- [Supported Chains and Currencies](https://developers.circle.com/circle-mint/supported-chains-and-currencies.md)
- [Supported Countries](https://developers.circle.com/circle-mint/supported-countries.md): Learn which countries support wire transfers for minting and redeeming USDC.
- [Quickstart: Swap Between USDC and EURC](https://developers.circle.com/circle-mint/swap-between-usdc-and-eurc.md)
- [Using sandbox to test connectivity and API keys](https://developers.circle.com/circle-mint/testing-connectivity-and-api-keys.md): Use the Circle sandbox to check your connectivity and verify your API key.
- [Onchain Travel Rule](https://developers.circle.com/circle-mint/travel-rule-on-chain.md)
- [Manage Webhook Subscriptions](https://developers.circle.com/circle-mint/webhook-subscription-management.md): Subscribe to webhook notifications to be notified automatically when a transaction occurs.
- [Wire Virtual Account Number](https://developers.circle.com/circle-mint/wire-virtual-account-number.md): Improve customer experience and avoid returned wires when sending funds to Circle.
- [Contracts](https://developers.circle.com/contracts.md)
- [Airdrop Template](https://developers.circle.com/contracts/airdrop.md)
- [Quickstart: Deploy an ERC-1155 Contract Template](https://developers.circle.com/contracts/deploy-smart-contract-template.md): Use Circle Contract Templates to deploy smart contracts without writing Solidity
- [Multi-Token Template](https://developers.circle.com/contracts/erc-1155-multi-token.md)
- [Token Template](https://developers.circle.com/contracts/erc-20-token.md)
- [NFT Template](https://developers.circle.com/contracts/erc-721-nft.md)
- [Quickstart: Deploy a Smart Contract using Bytecode](https://developers.circle.com/contracts/scp-deploy-smart-contract.md): Deploy smart contract bytecode using Circle Contracts
- [Quickstart: Event Monitoring for Smart Contracts](https://developers.circle.com/contracts/scp-event-monitoring.md)
- [Quickstart: Interact With a Smart Contract](https://developers.circle.com/contracts/scp-interact-smart-contract.md)
- [Contracts Templates](https://developers.circle.com/contracts/scp-templates-overview.md): Deploy pre-audited smart contracts without writing Solidity code.
- [Circle Contracts Supported Blockchains](https://developers.circle.com/contracts/supported-blockchains.md)
- [Circle Payments Network](https://developers.circle.com/cpn.md): Fast, cost-effective, and compliant global payments
- [CPN Integration Concepts](https://developers.circle.com/cpn/concepts/api/api-integration.md)
- [JSON Schema](https://developers.circle.com/cpn/concepts/api/json-schema.md)
- [Requests for Information](https://developers.circle.com/cpn/concepts/compliance/rfis.md)
- [CPN Component States and Workflows](https://developers.circle.com/cpn/concepts/payments/component-states-and-workflows.md)
- [Payment Reference](https://developers.circle.com/cpn/concepts/payments/payment-reference.md)
- [Payment](https://developers.circle.com/cpn/concepts/payments/payments.md)
- [Quotes](https://developers.circle.com/cpn/concepts/quotes.md)
- [Block Confirmation and Transaction Finality](https://developers.circle.com/cpn/concepts/transactions/block-confirmation-and-finality.md)
- [Transaction](https://developers.circle.com/cpn/concepts/transactions/transaction-overview.md)
- [Transactions V2](https://developers.circle.com/cpn/concepts/transactions/transactions-v2.md)
- [Wallet Nonce Management](https://developers.circle.com/cpn/concepts/transactions/wallet-nonce-management.md)
- [Webhook Retries](https://developers.circle.com/cpn/concepts/webhooks/webhook-retries.md)
- [How-to: Respond to an RFI](https://developers.circle.com/cpn/guides/compliance/respond-to-rfi.md)
- [Encrypt Files for RFI Transmission](https://developers.circle.com/cpn/guides/payments/encrypt-files.md)
- [How-to: Encrypt Travel Rule and Beneficiary Data](https://developers.circle.com/cpn/guides/payments/encrypt-travel-rule-beneficiary-data.md)
- [Integrate with JSON Schema](https://developers.circle.com/cpn/guides/payments/integrate-with-json-schema.md)
- [Request Payment Configurations and Routes](https://developers.circle.com/cpn/guides/payments/request-payment-config.md)
- [Create an Onchain Transaction](https://developers.circle.com/cpn/guides/transactions/create-an-onchain-txn.md)
- [How-to: Grant USDC Allowance to Permit2](https://developers.circle.com/cpn/guides/transactions/grant-usdc-allowance-to-permit2.md): Grant a USDC token allowance to the Permit2 contract using a Circle Wallets developer-controlled wallet or an EIP-1193 Ethereum wallet
- [How-to: Migrate from Transactions V1 to V2](https://developers.circle.com/cpn/guides/transactions/migrate-from-txn-v1-to-v2.md): Update your CPN integration from Transactions V1 to V2
- [Set up Webhook Notifications](https://developers.circle.com/cpn/guides/webhooks/setup-webhook-notifications.md)
- [Verify Webhook Signatures](https://developers.circle.com/cpn/guides/webhooks/verify-webhook-signatures.md)
- [Integrate with CPN as an OFI](https://developers.circle.com/cpn/quickstarts/integrate-with-cpn-ofi.md)
- [Payment Smart Contract Addresses](https://developers.circle.com/cpn/references/blockchains/contract-addresses.md): Payment smart contract addresses for CPN
- [Supported Blockchains](https://developers.circle.com/cpn/references/blockchains/supported-blockchains.md)
- [Wallet Provider Compatibility](https://developers.circle.com/cpn/references/blockchains/wallet-provider-compatibility.md)
- [RFI Levels](https://developers.circle.com/cpn/references/compliance/rfi-levels.md)
- [CPN Supported Countries](https://developers.circle.com/cpn/references/compliance/supported-countries.md): Countries supported by the Circle Payments Network
- [Travel Rule Requirements](https://developers.circle.com/cpn/references/compliance/travel-rule-requirements.md)
- [Validating Brazilian Tax ID and Bank Account Numbers](https://developers.circle.com/cpn/references/compliance/validating-brazil-tax-account-id.md)
- [Error Codes](https://developers.circle.com/cpn/references/errors/error-codes.md)
- [Payment and Transaction Failure Reasons](https://developers.circle.com/cpn/references/errors/payment-and-transaction-failure-reasons.md)
- [Payment Failure Codes](https://developers.circle.com/cpn/references/errors/payment-failure-codes.md)
- [Payment Reason Codes](https://developers.circle.com/cpn/references/errors/payment-reason-codes.md)
- [Supported Payment Methods](https://developers.circle.com/cpn/references/payments/supported-payment-methods.md)
- [Postman API Suite](https://developers.circle.com/cpn/references/postman.md): Use Circle's Postman collection to send API requests and try CPN APIs.
- [Magic Values for Testing](https://developers.circle.com/cpn/references/testing/magic-values.md)
- [Webhook Events](https://developers.circle.com/cpn/references/webhooks/webhook-events.md)
- [Crosschain Transfers](https://developers.circle.com/crosschain-transfers.md): Move USDC seamlessly across blockchains with native burn-and-mint protocols, unified balances, and developer-friendly SDKs.
- [Circle Gateway](https://developers.circle.com/gateway.md)
- [How-to: Create a Unified USDC Balance](https://developers.circle.com/gateway/howtos/create-unified-usdc-balance.md)
- [How-to: Manage Delegates for Smart Contract Wallets](https://developers.circle.com/gateway/howtos/manage-delegates.md)
- [How-to: Transfer a Unified USDC Balance Instantly](https://developers.circle.com/gateway/howtos/transfer-unified-usdc-balance.md)
- [Quickstart: Create and Transfer a Unified USDC Balance on EVM](https://developers.circle.com/gateway/quickstarts/unified-balance-evm.md): Create and transfer a unified USDC balance on EVM using Circle Gateway.
- [Quickstart: Create and Transfer a Unified USDC Balance on Solana](https://developers.circle.com/gateway/quickstarts/unified-balance-solana.md): Create and transfer a unified USDC balance on Solana using Circle Gateway.
- [Gateway Smart Contract Addresses on EVM](https://developers.circle.com/gateway/references/contract-addresses.md): Circle Gateway smart contract addresses on EVM
- [Gateway Contract Interfaces and Events on EVM](https://developers.circle.com/gateway/references/contract-interfaces-and-events.md): Learn about the Circle Gateway smart contracts on EVM
- [Gateway Fees](https://developers.circle.com/gateway/references/fees.md): Understanding Gateway transfer fees and gas costs
- [Technical Guide for Gateway on Solana](https://developers.circle.com/gateway/references/solana.md): Differences between Gateway on Solana and EVM
- [Solana Programs and Interfaces for Gateway](https://developers.circle.com/gateway/references/solana-programs.md)
- [Gateway Supported Blockchains](https://developers.circle.com/gateway/references/supported-blockchains.md): List of blockchains that Gateway supports
- [Gateway Technical Guide](https://developers.circle.com/gateway/references/technical-guide.md)
- [Circle Developer Docs](https://developers.circle.com/index.md)
- [Liquidity Services](https://developers.circle.com/liquidity-services.md): Access institutional-grade tools for minting USDC and EURC directly from Circle, and execute stablecoin FX trades with aggregated liquidity.
- [Paymaster](https://developers.circle.com/paymaster.md): Pay gas fees with USDC
- [Paymaster Addresses and Events](https://developers.circle.com/paymaster/addresses-and-events.md)
- [Quickstart: Circle Paymaster](https://developers.circle.com/paymaster/pay-gas-fees-usdc.md): Build a smart wallet that pays fees in USDC
- [Payments](https://developers.circle.com/payments.md): Enable fast, cost-effective, and compliant cross-border payments using stablecoin infrastructure and built-in compliance capabilities.
- [All Products](https://developers.circle.com/products.md): Browse guides and examples by product
- [Release Notes](https://developers.circle.com/release-notes.md): Release notes for Circle's developer products.
- [Release Notes - Bridge Kit - 2026](https://developers.circle.com/release-notes/bridge-kit-2026.md): 2026 release notes for Circle's Bridge Kit SDK
- [Release Notes - CCTP - 2026](https://developers.circle.com/release-notes/cctp-2026.md): 2026 release notes for CCTP
- [Release Notes - Circle Mint - 2024](https://developers.circle.com/release-notes/circle-mint-2024.md): 2024 release notes for Circle Mint
- [Release Notes - Circle Mint - 2025](https://developers.circle.com/release-notes/circle-mint-2025.md): 2025 release notes for Circle Mint
- [Release Notes - Circle Payments Network - 2025](https://developers.circle.com/release-notes/cpn-2025.md): 2025 release notes for Circle Payments Network
- [Release Notes - EURC - 2026](https://developers.circle.com/release-notes/eurc-2026.md): 2026 release notes for EURC
- [Release Notes - Gateway - 2026](https://developers.circle.com/release-notes/gateway-2026.md): 2026 release notes for Gateway
- [Release Notes - Stablecoins - 2024](https://developers.circle.com/release-notes/stablecoins-2024.md): 2024 release notes for Stablecoins
- [Release Notes - Stablecoins - 2025](https://developers.circle.com/release-notes/stablecoins-2025.md): 2025 release notes for Stablecoins
- [Release Notes - StableFX - 2025](https://developers.circle.com/release-notes/stablefx-2025.md): 2025 release notes for StableFX
- [Release Notes - Tokenized Funds - 2025](https://developers.circle.com/release-notes/tokenized-funds-2025.md): 2025 release notes for Tokenized Funds
- [Release Notes - USDC - 2026](https://developers.circle.com/release-notes/usdc-2026.md): 2026 release notes for USDC
- [Release Notes - Developer Services - 2024](https://developers.circle.com/release-notes/w3s-2024.md): 2024 release notes for Circle's Developer Services platform
- [Release Notes - Developer Services - 2025](https://developers.circle.com/release-notes/w3s-2025.md): 2025 release notes for Circle's Developer Services platform
- [Release Notes - Wallets - 2026](https://developers.circle.com/release-notes/wallets-2026.md): 2026 release notes for Wallets
- [Release Notes - xReserve - 2026](https://developers.circle.com/release-notes/xreserve-2026.md): 2026 release notes for xReserve
- [Browse Sample Projects](https://developers.circle.com/sample-projects.md)
- [Browse SDKs](https://developers.circle.com/sdks.md): Explore Circle's SDKs to learn and simplify your development with the Circle Platform
- [Getting Started with the Contracts Node.js SDK](https://developers.circle.com/sdks/contracts-nodejs-sdk.md)
- [Getting Started with the Contracts Python SDK](https://developers.circle.com/sdks/contracts-python-sdk.md)
- [Getting Started with the Developer-Controlled Wallets Node.js SDK](https://developers.circle.com/sdks/developer-controlled-wallets-nodejs-sdk.md)
- [Getting Started with the Developer-Controlled Wallets Python SDK](https://developers.circle.com/sdks/developer-controlled-wallets-python-sdk.md)
- [Server-side SDK Pydantic v2 Upgrade](https://developers.circle.com/sdks/pydantic-v2-upgrade.md)
- [Getting Started with the User-Controlled Wallets Node.js SDK](https://developers.circle.com/sdks/user-controlled-wallets-nodejs-sdk.md)
- [Getting Started with the User-Controlled Wallets Python SDK](https://developers.circle.com/sdks/user-controlled-wallets-python-sdk.md)
- [EURC Contract Addresses](https://developers.circle.com/stablecoins/eurc-contract-addresses.md)
- [Quickstart: Set up and transfer USDC on Aptos](https://developers.circle.com/stablecoins/quickstart-setup-transfer-usdc-aptos.md)
- [Quickstart: Set up and transfer USDC on Starknet](https://developers.circle.com/stablecoins/quickstart-setup-transfer-usdc-starknet.md)
- [Quickstart: Set up and transfer USDC on Sui](https://developers.circle.com/stablecoins/quickstart-setup-transfer-usdc-sui.md)
- [Quickstart: Set up a USDC trustline on XRPL](https://developers.circle.com/stablecoins/quickstart-setup-usdc-trustline-xrpl.md)
- [Quickstart: Transfer USDC on Solana](https://developers.circle.com/stablecoins/quickstart-transfer-10-usdc-on-solana.md): Transfer USDC between wallets on Solana Devnet using a Node.js script
- [Quickstart: Transfer EURC on EVM chains](https://developers.circle.com/stablecoins/quickstarts/transfer-eurc-evm.md): Transfer EURC between wallets on EVM chains using a Node.js script
- [Quickstart: Transfer USDC on EVM chains](https://developers.circle.com/stablecoins/quickstarts/transfer-usdc-evm.md): Transfer USDC between wallets on EVM chains using a Node.js script
- [USDC Contract Addresses](https://developers.circle.com/stablecoins/usdc-contract-addresses.md)
- [What is EURC?](https://developers.circle.com/stablecoins/what-is-eurc.md)
- [What is USDC?](https://developers.circle.com/stablecoins/what-is-usdc.md)
- [StableFX](https://developers.circle.com/stablefx.md): Institutional-grade stablecoin FX engine built on Arc
- [StableFX Talos Integration for Makers](https://developers.circle.com/stablefx/concepts/maker-talos-integration.md): Integrate with StableFX as a maker on Talos
- [StableFX Technical Guide](https://developers.circle.com/stablefx/concepts/technical-guide.md): Technical implementation details for StableFX
- [Grant USDC Allowance to Permit2](https://developers.circle.com/stablefx/howtos/grant-usdc-allowance-permit2.md): Use Uniswap's Permit2 contract to grant USDC allowance to the StableFX FxEscrow contract
- [Setup StableFX Webhook Notifications](https://developers.circle.com/stablefx/howtos/setup-webhook-notifications.md): Configure a notification subscriber endpoint and be notified when events occur
- [Verify Webhook Signatures for StableFX](https://developers.circle.com/stablefx/howtos/verify-webhook-signatures.md): Verify the integrity of StableFX webhook notifications
- [Quickstart: Fulfill an FX Trade as a Maker](https://developers.circle.com/stablefx/quickstarts/fx-trade-maker.md): Use the StableFX API to fulfill an FX trade on the maker side
- [Quickstart: Create an FX Trade as a Taker](https://developers.circle.com/stablefx/quickstarts/fx-trade-taker.md): Use the StableFX API to create an FX trade on the taker side
- [StableFX Contract Interfaces](https://developers.circle.com/stablefx/references/contract-interfaces.md): User-facing methods of the StableFX contract
- [StableFX Supported Currencies](https://developers.circle.com/stablefx/references/supported-currencies.md): The currencies supported by StableFX for FX swaps
- [Magic Numbers for Testing StableFX](https://developers.circle.com/stablefx/references/testing-magic-numbers.md): Magic numbers you can use to create certain trade outcomes for testing
- [StableFX Trade States](https://developers.circle.com/stablefx/references/trade-states.md): Learn about the different states a StableFX trade can be in
- [Test your StableFX Integration as a Maker](https://developers.circle.com/stablefx/tutorials/test-stablefx-integration-maker.md): Test your interation with the StableFX API and smart contracts on the maker side
- [Test your StableFX Integration as a Taker](https://developers.circle.com/stablefx/tutorials/test-stablefx-integration-taker.md): Test your interation with the StableFX API and smart contracts on the taker side
- [USYC Overview](https://developers.circle.com/tokenized/usyc/overview.md)
- [USYC Contract Addresses](https://developers.circle.com/tokenized/usyc/smart-contracts.md)
- [Quickstart: Subscribe and Redeem USYC Using the Teller Smart Contract](https://developers.circle.com/tokenized/usyc/subscribe-and-redeem.md)
- [Quickstart: Subscribe and Redeem USYC Using the USYC Portal](https://developers.circle.com/tokenized/usyc/subscribe-and-redeem-portal.md)
- [Quickstart: Subscribe and Redeem USYC on Solana](https://developers.circle.com/tokenized/usyc/subscribe-and-redeem-solana.md)
- [API Endpoints](https://developers.circle.com/tokenized/usyc/web2-apis.md)
- [Transaction States and Errors](https://developers.circle.com/w3s/asynchronous-states-and-statuses.md)
- [Blockchain Confirmations](https://developers.circle.com/w3s/blockchain-confirmations.md)
- [Circle Developer Account](https://developers.circle.com/w3s/circle-developer-account.md)
- [Compliance Requirements](https://developers.circle.com/w3s/compliance-requirements.md): Learn about the compliance requirements you must adhere to.
- [Developer Account Logs](https://developers.circle.com/w3s/developer-account-logs.md)
- [Testnet Faucets](https://developers.circle.com/w3s/developer-console-faucet.md)
- [Idempotent Requests](https://developers.circle.com/w3s/idempotent-requests.md)
- [API Keys](https://developers.circle.com/w3s/keys.md): Learn about the different types of API keys used to authenticate requests to Circle's platform.
- [Manage Team Members](https://developers.circle.com/w3s/manage-team-members.md): Use the Developer Console to add, remove, and update team members
- [Postman API Suite](https://developers.circle.com/w3s/postman.md)
- [Developer Services Glossary](https://developers.circle.com/w3s/programmable-wallets-primitives.md)
- [Testnet (Sandbox) vs. Mainnet (Production)](https://developers.circle.com/w3s/sandbox-vs-production.md)
- [Chain IDs for Signing Transactions](https://developers.circle.com/w3s/sign-tx-chain-id.md)
- [Supported Blockchains](https://developers.circle.com/w3s/supported-blockchains-and-currencies.md)
- [HTTP Errors](https://developers.circle.com/w3s/synchronous-errors.md): Learn about error format and common errors encountered using the Circle platform.
- [Wallets](https://developers.circle.com/wallets.md)
- [Account Types](https://developers.circle.com/wallets/account-types.md)
- [Wallets API Rate Limits](https://developers.circle.com/wallets/api-rate-limits.md)
- [Batch Operations](https://developers.circle.com/wallets/batch-operations.md): Submit multiple user operations as a batch
- [Blockchain Infrastructure](https://developers.circle.com/wallets/blockchain-infrastructure.md)
- [Compliance Engine](https://developers.circle.com/wallets/compliance-engine.md)
- [Transaction Screening](https://developers.circle.com/wallets/compliance-engine/tx-screening.md)
- [Alert Management](https://developers.circle.com/wallets/compliance-engine/tx-screening-alert-management.md)
- [Quickstart: Assess the Risk of Wallet Addresses](https://developers.circle.com/wallets/compliance-engine/tx-screening-quickstart.md)
- [Rule Management](https://developers.circle.com/wallets/compliance-engine/tx-screening-rule-management.md)
- [Testing Guide](https://developers.circle.com/wallets/compliance-engine/tx-screening-testing.md)
- [Wallets: Dev-Controlled](https://developers.circle.com/wallets/dev-controlled.md)
- [Create Your First Developer-Controlled Wallet](https://developers.circle.com/wallets/dev-controlled/create-your-first-wallet.md): Create two developer-controlled wallets and send tokens between them.
- [Entity Secret Management](https://developers.circle.com/wallets/dev-controlled/entity-secret-management.md)
- [Onboard Users to Developer-Controlled Wallets](https://developers.circle.com/wallets/dev-controlled/onboard-users.md): Streamline user onboarding for developer-controlled wallets
- [Receive an Inbound Transfer](https://developers.circle.com/wallets/dev-controlled/receive-an-inbound-transfer.md): Initiate a currency transfer into a developer-controlled wallet you've already created.
- [Register Your Entity Secret](https://developers.circle.com/wallets/dev-controlled/register-entity-secret.md): Create an Entity Secret and register its ciphertext to enable developer-wallet features using the Circle Wallets SDK.
- [Transfer Tokens from Wallet to Wallet](https://developers.circle.com/wallets/dev-controlled/transfer-tokens-across-wallets.md): Transfer tokens across two developer-controlled wallets you've already created.
- [Gas Fees](https://developers.circle.com/wallets/gas-fees.md)
- [Gas Station](https://developers.circle.com/wallets/gas-station.md)
- [Billing for Sponsored Gas Fees](https://developers.circle.com/wallets/gas-station/billing.md)
- [Gas Station Contract Addresses](https://developers.circle.com/wallets/gas-station/contract-addresses.md)
- [Policy Management](https://developers.circle.com/wallets/gas-station/policy-management.md)
- [Send a Gasless Transaction](https://developers.circle.com/wallets/gas-station/send-a-gasless-transaction.md)
- [Solana ATA Sponsorship](https://developers.circle.com/wallets/gas-station/solana-ata-sponsorship.md)
- [Choosing your wallet type](https://developers.circle.com/wallets/infrastructure-models.md)
- [Key Management](https://developers.circle.com/wallets/key-management.md)
- [Wallets: Modular](https://developers.circle.com/wallets/modular.md)
- [Modular Wallets Android SDK](https://developers.circle.com/wallets/modular/android-sdk.md)
- [Modular Wallets Console Setup](https://developers.circle.com/wallets/modular/console-setup.md)
- [Modular Wallets Quickstart](https://developers.circle.com/wallets/modular/create-a-wallet-and-send-gasless-txn.md)
- [Dynamic Integration Tutorial](https://developers.circle.com/wallets/modular/dynamic-integration.md)
- [Modular Wallets iOS SDK](https://developers.circle.com/wallets/modular/ios-sdk.md)
- [Key Features](https://developers.circle.com/wallets/modular/key-features.md)
- [Modules](https://developers.circle.com/wallets/modular/modules.md)
- [Passkey](https://developers.circle.com/wallets/modular/passkeys.md)
- [How To Set Up Passkey Recovery](https://developers.circle.com/wallets/modular/recover-passkey.md)
- [Modular Wallets Web SDK](https://developers.circle.com/wallets/modular/web-sdk.md)
- [Monitored Tokens](https://developers.circle.com/wallets/monitored-tokens.md)
- [Sign Transactions on EVM chains](https://developers.circle.com/wallets/sign-tx-evm.md): Learn how to create EVM wallets, build transactions, and sign them with our server-side SDK.
- [Sign Transactions on NEAR](https://developers.circle.com/wallets/sign-tx-near.md): Learn how to create NEAR wallets, build transactions, and sign them with our server-side SDK.
- [Sign Transactions on Solana](https://developers.circle.com/wallets/sign-tx-solana.md): Learn how to build transactions and sign them with our server-side SDK.
- [Signing APIs](https://developers.circle.com/wallets/signing-apis.md): You can use Circle's API platform's signing APIs on blockchains where Wallets do not have full blockchain infrastructure support.
- [Supported Blockchains and APIs](https://developers.circle.com/wallets/supported-blockchains.md)
- [Transaction Rate Limits and Optimizations](https://developers.circle.com/wallets/transaction-limits-and-optimizations.md)
- [Unified Wallet Addressing on EVM Chains](https://developers.circle.com/wallets/unified-wallet-addressing-evm.md): Support same address wallets across multiple EVM chains.
- [Wallets: User-Controlled](https://developers.circle.com/wallets/user-controlled.md)
- [Android Mobile SDK](https://developers.circle.com/wallets/user-controlled/android-sdk.md): Set up the client-side Android SDK for user-controlled wallets in your mobile application.
- [Android SDK UI Customization API](https://developers.circle.com/wallets/user-controlled/android-sdk-ui-customization-api.md): Android SDK UI and key mapping reference for customizations.
- [Authentication Methods](https://developers.circle.com/wallets/user-controlled/authentication-methods.md): Authenticate your users using social login, email, or PIN
- [Confirmation UIs](https://developers.circle.com/wallets/user-controlled/confirmation-uis.md)
- [Create User Wallets with Email OTP](https://developers.circle.com/wallets/user-controlled/create-user-wallets-with-email.md)
- [Create User Wallets with PIN](https://developers.circle.com/wallets/user-controlled/create-user-wallets-with-pin.md)
- [Create User Wallets with Social Login](https://developers.circle.com/wallets/user-controlled/create-user-wallets-with-social-login.md)
- [Initiate a Signature Request](https://developers.circle.com/wallets/user-controlled/initiate-a-signature-request.md): Learn how to initiate a signature request from a user-controlled wallet with social logins or email authentication
- [iOS Mobile SDK](https://developers.circle.com/wallets/user-controlled/ios-sdk.md): Set up the client-side iOS SDK for user-controlled wallets in your mobile application.
- [iOS SDK UI Customization API](https://developers.circle.com/wallets/user-controlled/ios-sdk-ui-customization-api.md): iOS SDK UI and key mapping reference for customizations.
- [React Native Mobile SDK](https://developers.circle.com/wallets/user-controlled/react-native-sdk.md): Set up the client-side React Native SDK for user-controlled wallets in your mobile application.
- [React Native SDK UI Customization API](https://developers.circle.com/wallets/user-controlled/react-native-sdk-ui-customization-api.md): React Native SDK UI and key mapping reference for customizations.
- [Receive an Inbound Transfer](https://developers.circle.com/wallets/user-controlled/receive-inbound-transfer.md): Initiate a currency transfer into a user-controlled wallet you've already created.
- [Recover an Account](https://developers.circle.com/wallets/user-controlled/recover-account.md): Help users regain access to their accounts when they forget their PIN code.
- [Reset Account Pin Code](https://developers.circle.com/wallets/user-controlled/reset-account-pin.md): Walk a user through the steps in resetting a known account PIN code.
- [SDK Architecture for User-Controlled Wallets](https://developers.circle.com/wallets/user-controlled/sdk-architecture.md): Learn the role of SDKs in enabling User-Controlled Wallets
- [User-Controlled Wallets SDKs](https://developers.circle.com/wallets/user-controlled/sdks.md)
- [Send an Outbound Transfer or Execute Contract](https://developers.circle.com/wallets/user-controlled/send-an-outbound-transfer-or-execute-contract.md): Learn how to send USDC or execute a contract from a user-controlled wallet with social logins or email authentication
- [Send an Outbound Transfer](https://developers.circle.com/wallets/user-controlled/send-outbound-transfer.md): Learn how to send USDC from a user-controlled wallet you've already created.
- [Web SDK](https://developers.circle.com/wallets/user-controlled/web-sdk.md): Set up the client-side web SDK for user-controlled wallets in your web application.
- [Web SDK UI Customizations](https://developers.circle.com/wallets/user-controlled/web-sdk-ui-customizations.md)
- [Wallet Upgrades](https://developers.circle.com/wallets/wallet-upgrades.md)
- [Circle Wallets on Solana](https://developers.circle.com/wallets/wallets-on-solana.md): Overview for developers
- [Webhooks Logs](https://developers.circle.com/wallets/webhook-logs.md)
- [Webhooks Flows](https://developers.circle.com/wallets/webhook-notification-flows.md)
- [Webhooks Quickstart](https://developers.circle.com/wallets/webhook-notifications.md)
- [xReserve Overview](https://developers.circle.com/xreserve.md)
- [How xReserve Works](https://developers.circle.com/xreserve/concepts/how-xreserve-works.md)
- [xReserve Technical Guide](https://developers.circle.com/xreserve/concepts/technical-guide.md)
- [USDC-backed Stablecoin Reference Specification](https://developers.circle.com/xreserve/concepts/usdc-backed-stablecoin-specification.md)
- [xReserve Withdrawal Fees](https://developers.circle.com/xreserve/references/fees.md)
- [xReserve Supported Blockchains and Domains](https://developers.circle.com/xreserve/references/supported-blockchains-and-domains.md)
- [Quickstart: Deposit USDC into xReserve](https://developers.circle.com/xreserve/tutorials/deposit-usdc-into-xreserve.md): Learn how to deposit USDC into xReserve on Ethereum Sepolia.
- [Initiate a Withdrawal from xReserve as a Remote Blockchain](https://developers.circle.com/xreserve/tutorials/initiate-a-withdrawal-as-a-remote-blockchain.md)