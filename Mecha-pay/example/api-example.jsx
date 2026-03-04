import React, { useEffect, useState } from 'react';
import { PricingTable, getPlan, getPlans } from '../src';

const ApiExample = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        
        // Replace with your actual API key
        const apiKey = 'mp_live_your_api_key_here';
        
        // Fetch all plans
        const allPlans = await getPlans(apiKey);
        setPlans(allPlans);
        
        // Or fetch a specific plan
        // const singlePlan = await getPlan(apiKey, '0xefdc...');
        // setPlans([singlePlan]);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading plans...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Choose Your Plan
      </h1>
      <PricingTable plans={plans} />
    </div>
  );
};

export default ApiExample;
