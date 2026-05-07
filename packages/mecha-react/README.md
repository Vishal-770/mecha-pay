# mechapay-sdk

The professional, high-fidelity React SDK for the **Mecha Protocol**. Build stunning, production-ready subscription interfaces with zero-config styling and real-time blockchain synchronization.

## 🚀 Features

- **Provider Pattern**: Centralized API key management with `MechaProvider`.
- **Live Hooks**: Real-time membership tracking and feature gating with `useMecha`.
- **Zero-Config UI**: Beautiful, premium pricing tables out of the box.
- **Auto-Sync**: Real-time countdowns and membership status updates via the Mecha Indexer.
- **Deep Customization**: Full control over themes, variables, and CSS overrides.

## 📦 Installation

```bash
npm install mechapay-sdk
```

## 🛠️ Quick Start

### 1. Wrap your Application

```tsx
import { MechaProvider } from 'mechapay-sdk';

function App() {
  return (
    <MechaProvider 
      apiKey="mp_live_..." 
      portalUrl="https://mecha-pay.vercel.app"
    >
      <MyRoutes />
    </MechaProvider>
  );
}
```

### 2. Add the Pricing Table

```tsx
import { MechaPricingTable } from 'mechapay-sdk';

function PricingPage() {
  return (
    <MechaPricingTable 
      planId="0x..." 
      userId="user_123" 
    />
  );
}
```

## 🛡️ Feature Gating with `useMecha`

```tsx
import { useMecha } from 'mechapay-sdk';

function PremiumFeature() {
  const { status, remainingSeconds, loading } = useMecha(PLAN_ID, USER_ID);

  if (loading) return <div>Checking access...</div>;
  if (status !== 'ACTIVE') return <div>Access Denied</div>;

  return <div>Premium Content</div>;
}
```

## 📄 License

MIT © [Mecha Pay](https://mecha-pay.vercel.app)
