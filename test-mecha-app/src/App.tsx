import { MechaProvider, MechaPricingTable, useMecha, useMechaPerks } from "mechapay-react";
import { Zap } from "lucide-react";

const PLAN_ID = "0xb074b0822015c916dd232e7f6e7cfd051ecfde5628a14cdb8b2f4050e40a6d1c";
const USER_ID = "visha_test_user_0012";

function MembershipStatus() {
  const { status, remainingSeconds, loading } = useMecha(PLAN_ID, USER_ID);

  if (loading) return <div style={{ fontSize: '12px', opacity: 0.5 }}>Syncing Membership...</div>;

  const isActive = status === "ACTIVE" && remainingSeconds > 0;

  return (
    <div style={{ 
      padding: '20px', 
      borderRadius: '16px', 
      backgroundColor: isActive ? 'rgba(0, 255, 194, 0.05)' : 'rgba(255, 255, 255, 0.03)',
      border: `1px solid ${isActive ? 'rgba(0, 255, 194, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '40px'
    }}>
      <div style={{ 
        width: '8px', 
        height: '8px', 
        borderRadius: '50%', 
        backgroundColor: isActive ? '#00FFC2' : '#666',
        boxShadow: isActive ? '0 0 10px #00FFC2' : 'none'
      }} />
      <span style={{ fontSize: '13px', fontWeight: 700 }}>
        Status: <span style={{ color: isActive ? '#00FFC2' : '#fff' }}>{status}</span>
      </span>
      {isActive && (
        <span style={{ fontSize: '11px', opacity: 0.6, marginLeft: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }}>
          Access expires in: {Math.floor(remainingSeconds / 86400)}d {Math.floor((remainingSeconds % 86400) / 3600)}h
        </span>
      )}
    </div>
  );
}

function ActiveUserPerks() {
  const { perks, loading } = useMechaPerks(PLAN_ID, USER_ID);

  if (loading) return <div style={{ fontSize: '12px', opacity: 0.5 }}>Syncing Perks...</div>;
  if (!perks || perks.length === 0) return null;

  return (
    <div style={{ 
      padding: '24px', 
      borderRadius: '16px', 
      backgroundColor: 'rgba(0, 255, 194, 0.02)',
      border: '1px solid rgba(0, 255, 194, 0.1)',
      maxWidth: '460px',
      margin: '20px auto 40px',
      textAlign: 'left'
    }}>
      <h3 style={{ 
        fontSize: '12px', 
        fontWeight: 900, 
        textTransform: 'uppercase', 
        letterSpacing: '2px', 
        color: '#00FFC2', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        margin: 0
      }}>
        <Zap size={13} style={{ fill: '#00FFC2' }} />
        Active Subscribed Perks
      </h3>
      
      {perks.map((subbedTier) => (
        <div key={subbedTier.tierId} style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>{subbedTier.tierName}</span>
            <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)' }}>
              Expires: {subbedTier.expiryDate.toLocaleDateString()}
            </span>
          </div>
          <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {subbedTier.features.map((feat, idx) => (
              <li key={idx} style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.4' }}>
                <strong>{feat.title}</strong>: <span style={{ opacity: 0.7 }}>{feat.description}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function App() {
  return (
    <MechaProvider 
      apiKey="mp_live_36f153484685fdbfa522125830e99f792c726c21ee61a95c"
      portalUrl="https://mecha-pay.vercel.app"
    >
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#050505', 
        color: '#ffffff', 
        fontFamily: 'Inter, sans-serif',
        padding: '80px 20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
            Mecha Membership SDK v0.1.7
          </h1>
          <h2 style={{ fontSize: '42px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '32px' }}>
            Live Hook Integration
          </h2>
          
          <MembershipStatus />
          <ActiveUserPerks />
        </div>

        <MechaPricingTable 
          planId={PLAN_ID}
          userId={USER_ID}
          hideBranding={true}
          recommendedTierId="1"
          appearance={{
            theme: "dark",
            variables: {
              colorPrimary: "#00FFC2",
              borderRadius: "24px",
              cardPadding: "32px",
              gap: "24px"
            }
          }}
          customLabels={{
            activeSubscription: "Purchased Member",
            upgrade: "Level Up",
            downgrade: "Downgrade Plan",
            getTier: "Join {{tierLabel}}"
          }}
          classNames={{
            card: "custom-mecha-card",
            button: "custom-mecha-button"
          }}
        />

        <div style={{ marginTop: '100px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
            Verified: useMecha Hook syncs with MechaPricingTable state.
          </p>
        </div>
      </div>
    </MechaProvider>
  )
}

export default App
