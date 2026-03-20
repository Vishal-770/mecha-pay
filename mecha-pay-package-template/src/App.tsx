import type { CSSProperties } from "react";
import "./App.css";
import PricingTable from "mecha-pay";

type PricingTableCustomStyles = {
  cardGradientStart?: string;
  cardGradientEnd?: string;
  cardBorder?: string;
  buttonBackground?: string;
  buttonText?: string;
  buttonHoverBackground?: string;
  containerMaxWidth?: string;
};

function toThemeVars(customStyles: PricingTableCustomStyles): CSSProperties {
  return {
    "--mp-card-gradient-start": customStyles.cardGradientStart ?? "#667eea",
    "--mp-card-gradient-end": customStyles.cardGradientEnd ?? "#764ba2",
    "--mp-card-border": customStyles.cardBorder ?? "transparent",
    "--mp-button-bg": customStyles.buttonBackground ?? "#ffffff",
    "--mp-button-text": customStyles.buttonText ?? "#667eea",
    "--mp-button-hover-bg": customStyles.buttonHoverBackground ?? "#f7f7f7",
    "--mp-container-max-width": customStyles.containerMaxWidth ?? "1200px",
  } as CSSProperties;
}

function App() {
  const apiKey = import.meta.env.VITE_API_KEY!;
  const userId = "user_1234567890";
  const planId =
    "0xacbc49f2fef52733cf471aae1be8efd557851c6c0fff0dcba81327cc84b46646";

  const customStyles: PricingTableCustomStyles = {
    cardGradientStart: "#0f172a",
    cardGradientEnd: "#1d4ed8",
    cardBorder: "rgba(147, 197, 253, 0.35)",
    buttonBackground: "#f8fafc",
    buttonText: "#1d4ed8",
    buttonHoverBackground: "#e2e8f0",
    containerMaxWidth: "980px",
  };

  return (
    <main className="app-shell">
      <div className="pricing-theme" style={toThemeVars(customStyles)}>
        <PricingTable apiKey={apiKey} userId={userId} planId={planId} />
      </div>
    </main>
  );
}

export default App;
