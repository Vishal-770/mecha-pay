import React from 'react';
import { PricingTable } from '../src';

// Example 1: Fetch all plans from API
const FetchAllPlans = () => {
  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        All Available Plans
      </h1>
      <PricingTable 
        apiKey="mp_live_your_api_key_here"
        onError={(error) => console.error('Failed to load plans:', error)}
      />
    </div>
  );
};

// Example 2: Fetch a specific plan by ID
const FetchSinglePlan = () => {
  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Pro Merchant Plan
      </h1>
      <PricingTable 
        apiKey="mp_live_your_api_key_here"
        planId="0xefdc1234567890abcdef"
        onError={(error) => console.error('Failed to load plan:', error)}
      />
    </div>
  );
};

// Example 3: Use custom base URL (production)
const FetchFromProduction = () => {
  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Production Plans
      </h1>
      <PricingTable 
        apiKey="mp_live_your_api_key_here"
        baseURL="https://api.mechapay.com"
        onError={(error) => console.error('Failed to load plans:', error)}
      />
    </div>
  );
};

// Example 4: Static plans (no API call)
const StaticPlans = () => {
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
        Static Plans (No API)
      </h1>
      <PricingTable plans={plans} />
    </div>
  );
};

export { FetchAllPlans, FetchSinglePlan, FetchFromProduction, StaticPlans };
