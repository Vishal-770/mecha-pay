import { useState } from "react";
import { MechaProvider, MechaPricingTable, useMecha, useMechaPerks } from "mechapay-react";
import { ShieldCheck, Cpu, Code, Check, ArrowRight } from "lucide-react";

const PLAN_ID = "0xb074b0822015c916dd232e7f6e7cfd051ecfde5628a14cdb8b2f4050e40a6d1c";
const USER_ID = "visha_test_user_001";

// ── Format Helper for remaining time ──
function formatExpiryDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// ── Showcase Component: Professional Slate Active Plan HUD ──
function ActivePlanCard() {
  const { status, remainingSeconds, loading } = useMecha(PLAN_ID, USER_ID);
  const { perks } = useMechaPerks(PLAN_ID, USER_ID);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "20px", borderRadius: "4px", backgroundColor: "#18181b", border: "1px solid #27272a" }}>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#a1a1aa" }} />
        <span style={{ fontSize: "13px", color: "#a1a1aa", fontWeight: 500 }}>Syncing subscription details...</span>
      </div>
    );
  }

  const isActive = status === "ACTIVE" && remainingSeconds > 0;
  const activeTier = perks && perks.length > 0 ? perks[0] : null;

  return (
    <div style={{ 
      backgroundColor: "#18181b",
      border: "1px solid #27272a",
      borderRadius: "6px",
      padding: "24px"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: "1px" }}>Current Access Plan</span>
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#f4f4f5", margin: "4px 0 0 0" }}>
            {activeTier ? activeTier.tierName : "No Active Subscription"}
          </h3>
        </div>
        <div style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "6px", 
          backgroundColor: isActive ? "#18181b" : "transparent", 
          border: `1px solid ${isActive ? "#ffffff" : "#27272a"}`,
          color: isActive ? "#ffffff" : "#71717a",
          padding: "4px 10px", 
          borderRadius: "4px", 
          fontSize: "10px", 
          fontWeight: 700, 
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          {isActive ? "Active" : "None"}
        </div>
      </div>

      {isActive && activeTier && (
        <div style={{ borderTop: "1px solid #27272a", paddingTop: "16px", marginTop: "16px" }}>
          <div style={{ fontSize: "12px", color: "#a1a1aa", marginBottom: "12px" }}>
            Expires: <strong style={{ color: "#e4e4e7" }}>{formatExpiryDate(activeTier.expiryDate)}</strong>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.5px" }}>Unlocked Benefits:</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {activeTier.features.map((feat, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: "#d4d4d8", lineHeight: "1.4" }}>
                  <Check size={12} style={{ marginTop: "3px", color: "#a1a1aa", flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: "#ffffff" }}>{feat.title}</strong>: <span style={{ color: "#a1a1aa" }}>{feat.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page Layout ──
function App() {
  const [activeTab, setActiveTab] = useState<"mecha" | "perks">("perks");

  const subscriptionState = useMecha(PLAN_ID, USER_ID);
  const perksState = useMechaPerks(PLAN_ID, USER_ID);

  const cleanAppearance = {
    theme: "dark" as const,
    variables: {
      colorPrimary: "#ffffff",
      borderRadius: "4px",
      cardPadding: "32px",
      gap: "24px",
      backgroundColor: "#18181b",
      textColor: "#f4f4f5"
    }
  };

  // Modern, clean, minimal slot renderers
  const customRenderHeader = (plan: any) => (
    <div style={{ textAlign: "left", marginBottom: "32px" }}>
      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#f4f4f5", margin: "0 0 8px 0", letterSpacing: "-0.5px" }}>
        {plan.name && !plan.name.startsWith("0x") ? plan.name : "Protocol Memberships"}
      </h2>
      <p style={{ color: "#71717a", fontSize: "13px", margin: 0, fontWeight: 500 }}>
        Select a membership to subscribe to the protocol. Rates are resolved via smart contract calculations.
      </p>
    </div>
  );

  const customRenderFooter = () => (
    <div style={{ 
      marginTop: "32px", 
      paddingTop: "24px",
      borderTop: "1px solid #27272a", 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center"
    }}>
      <p style={{ fontSize: "11px", color: "#71717a", margin: 0, display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
        <ShieldCheck size={13} style={{ color: "#a1a1aa" }} /> SECURE DECENTRALIZED PROTOCOL CHANNEL
      </p>
      <p style={{ fontSize: "10px", color: "#52525b", margin: 0, fontWeight: 600 }}>
        MECHA PAY · VERIFIED
      </p>
    </div>
  );

  const customRenderButton = (_tier: any, state: any, handleSelect: any) => {
    const isThisActive = state.isCurrent;
    return (
      <button
        onClick={() => !isThisActive && handleSelect()}
        disabled={isThisActive}
        style={{
          marginTop: "32px",
          width: "100%",
          height: "44px",
          borderRadius: "4px",
          border: isThisActive ? "1px solid #27272a" : "none",
          background: isThisActive 
            ? "transparent" 
            : "#ffffff",
          color: isThisActive ? "#a1a1aa" : "#09090b",
          fontWeight: 700,
          fontSize: "12px",
          cursor: isThisActive ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "background 0.15s ease, opacity 0.15s ease"
        }}
      >
        <span>{state.label}</span>
        {isThisActive ? <Check size={13} style={{ strokeWidth: 3 }} /> : <ArrowRight size={13} style={{ strokeWidth: 3 }} />}
      </button>
    );
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#09090b", 
      color: "#f4f4f5", 
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      padding: "60px 40px"
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .code-block-editor {
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          font-size: 11px;
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 4px;
          padding: 16px;
          overflow-x: auto;
          color: #d4d4d8;
          line-height: 1.6;
        }
        .hud-tab-btn {
          background: transparent;
          border: none;
          color: #71717a;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 8px 16px;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.15s ease;
        }
        .hud-tab-btn.active {
          color: #ffffff;
          border-bottom-color: #ffffff;
        }
      `}} />

      {/* ── Main Clean Workspace ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header Segment */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #27272a", paddingBottom: "24px", marginBottom: "40px" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "#f4f4f5" }}>Billing & Subscriptions</h1>
            <p style={{ fontSize: "13px", color: "#71717a", margin: "4px 0 0 0", fontWeight: 400 }}>
              Verify integration endpoints, inspect hooks, and manage pricing layout presets in this console.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: "1px" }}>
            <Cpu size={14} style={{ color: "#d4d4d8" }} /> SDK Environment: Local Dev
          </div>
        </div>

        {/* Section 1: Full-width Pricing Table */}
        <div style={{ marginBottom: "60px" }}>
          <div style={{ 
            backgroundColor: "#09090b",
            border: "1px solid #27272a",
            borderRadius: "6px",
            padding: "32px",
            minHeight: "500px"
          }}>
            <MechaPricingTable 
              planId={PLAN_ID}
              userId={USER_ID}
              recommendedTierId="1"
              appearance={cleanAppearance}
              customLabels={{
                activeSubscription: "Purchased Member",
                upgrade: "Level Up",
                downgrade: "Downgrade Plan",
                getTier: "Join {{tierLabel}}",
                selectPlanDescription: "Choose a plan to configure your access tier."
              }}
              renderHeader={customRenderHeader}
              renderFooter={customRenderFooter}
              renderTierButton={customRenderButton}
            />
          </div>
        </div>

        {/* Section 2: Hooks & Live Metadata Feed */}
        <div>
          <div style={{ marginBottom: "20px", borderBottom: "1px solid #27272a", paddingBottom: "16px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#f4f4f5", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>Hooks & Metadata Engine</h2>
            <p style={{ fontSize: "13px", color: "#71717a", margin: "4px 0 0 0" }}>
              Live resolved state feeds and active benefits computed from smart contract queries.
            </p>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "24px",
            alignItems: "start"
          }}>
            {/* Box 1: Active Subscription HUD */}
            <ActivePlanCard />

            {/* Box 2: Hook Inspector */}
            <div style={{ 
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "6px",
              padding: "24px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #27272a", paddingBottom: "12px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Code size={13} style={{ color: "#71717a" }} />
                  <h3 style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#a1a1aa", margin: 0 }}>API Metadata Live Feed</h3>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button 
                    onClick={() => setActiveTab("mecha")} 
                    className={`hud-tab-btn ${activeTab === "mecha" ? "active" : ""}`}
                  >
                    useMecha()
                  </button>
                  <button 
                    onClick={() => setActiveTab("perks")} 
                    className={`hud-tab-btn ${activeTab === "perks" ? "active" : ""}`}
                  >
                    useMechaPerks()
                  </button>
                </div>
              </div>

              {activeTab === "mecha" ? (
                <div>
                  <p style={{ fontSize: "12px", color: "#71717a", marginTop: 0, marginBottom: "12px", lineHeight: "1.4" }}>
                    Status metadata returned directly from subscription queries.
                  </p>
                  <pre className="code-block-editor">
{`${JSON.stringify({
  status: subscriptionState.status,
  remainingSeconds: subscriptionState.remainingSeconds,
  tierIds: subscriptionState.tierIds,
  loading: subscriptionState.loading,
  error: subscriptionState.error
}, null, 2)}`}
                  </pre>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: "12px", color: "#71717a", marginTop: 0, marginBottom: "12px", lineHeight: "1.4" }}>
                    Full active subscribed tier details, resolved features lists, and computed expiration dates.
                  </p>
                  <pre className="code-block-editor">
{`${JSON.stringify({
  loading: perksState.loading,
  error: perksState.error,
  perks: perksState.perks ? perksState.perks.map(p => ({
    tierId: p.tierId,
    tierName: p.tierName,
    expiryDate: p.expiryDate,
    features: p.features
  })) : null
}, null, 2)}`}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function AppContainer() {
  return (
    <MechaProvider 
      apiKey="mp_live_36f153484685fdbfa522125830e99f792c726c21ee61a95c"
      portalUrl="https://mecha-pay.vercel.app"
    >
      <App />
    </MechaProvider>
  );
}
