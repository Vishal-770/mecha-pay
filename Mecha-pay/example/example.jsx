import React from 'react';
import { PricingTable } from '../src';

const Example = () => {
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
          { title: "24/7 Support", description: "Priority customer service" },
          { title: "API Access", description: "Full REST API integration" },
          { title: "Custom Branding", description: "White-label solution" }
        ]
      }
    },
    {
      planId: "0xabcd9876543210fedcba",
      price: "2000000",
      duration: "2592000",
      metadata: {
        name: "Basic Merchant",
        description: "Perfect for small businesses",
        features: [
          { title: "Basic Analytics", description: "Essential metrics" },
          { title: "Email Support", description: "Response within 24h" },
          { title: "Standard API", description: "Rate limited access" }
        ]
      }
    },
    {
      planId: "0x1111222233334444",
      price: "10000000",
      duration: "2592000",
      metadata: {
        name: "Enterprise",
        description: "For large-scale operations",
        features: [
          { title: "Advanced Analytics", description: "Custom reports & insights" },
          { title: "Dedicated Support", description: "Personal account manager" },
          { title: "Unlimited API", description: "No rate limits" },
          { title: "Custom Integration", description: "Tailored solutions" },
          { title: "SLA Guarantee", description: "99.9% uptime" }
        ]
      }
    }
  ];

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Choose Your Plan
      </h1>
      <PricingTable plans={plans} />
    </div>
  );
};

export default Example;
