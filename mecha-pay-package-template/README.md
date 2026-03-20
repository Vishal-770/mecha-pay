This is an example project showing how to use the `mecha-pay` package in a React app and pass custom styles to the pricing table.

# Getting Started
1. Clone the repository
2. Install dependencies
```bash
npm install
```
3. Create a .env file in the root of the project and add your mecha-pay api key. You can find it in the settings tab of your mecha-pay dashboard. It should start with mp_live_ or mp_test_
```bash
VITE_API_KEY=mp_live_b.........
```
4. Start the development server
```bash
npm run dev
```

## Custom Styles

The template uses a style-wrapper pattern so you can pass a `customStyles` object in `src/App.tsx` and theme the pricing table without editing package source.

Available style keys:
- `cardGradientStart`
- `cardGradientEnd`
- `cardBorder`
- `buttonBackground`
- `buttonText`
- `buttonHoverBackground`
- `containerMaxWidth`

Example (already wired in `src/App.tsx`):

```ts
const customStyles = {
	cardGradientStart: "#0f172a",
	cardGradientEnd: "#1d4ed8",
	cardBorder: "rgba(147, 197, 253, 0.35)",
	buttonBackground: "#f8fafc",
	buttonText: "#1d4ed8",
	buttonHoverBackground: "#e2e8f0",
	containerMaxWidth: "980px",
};
```
