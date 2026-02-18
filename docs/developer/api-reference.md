# Mecha Pay API Reference

Welcome to the Mecha Pay Developer API. Our API allows you to programmatically interact with the Mecha Pay subscription protocol.

## Authentication

All API requests require an `x-api-key` header. You can generate and manage your keys in the **Developer Settings** section of the Mecha Pay Dashboard.

> [!IMPORTANT]
> API keys are sensitive credentials. Never share them or commit them to version control. The protocol uses SHA-256 hashing for all key storage.

### Header Example
```http
x-api-key: mp_live_your_secret_key_here
Content-Type: application/json
```

---

## Endpoints

### Get Subscriber Plans
`GET /api/v1/plans`

Returns a list of all subscription plan IDs created by the merchant associated with the API key.

#### Parameters
- `first` (Optional): Maximum number of plans to return (default: 100, max: 200).
- `skip` (Optional): Number of plans to skip for pagination (default: 0).

#### Request Example
```bash
curl -X GET "https://pay.mechapay.com/v1/plans?first=10" \
  -H "x-api-key: mp_live_..."
```

#### Response Example (200 OK)
```json
{
  "planIds": [
    "0xefdc314440031ea0c647d84e9e67369bde2f5fb146e72f5d1b1af9e8990c1b27",
    "0x067441658a971f7da943b7f5e07a0e337e7ab9b961e8fe362f24bcc503228c3d0"
  ]
}
```

### Get Plan Detail
`GET /api/v1/plans/[planId]`

Returns detailed information for a specific plan, including pricing and hydrated metadata.

#### Request Example
```bash
curl -X GET "https://pay.mechapay.com/v1/plans/0xefdc..." \
  -H "x-api-key: mp_live_..."
```

#### Response Example (200 OK)
```json
{
  "planId": "0xefdc...",
  "price": "5000000",
  "duration": "2592000",
  "metadata": {
    "name": "Pro Merchant",
    "description": "Premium subscription plan",
    "features": [
      { "title": "Analytics", "description": "Full dashboard access" }
    ]
  },
  "activeSubscribers": [
    {
      "address": "0xb292...",
      "expiresAt": "1777186671",
      "active": true
    }
  ]
}
```

### Get Plan Subscribers
`GET /api/v1/plans/[planId]/subscribers`

Returns a list of all active and historical subscribers for a specific plan.

#### Parameters
- `first` (Optional): Maximum number of subscribers to return (default: 100, max: 500).
- `skip` (Optional): Number of subscribers to skip for pagination (default: 0).

#### Request Example
```bash
curl -X GET "https://pay.mechapay.com/v1/plans/0xefdc.../subscribers" \
  -H "x-api-key: mp_live_..."
```

#### Response Example (200 OK)
```json
{
  "planId": "0xefdc...",
  "subscribers": [
    {
      "address": "0xb292...",
      "status": "ACTIVE",
      "totalSpent": "5000000",
      "subscriptionCount": 1,
      "startTime": "1774594671",
      "endTime": "1777186671",
      "metadata": "user_id_001",
      "updatedAt": "1774594671"
    }
  ],
  "count": 1
}

---

## Identity

### Get Merchant Identity
`GET /api/v1/me`

Returns the merchant's wallet address associated with the provided API key.

#### Request Example
```bash
curl -X GET "https://pay.mechapay.com/v1/me" \
  -H "x-api-key: mp_live_..."
```

#### Response Example (200 OK)
```json
{
  "walletAddress": "0xb292..."
}
```

### Get Merchant Balance
`GET /api/v1/balance`

Returns the real-time USDC balance of the merchant wallet on the Arc Testnet.

#### Request Example
```bash
curl -X GET "https://pay.mechapay.com/v1/balance" \
  -H "x-api-key: mp_live_..."
```

#### Response Example (200 OK)
```json
{
  "walletAddress": "0xb292...",
  "balance": "83.100025",
  "symbol": "USDC",
  "chainId": 5042002
}
```

---

## Subscription Plans

### Get All User Subscriptions
`GET /api/v1/subscriptions`

Returns a list of all active and historical subscriptions for a specific wallet address.

#### Parameters
- `subscriber` (Required): The wallet address of the user.
- `first` (Optional): Maximum number of records to return (default: 100, max: 500).
- `skip` (Optional): Number of records to skip for pagination (default: 0).

#### Request Example
```bash
curl -X GET "https://pay.mechapay.com/v1/subscriptions?subscriber=0xb292..." \
  -H "x-api-key: mp_live_..."
```

#### Response Example (200 OK)
```json
{
  "subscriber": "0xb292...",
  "subscriptions": [
    {
      "planId": "0x2d5f...",
      "seller": "0x...",
      "status": "ACTIVE",
      "startTime": "1774633851",
      "endTime": "1777225851",
      "remainingSeconds": 2585477,
      "totalSpent": "5000000",
      "subscriptionCount": 1,
      "updatedAt": "1774633851"
    }
  ],
  "count": 1
}
```

### Get Specific Subscription Detail
`GET /api/v1/subscriptions/[planId]`

Returns the detailed subscription state for a specific user and plan using their wallet address.

#### Parameters
- `subscriber` (Required): The wallet address of the user.

#### Request Example
```bash
curl -X GET "https://pay.mechapay.com/v1/subscriptions/0x2d5f...?subscriber=0xb292..." \
  -H "x-api-key: mp_live_..."
```

#### Response Example (200 OK)
```json
{
  "subscriber": "0xb292...",
  "planId": "0x2d5f...",
  "active": true,
  "status": "ACTIVE",
  "remainingSeconds": 2585477,
  "totalSpent": "5000000"
}
```

### Check Subscription Status by Metadata
`GET /api/v1/status`

Returns the subscription state for a specific plan and buyer metadata string (`buyerData`). This is the recommended way to verify access if you track users via custom IDs rather than wallet addresses.

#### Parameters
- `planId` (Required): The bytes32 ID of the subscription plan.
- `buyer` (Required): The metadata string used during the subscription process.

#### Request Example
```bash
curl -X GET "https://pay.mechapay.com/v1/status?planId=0x2d5f...&buyer=user_id_001" \
  -H "x-api-key: mp_live_..."
```

#### Response Example (200 OK - Active)
```json
{
  "active": true,
  "status": "ACTIVE",
  "buyer": "user_id_001",
  "planId": "0x2d5f...",
  "subscriber": "0xb292...",
  "remainingTime": 2585477
}
```

#### Response Example (200 OK - Not Purchased)
```json
{
  "active": false,
  "status": "not purchased",
  "buyer": "user_id_999",
  "planId": "0x2d5f..."
}
```

#### Error Responses
- `400 Bad Request`: Missing header or parameters.
- `401 Unauthorized`: Invalid or revoked API key.
- `404 Not Found`: Plan or Subscriber not found.
- `500 Internal Error`: Protocol synchronization failure.

---

## Security Best Practices
- **Revocation**: If a key is compromised, revoke it immediately via the dashboard.
- **Environment Separation**: Use different keys for development and production environments.
- **Minimal Data**: Mecha Pay APIs follow a minimal data principle, returning only the necessary identifiers for on-chain verification.
