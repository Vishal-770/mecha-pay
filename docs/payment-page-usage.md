# Payment Page Usage Guide

## Overview
The standalone payment page allows sellers to accept USDC subscriptions. Users MUST login with Circle wallet to make payments. Privy wallet is only used for bridging USDC from other chains.

## URL Structure

```
https://your-domain.com/pay/[planId]?userId=[sellerId]&successUrl=[returnUrl]
```

### Required Parameters:
- `planId` - bytes32 hex format (0x + 64 hex chars) - The subscription plan ID from your smart contract
- `userId` - Seller's user identifier (alphanumeric, underscore, hyphen, max 100 chars)

### Optional Parameters:
- `successUrl` - URL to redirect after successful payment (must be https/http)

## Example URLs

```
/pay/0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890?userId=user_mongo_507f1f77bcf86cd799439011&successUrl=https://myapp.com/thanks

/pay/0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e?userId=pg_user_12345&successUrl=https://example.com/success
```

## User Flow

1. **Landing** - User clicks payment link, sees plan details immediately (no login required)
2. **Login Required** - Click "Continue with Circle Wallet" to login (Google OAuth)
3. **Check Balance** - View USDC balance in Circle wallet
4. **Bridge (Optional)** - If insufficient balance:
   - Click "Bridge USDC" 
   - Connect Privy EOA wallet (MetaMask, WalletConnect, etc.)
   - Bridge USDC from another chain to Circle wallet address
   - Return to payment page and refresh
5. **Payment** - Approve USDC spending (if needed) → Subscribe
6. **Success** - View transaction hash, auto-redirect to seller's website

## Wallet Usage

### Circle Wallet (Required for Payment)
- **Purpose:** Authentication & Payment processing
- **Login:** Google OAuth
- **Used for:** 
  - Viewing the payment page (after seeing plan details)
  - Holding USDC balance
  - Approving USDC spending
  - Executing subscription payment

### Privy Wallet (Optional - For Bridging Only)
- **Purpose:** Bridging USDC from other chains to Circle wallet
- **Login:** MetaMask, WalletConnect, or embedded wallet
- **Used for:**
  - Connecting EOA wallet with USDC on another chain
  - Bridging USDC to Circle wallet address
  - **NOT used for payment** - only for funding Circle wallet

## For Sellers

### How userId Works:
- The `userId` you pass is stored in the smart contract's `buyerData` field as JSON
- Your backend can listen to `Subscribed` events and extract the userId
- Match the userId to your database to activate the user's subscription

### Event Structure:
```solidity
event Subscribed(
    bytes32 indexed planId,
    address indexed buyer,
    uint256 indexed subscriptionId,
    string buyerData  // Contains: {"userId": "your_user_id"}
);
```

### Example Backend Listener:
```javascript
contract.on("Subscribed", (planId, buyer, subscriptionId, buyerData) => {
  const data = JSON.parse(buyerData);
  const userId = data.userId;
  
  // Activate subscription in your database
  await db.users.update({ id: userId }, { subscribed: true });
});
```

## Security Features

- ✅ Query parameter validation (planId format, userId format, successUrl domain)
- ✅ CSRF protection on API routes
- ✅ No localhost/private IP redirects in production
- ✅ Circle SDK PIN/security verification for transactions
- ✅ Smart contract validation (plan exists, is active)
- ✅ Only Circle wallet can execute payments

## Features

- ✅ View plan details without login
- ✅ Circle wallet required for payment
- ✅ Privy wallet for optional USDC bridging
- ✅ USDC bridging from 15+ chains via EOA
- ✅ Mobile responsive
- ✅ Success page with auto-redirect
- ✅ Transaction status tracking
- ✅ Error handling with retry
- ✅ Loading states and skeletons
- ✅ Insufficient balance detection with bridge prompt

## Network

Currently supports **Arc Testnet** (Chain ID: 5042002)
- USDC Address: `0x3600000000000000000000000000000000000000`
- Gateway Address: `0x2BC2f391fca4144f708eEa918d94348684Bdb544`

## Payment Flow Details

1. **Plan Display:** Users see plan details, pricing, and features immediately
2. **Authentication Gate:** "Continue with Circle Wallet" button appears below plan
3. **Balance Check:** After login, shows USDC balance in Circle wallet
4. **Bridge Option:** If balance < plan price, shows "Bridge USDC" button
5. **Bridging Process:**
   - Opens bridge modal
   - User connects Privy EOA wallet
   - Shows Circle wallet address as destination
   - User bridges USDC from EOA → Circle wallet
   - Returns to payment page and refreshes
6. **Payment Execution:** Subscribe button processes payment via Circle wallet only

## Testing

Build test passed ✅ - TypeScript compilation successful with corrected flow.

Route available: `/pay/[planId]` (Dynamic, server-rendered on demand)
