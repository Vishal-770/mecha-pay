# Mecha Pay API Reference (v1)

Welcome to the Mecha Pay Developer API. Our API allows you to programmatically interact with the Mecha Pay subscription protocol. This reference covers all public endpoints under the `/api/v1` namespace.

## Authentication

All API requests require an `x-api-key` header. You can generate and manage your keys in the **Developer Settings** section of the Mecha Pay Dashboard.

> [!IMPORTANT]
> API keys are sensitive credentials. Your production keys will always start with the `mp_live_` prefix. Never share them or commit them to version control. The protocol uses SHA-256 hashing for all key storage.

### Header Example
```http
x-api-key: mp_live_your_secret_key_here
Content-Type: application/json
```

---

## Identity & Balance

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
  "rawBalance": "83100025",
  "symbol": "USDC",
  "chainId": 5042002
}
```

---

## Subscription Plans

### List All Plans
`GET /api/v1/plans`

Returns a list of all subscription plan IDs created by the merchant associated with the API key.

#### Parameters
- `subscribedOnly` (Optional): If `true`, only returns plans that have at least one subscriber.
- `first` (Optional): Maximum number of plans to return (default: 100, max: 200).
- `skip` (Optional): Number of plans to skip for pagination (default: 0).

#### Request Example
```bash
curl -X GET "https://pay.mechapay.com/v1/plans?subscribedOnly=true&first=10" \
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

### Get Plan Details
`GET /api/v1/plans/[planId]`

Returns detailed information for a specific plan, including pricing, hydrated IPFS metadata, and currently active subscribers.

#### URL Parameters
- `planId` (Required): The bytes32 ID of the plan.

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

Returns a full list of all subscribers (active and expired) for a specific plan with granular lifecycle data.

#### Parameters
- `first` (Optional): Maximum number of subscribers to return (default: 100, max: 500).
- `skip` (Optional): Number of subscribers to skip for pagination (default: 0).

#### Request Example
```bash
curl -X GET "https://pay.mechapay.com/v1/plans/0xefdc.../subscribers?first=50" \
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
```

---

## Verifying Subscriptions

### Check Status by Metadata
`GET /api/v1/status`

The recommended way to verify access if you track users via custom IDs (e.g., database IDs) rather than wallet addresses. It checks if a specific metadata string (`buyerData`) has an active subscription to a plan.

#### Parameters
- `planId` (Required): The bytes32 ID of the subscription plan.
- `buyer` (Required): The metadata string used during the subscription process.

#### Request Example
```bash
curl -X GET "https://pay.mechapay.com/v1/status?planId=0x2d5f...&buyer=user_id_001" \
  -H "x-api-key: mp_live_..."
```

#### Response Example (Active)
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

#### Response Example (Inactive / Expired)
```json
{
  "active": false,
  "status": "not purchased",
  "buyer": "user_id_999",
  "planId": "0x2d5f..."
}
```

---

## User-Centric View

### Get User Subscriptions
`GET /api/v1/subscriptions`

Returns all active and historical subscriptions for a specific user wallet address across all plans.

#### Parameters
- `subscriber` (Required): The wallet address of the user.
- `first` (Optional): Maximum number of records to return (default: 100).
- `skip` (Optional): Number of records to skip.

#### Request Example
```bash
curl -X GET "https://pay.mechapay.com/v1/subscriptions?subscriber=0xb292..." \
  -H "x-api-key: mp_live_..."
```

#### Response Example
```json
{
  "subscriber": "0xb292...",
  "subscriptions": [
    {
      "planId": "0x2d5f...",
      "seller": "0xmerchant...",
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

### Get User Subscription for Plan
`GET /api/v1/subscriptions/[planId]`

Returns the detailed subscription state for a specific user and plan.

#### Parameters
- `subscriber` (Required): The wallet address of the user.

#### Request Example
```bash
curl -X GET "https://pay.mechapay.com/v1/subscriptions/0x2d5f...?subscriber=0xb292..." \
  -H "x-api-key: mp_live_..."
```

#### Response Example
```json
{
  "subscriber": "0xb292...",
  "planId": "0x2d5f...",
  "seller": "0xmerchant...",
  "active": true,
  "status": "ACTIVE",
  "startTime": "1774633851",
  "endTime": "1777225851",
  "remainingSeconds": 2585477,
  "totalSpent": "5000000",
  "subscriptionCount": 1,
  "updatedAt": "1774633851"
}
```

---

## Error Responses

The API uses standard HTTP status codes:

- `400 Bad Request`: Missing required headers or parameters.
- `401 Unauthorized`: Invalid or revoked API key.
- `404 Not Found`: The requested plan or resource does not exist.
- `500 Internal Error`: Protocol synchronization or server failure.

---

## Security Best Practices
- **Revocation**: If a key is compromised, revoke it immediately via the developer dashboard.
- **Environment Separation**: Use different keys for development and production environments.
- **Minimal Data**: Mecha Pay APIs return only the necessary on-chain identifiers for secure verification.
