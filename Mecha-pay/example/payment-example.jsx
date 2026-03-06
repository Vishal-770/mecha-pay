import React from 'react';
import { PricingTable } from '../src';

// Example 1: Complete setup with payment links
const CompleteExample = () => {
  const userId = "user_12345"; // Get from your auth system

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Choose Your Plan
      </h1>
      <PricingTable 
        apiKey="mp_live_your_api_key_here"
        userId={userId}
        onError={(error) => console.error('Failed to load plans:', error)}
      />
    </div>
  );
};

// Example 2: Custom payment URL (production)
const ProductionExample = () => {
  const userId = "user_12345";

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Production Payment
      </h1>
      <PricingTable 
        apiKey="mp_live_your_api_key_here"
        userId={userId}
        baseURL="https://api.mechapay.com"
        paymentBaseURL="https://pay.mechapay.com"
      />
    </div>
  );
};

// Example 3: Single plan with payment
const SinglePlanExample = () => {
  const userId = "user_12345";

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Pro Plan
      </h1>
      <PricingTable 
        apiKey="mp_live_your_api_key_here"
        userId={userId}
        planId="0xefdc1234567890abcdef"
      />
    </div>
  );
};

// Example 4: Static plans with payment
const StaticWithPayment = () => {
  const userId = "user_12345";
  
  const plans = [
    {
      planId: "0xefdc1234567890abcdef",
      price: "5000000",
      duration: "2592000",
      metadata: {
        name: "Pro Merchant",
        description: "Premium subscription plan",
        features: [
          { title: "Analytics", description: "Full dashboard access" },
          { title: "24/7 Support", description: "Priority customer service" }
        ]
      }
    }
  ];

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Static Plans
      </h1>
      <PricingTable 
        plans={plans} 
        userId={userId}
      />
    </div>
  );
};

export { CompleteExample, ProductionExample, SinglePlanExample, StaticWithPayment };
