import React from 'react';
import { PricingTable } from '../src';

// Basic Example - Just 3 props needed!
const BasicExample = () => {
  const userId = "user_12345"; // Get from your auth system

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Pro Merchant Plan
      </h1>
      <PricingTable 
        apiKey="mp_live_your_api_key_here"
        planId="0xefdc1234567890abcdef"
        userId={userId}
      />
    </div>
  );
};

// With Error Handling
const WithErrorHandling = () => {
  const userId = "user_12345";

  const handleError = (error) => {
    console.error('Failed to load plan:', error);
    // Show toast notification, etc.
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Basic Plan
      </h1>
      <PricingTable 
        apiKey="mp_live_your_api_key_here"
        planId="0xabcd9876543210fedcba"
        userId={userId}
        onError={handleError}
      />
    </div>
  );
};

// Next.js Example
const NextJsExample = () => {
  const userId = "user_12345";

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Enterprise Plan
      </h1>
      <PricingTable 
        apiKey="mp_live_your_api_key_here"
        planId="0x1111222233334444"
        userId={userId}
      />
    </div>
  );
};

export { BasicExample, WithErrorHandling, NextJsExample };
export default BasicExample;
