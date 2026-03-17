
import "./App.css";


// Import Pricing table from mecha-pay package

import PricingTable from "mecha-pay";

function App() {
  const apiKey = import.meta.env.VITE_API_KEY!;
  const userId = "user_1234567890";
  const planId =
    "0xacbc49f2fef52733cf471aae1be8efd557851c6c0fff0dcba81327cc84b46646";
  return (
    <>
      <PricingTable apiKey={apiKey} userId={userId} planId={planId} />
    </>
  );
}

export default App;
