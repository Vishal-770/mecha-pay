import { MechaProvider, MechaPricingTable, useMecha } from "mechapay-sdk";

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
