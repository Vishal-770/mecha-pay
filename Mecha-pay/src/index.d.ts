import { FC } from 'react';

export interface Feature {
  title: string;
  description?: string;
}

export interface PlanMetadata {
  name: string;
  description: string;
  features: Feature[];
}

export interface Plan {
  planId: string;
  price: string;
  duration: string;
  metadata: PlanMetadata;
}

export interface PricingTableProps {
  /** Your Mecha-Pay API key (required) */
  apiKey: string;
  /** The plan ID to fetch and display (required) */
  planId: string;
  /** User ID for generating payment links (required) */
  userId: string;
  /** Optional error callback function */
  onError?: (error: Error) => void;
}

export const PricingTable: FC<PricingTableProps>;
export default PricingTable;

// API Functions
export function getPlan(apiKey: string, planId: string, baseURL?: string): Promise<Plan>;
export function getPlans(apiKey: string, baseURL?: string): Promise<Plan[]>;
