# Mecha-Pay Pricing Table

A beautiful, responsive React component for displaying Mecha-Pay pricing plans. **TypeScript supported!**

## Installation

```bash
npm install mecha-pay
```

## Usage

Simply provide three required props: `apiKey`, `planId`, and `userId`. That's it!

```jsx
import React from 'react';
import { PricingTable } from 'mecha-pay';

const App = () => {
  const userId = "user_12345"; // Get from your auth system

  return (
    <PricingTable 
      apiKey="mp_live_your_api_key_here"
      planId="0xefdc..."
      userId={userId}
    />
  );
};

export default App;
```

### TypeScript

```tsx
import React from 'react';
import { PricingTable } from 'mecha-pay';

const App: React.FC = () => {
  const userId = "user_12345";

  return (
    <PricingTable 
      apiKey="mp_live_your_api_key_here"
      planId="0xefdc..."
      userId={userId}
    />
  );
};

export default App;
```

### With Error Handling

```jsx
<PricingTable 
  apiKey="mp_live_your_api_key_here"
  planId="0xefdc..."
  userId={userId}
  onError={(error) => {
    console.error('Failed to load plan:', error);
    // Handle error (e.g., show notification)
  }}
/>
```

### Next.js Example

```jsx
import { PricingTable } from 'mecha-pay';
import { useUser } from '@/hooks/useAuth';

export default function PricingPage() {
  const { userId } = useUser();

  return (
    <PricingTable 
      apiKey={process.env.NEXT_PUBLIC_MECHAPAY_API_KEY}
      planId="0xefdc..."
      userId={userId}
    />
  );
}
```

### TypeScript

```tsx
import React from 'react';
import { PricingTable } from 'mecha-pay';

const App: React.FC = () => {
  return (
    <PricingTable 
      apiKey="mp_live_your_api_key_here"
      onError={(error) => console.error(error)}
    />
  );
};
```

## How It Works

1. **Provide 3 Required Props:**
   - `apiKey` - Your Mecha-Pay API key
   - `planId` - The plan ID to display
   - `userId` - Current user's ID

2. **Component Automatically:**
   - Fetches plan details from `http://localhost:3000/api/v1/plans/{planId}`
   - Displays pricing card with features
   - Generates payment link: `http://localhost:3000/pay/{planId}?userId={userId}&successUrl={currentURL}`

3. **User Clicks "Subscribe Now":**
   - Redirected to: `http://localhost:3000/pay/0xefdc...?userId=user_12345&successUrl=https://yoursite.com`

## API

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| apiKey | `string` | Your Mecha-Pay API key (e.g., `"mp_live_..."`) |
| planId | `string` | The plan ID to fetch (e.g., `"0xefdc..."`) |
| userId | `string` | User ID for payment link generation |

### Optional Props

| Prop | Type | Description |
|------|------|-------------|
| onError | `(error: Error) => void` | Error callback function |

## TypeScript Types

```typescript
interface Feature {
  title: string;
  description?: string;
}

interface PlanMetadata {
  name: string;
  description: string;
  features: Feature[];
}

interface Plan {
  planId: string;
  price: string;
  duration: string;
  metadata: PlanMetadata;
  // activeSubscribers is returned by API but not used by component
}
```

## API Response Structure

The component fetches from `http://localhost:3000/api/v1/plans/{planId}` with response:

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
  "activeSubscribers": [...] // Ignored by component
}
```

## Features

- 🎨 Beautiful gradient design
- 📱 Fully responsive
- ⚡ **Zero configuration** - just 3 props!
- 🔄 Automatic loading and error states
- 🔗 Auto-generated payment links to `localhost:3000`
- 💎 **TypeScript support** with full type definitions
- ⚙️ **Next.js compatible**
- ♿ Accessible
- 🎯 Easy to customize

## Customization

The component uses CSS modules that can be overridden. Import your custom styles after the component:

```jsx
import { PricingTable } from 'mecha-pay';
import './my-custom-styles.css';
```

## License

ISC
