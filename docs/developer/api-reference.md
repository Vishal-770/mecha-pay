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
  }
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
```

#### Error Responses
- `400 Bad Request`: Missing header or invalid parameters.
- `401 Unauthorized`: Invalid or revoked API key.
- `500 Internal Error`: Protocol synchronization failure.

---

## Security Best Practices
- **Revocation**: If a key is compromised, revoke it immediately via the dashboard.
- **Environment Separation**: Use different keys for development and production environments.
- **Minimal Data**: Mecha Pay APIs follow a minimal data principle, returning only the necessary identifiers for on-chain verification.
