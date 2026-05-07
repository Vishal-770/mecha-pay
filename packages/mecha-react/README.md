# @mecha-pay/sdk-react

The official React SDK for **Mecha Pay**, the high-performance subscription protocol built on Circle and Arc Testnet.

## Installation

```bash
npm install @mecha-pay/sdk-react
# or
pnpm add @mecha-pay/sdk-react
```

## Features

- **Clerk-Level Quality**: High-fidelity, engineering-grade pricing table with professional aesthetics.
- **Premium Animations**: Powered by `framer-motion` for smooth, responsive transitions and entry effects.
- **Deep Customization**: Use the `appearance` prop to match your brand exactly—override colors, fonts, and CSS classes.
- **Protocol Native**: Directly connects to Mecha's on-chain plans and IPFS metadata.
- **Intelligent Highlighting**: Automatically identifies and scales "Recommended" tiers (e.g. Pro, Plus).

## Quick Start

```tsx
import { MechaPricingTable } from "@mecha-pay/sdk-react";

export default function Pricing() {
  return (
    <MechaPricingTable
      planId="0xb074b082..." 
      userId="user_123"
      theme="dark"
      appearance={{
        variables: {
          colorPrimary: "#00D1FF",
          borderRadius: "2rem",
        },
        elements: {
          button: "hover:scale-105 transition-transform",
          card: "backdrop-blur-md bg-white/5",
        }
      }}
    />
  );
}
```

## Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `planId` | `string` | **Required**. The Mecha Protocol Plan ID. |
| `userId` | `string` | Optional. Your internal user ID to link the payment. |
| `appearance`| `MechaAppearance`| Optional. Deep styling overrides for elements and variables. |
| `portalUrl` | `string` | Optional. The URL of the Mecha Payment Portal. |
| `theme` | `'light' \| 'dark'`| Optional. The visual theme (default: `dark`). |

### Appearance Object

```tsx
interface MechaAppearance {
  variables?: {
    colorPrimary?: string;
    borderRadius?: string;
    fontFamily?: string;
  };
  elements?: {
    card?: string;
    cardActive?: string;
    button?: string;
    title?: string;
    // ... and more
  };
}
```

## Requirements

This SDK uses Tailwind CSS utility classes. Ensure your project has Tailwind CSS installed and the Mecha colors configured in your `tailwind.config.js`.

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00D1FF", // Mecha Neon Blue
          foreground: "#000000",
        },
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
      },
    },
  },
};
```

## License

MIT © [Mecha Protocol](https://mecha.xyz)
