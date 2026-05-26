# mechapay-react

The professional, high-fidelity React SDK for the **Mecha Protocol**. Build stunning, production-ready subscription interfaces with custom-tailored styling, real-time blockchain synchronization, and zero third-party animation overhead.

## 🚀 Features

- **Provider Pattern**: Centralized API key management with `MechaProvider`.
- **Live Hooks**: Real-time membership tracking with `useMecha`.
- **Perk-Gated Interfaces**: Resolve bought tier names, active features, and local expiration dates with `useMechaPerks`.
- **Smart Transitions**: Automatic Contextual upgrade/downgrade button states based on prices (no rigid plan lockouts).
- **Double-Subscription Block**: Blocks double-purchases of the same tier at the UI level.
- **Extreme Customizability**: Inject custom button labels, style custom classes (`classNames`), and replace rendering completely using custom slot renderers (`renderHeader`, `renderFooter`, `renderTierButton`).
- **Performance First**: Zero dependencies on heavy libraries like `framer-motion`. Built entirely using native, high-performance CSS hardware transitions.

## 📦 Installation

```bash
npm install mechapay-react
```

## 🛠️ Quick Start

### 1. Wrap your Application

```tsx
import { MechaProvider } from 'mechapay-react';

function App() {
  return (
    <MechaProvider apiKey="mp_live_your_api_key_here">
      <MyRoutes />
    </MechaProvider>
  );
}
```

### 2. Add the Pricing Table

```tsx
import { MechaPricingTable } from 'mechapay-react';

function PricingPage() {
  return (
    <MechaPricingTable 
      planId="0x..." 
      userId="user_123" 
      appearance={{
        theme: "dark",
        variables: {
          colorPrimary: "#00FFC2",
          borderRadius: "24px"
        }
      }}
    />
  );
}
```

---

## 🛡️ Hooks & Feature Gating

### `useMecha` (Active Status & Countdown)

The primary hook to inspect the overall membership status, remaining time, and list of all active/bought tier IDs.

```tsx
import { useMecha } from 'mechapay-react';

function PremiumFeature() {
  const { status, remainingSeconds, tierIds, loading } = useMecha(PLAN_ID, USER_ID);

  if (loading) return <div>Syncing status...</div>;
  if (status !== 'ACTIVE') return <div>Access Denied</div>;

  return (
    <div>
      <p>Premium Content Unlocked!</p>
      <p>Access ends in {Math.floor(remainingSeconds / 3600)} hours.</p>
    </div>
  );
}
```

### `useMechaPerks` (Subscribed Perks & Features)

Fetches active plan details, listing subscribed tiers, their respective features, and custom expiration dates. 

```tsx
import { useMechaPerks } from 'mechapay-react';

function ActiveUserPerks() {
  const { perks, loading } = useMechaPerks(PLAN_ID, USER_ID);

  if (loading) return <div>Syncing perks...</div>;
  if (!perks) return <div>No active plans or perks.</div>;

  return (
    <div>
      <h3>Your Active Subscriptions & Perks</h3>
      {perks.map((subbedTier) => (
        <div key={subbedTier.tierId} style={{ marginTop: '16px' }}>
          <h4>{subbedTier.tierName} (Expires: {subbedTier.expiryDate.toLocaleDateString()})</h4>
          <ul>
            {subbedTier.features.map((feat, idx) => (
              <li key={idx}>
                <strong>{feat.title}</strong>: {feat.description}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎨 Advanced Customization

### 1. Custom Labels (`customLabels`)

Override the default CTA texts easily:

```tsx
<MechaPricingTable 
  planId="0x..." 
  userId="user_123"
  customLabels={{
    activeSubscription: "Current active tier",
    upgrade: "Level Up",
    downgrade: "Downgrade Plan",
    getTier: "Join {{tierLabel}}"
  }}
/>
```

### 2. Style Custom Class Overrides (`classNames`)

Map your own tailwind classes or custom stylesheets to specific components inside the pricing table:

```tsx
<MechaPricingTable 
  planId="0x..." 
  userId="user_123"
  classNames={{
    card: "border-2 border-slate-700 bg-slate-900 rounded-3xl",
    button: "bg-emerald-500 text-slate-950 font-bold hover:scale-105"
  }}
/>
```

### 3. Slot Renderers (`renderHeader`, `renderFooter`, `renderTierButton`)

Replace specific sections of the layout completely while preserving internal loading states and purchase mechanics.

```tsx
<MechaPricingTable 
  planId="0x..." 
  userId="user_123"
  renderTierButton={(tier, state, handleSelect) => (
    <button 
      onClick={handleSelect}
      disabled={state.isDisabled}
      className={`btn-${state.isUpgrade ? 'upgrade' : 'purchase'}`}
    >
      {state.label}
    </button>
  )}
/>
```

---

## 📄 License

MIT © [Mecha Pay](https://mecha-pay.vercel.app)
