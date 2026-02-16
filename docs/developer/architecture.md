# Security Architecture: API Key Management

Mecha Pay utilizes a robust, production-grade security architecture for managing merchant credentials and enabling programmatic protocol access.

## Hashing Strategy

The system prioritizes credential security, ensuring that raw API keys are never stored in plain text.

1.  **Generation**: High-entropy keys are generated via `crypto.randomBytes(24)`, providing 192 bits of security.
2.  **Display**: Raw keys are shown to the merchant **exactly once** upon creation. 
3.  **Hashed Storage**: The system stores only a **SHA-256 hash** of the key. When an API request is received, the incoming key is hashed and compared to the database record.

## Identity Resolution

Mecha Pay bridges complex identity models to provide a seamless developer experience:

-   **Circle Identity**: Merchants are identified via their Circle User ID (UUID).
-   **On-Chain Identity**: Plan data is retrieved from the blockchain indexer using Wallet Addresses (0x...).
-   **The Bridge**: When an API key is generated, the merchant's **active wallet address** is captured and pinned to the key's record. This allows the public API to correctly resolve on-chain data using only the off-chain API key.

## Data Schema (MongoDB)

The `api_keys` collection follows this secure schema:

| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | String | Circle Internal UUID |
| `merchantAddress`| String | Associated Blockchain Wallet Address |
| `name` | String | User-defined label for the key |
| `keyHash` | String | SHA-256 representation of the secret |
| `prefix` | String | First 8 characters (for UI identification) |
| `mask` | String | Last 4 characters (for UI identification) |
| `revokedAt` | Date | Timestamp of key invalidation (null if active) |

## Best Practices for Developers

-   **Rotation**: Periodically rotate keys by generating a new one and revoking the old one.
-   **Minimalism**: Only generate keys for the specific environments that require them.
-   **Automation**: Use the API key system to automate subscription verification for your own decentralized applications.
