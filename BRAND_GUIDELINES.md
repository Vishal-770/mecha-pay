# Mecha Pay - Brand & Design Guidelines

This document outlines the corporate identity, design philosophy, and visual assets for the Mecha Pay brand. It ensures absolute consistency across our core protocol, merchant dashboards, React SDK components, and customer checkouts.

---

## 1. Brand Essence & Tone

Mecha Pay is a developer-first, high-performance Web3 subscription gateway. Our visual and verbal tone must reflect this:
* **Minimalist & Cyber-Monochrome**: Clean flat outlines, dark theme focus, high contrast, zero unnecessary decoration.
* **Developer-Centric**: Premium code documentation blocks, monospaced metrics, clear system states.
* **Ultra-Secure**: Visual indicators that emphasize user self-custody and cryptographic consent.

---

## 2. Typography System

We use curated sans-serif fonts for our user-facing portals and strict monospace typography for developer logs, block details, and numeric transaction data.

| Type | Font Family | Ideal Fallbacks | Usage |
| :--- | :--- | :--- | :--- |
| **Headers & Badges** | `Outfit`, `Inter` | System-UI, Sans-Serif | Big impact values, card labels, headings. |
| **Body & Paragraphs** | `Inter`, `SF Pro Text` | Helvetica Neue, Arial | Text blocks, eligibility details, features list. |
| **Metrics & Code** | `JetBrains Mono`, `Geist Mono` | SF Mono, Lucida Console | Tx hashes, price figures, JSON blocks. |

---

## 3. Color Palette (Cyber Monochrome)

We implement a strictly high-contrast monochrome design system that transitions beautifully between dark and light environments.

### Dark Theme (Core Identity)
* **Primary / Accent**: `#ffffff` (Pure White)
* **Background Core**: `#0a0a0a` (Rich Cyber Black)
* **Card Fills**: `rgba(255, 255, 255, 0.03)` (Subtle Translucent Gray)
* **Outlines / Borders**: `rgba(255, 255, 255, 0.08)` (Subtle Gray Border)
* **Muted Typography**: `rgba(255, 255, 255, 0.40)` (Gray Text)

### Light Theme (Corporate Adaptation)
* **Primary / Accent**: `#000000` (Pure Black)
* **Background Core**: `#ffffff` (Pure White)
* **Card Fills**: `rgba(0, 0, 0, 0.02)` (Subtle Soft Gray)
* **Outlines / Borders**: `rgba(0, 0, 0, 0.08)` (Subtle Slate Border)
* **Muted Typography**: `rgba(0, 0, 0, 0.45)` (Slate Text)

---

## 4. UI / UX Motion Constraints

To maintain an elegant, high-end enterprise appearance (Clerk/Stripe quality):
* **Zero Scale Transitions**: Pricing cards and button elements must **never** scale up, scale down, tilt, or shift on the Y-axis during hover.
* **Color Transitions Only**: Animations must be restricted strictly to color transitions (`border-color`, `background-color`, `color`) using quick, ease-out timings (`0.15s ease`).

---

## 5. Circle & USDC Co-Branding Guidelines

Because Mecha Pay is built natively on top of the **Circle Programmable Wallets SDK** and **USDC Stablecoin**, we maintain clear visual rules to leverage Circle's legal trust:

### A. Settlement Disclosures
* When displaying prices, always explicitly denote settlement in **USDC**.
* **Preferred Notation**: `$10.00 / month` accompanied by a subtle `Settled in USDC` metadata label, or `$10.00 USDC` using the official Circle USDC icon.

### B. Wallet Consent Badges
* Any flow that initiates user wallet actions must carry a clear, high-fidelity security disclosure.
* **Preferred Badge**:
  ```html
  <div class="mecha-co-brand-badge">
    <Check size="11" /> Powered by Circle Developer-Controlled Wallets · Self-Custodial Encryption
  </div>
  ```

---

## 6. Logo & Icon Usage Rules

The Mecha Pay logo consists of a strict geometric icon (represented as an enclosed, sharp flat diamond or double chevron) followed by the wordmark `MECHA PAY` in uppercase, tracked-out font.

* **Clear Space**: The logo must always have at least `24px` of empty clear space on all sides.
* **Contra-indications**:
  - Never apply glowing neon gradients or shadow drop-shadows under the logo.
  - Never distort the aspect ratio or overlay complex backgrounds.
