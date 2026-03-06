import React, { useEffect, useState } from 'react';
import { getPlan } from './api';
import './PricingTable.css';

const BASE_URL = 'http://localhost:3000';

const PricingTable = ({ apiKey, planId, userId, onError }) => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getPlan(apiKey, planId, BASE_URL);
        setPlan(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        if (onError) {
          onError(err);
        }
      }
    };

    fetchPlanData();
  }, [apiKey, planId, onError]);

  const generatePaymentLink = () => {
    const currentURL = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams({
      userId: userId,
      successUrl: currentURL
    });
    return `${BASE_URL}/pay/${planId}?${params.toString()}`;
  };

  const formatPrice = (price) => {
    // Convert from wei to a more readable format (assuming 18 decimals)
    const formatted = (parseInt(price) / 1e18).toFixed(2);
    return `$${formatted}`;
  };

  const formatDuration = (seconds) => {
    const days = Math.floor(seconds / 86400);
    if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  };

  if (loading) {
    return (
      <div className="pricing-table-container">
        <div className="pricing-loading">Loading plan...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pricing-table-container">
        <div className="pricing-error">
          <span className="error-icon">⚠️</span>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="pricing-table-container">
        <div className="pricing-empty">No plan found</div>
      </div>
    );
  }

  return (
    <div className="pricing-table-container">
      <div className="pricing-card">
        <div className="pricing-header">
          <h2 className="pricing-title">{plan.metadata.name}</h2>
          <p className="pricing-description">{plan.metadata.description}</p>
        </div>
        
        <div className="pricing-price">
          <span className="price-amount">{formatPrice(plan.price)}</span>
          <span className="price-duration">/{formatDuration(plan.duration)}</span>
        </div>

        <div className="pricing-features">
          <h3 className="features-title">Features</h3>
          <ul className="features-list">
            {plan.metadata.features.map((feature, index) => (
              <li key={index} className="feature-item">
                <svg 
                  className="feature-icon" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
                <div className="feature-content">
                  <strong className="feature-title">{feature.title}</strong>
                  {feature.description && (
                    <p className="feature-description">{feature.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <a 
          href={generatePaymentLink()} 
          className="pricing-button"
        >
          Subscribe Now
        </a>
      </div>
    </div>
  );
};

export default PricingTable;
