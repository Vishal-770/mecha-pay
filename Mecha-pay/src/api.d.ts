import { AxiosError } from 'axios';
import { Plan } from './PricingTable';

export interface ApiError {
  message: string;
  status?: number;
}

/**
 * Fetches a plan from the Mecha-Pay API
 * @param apiKey - Your Mecha-Pay API key (e.g., "mp_live_...")
 * @param planId - The plan ID to fetch (e.g., "0xefdc...")
 * @param baseURL - Optional base URL (defaults to http://localhost:3000)
 * @returns Promise resolving to the plan data
 */
export declare function getPlan(
  apiKey: string,
  planId: string,
  baseURL?: string
): Promise<Plan>;

/**
 * Fetches all plans from the Mecha-Pay API
 * @param apiKey - Your Mecha-Pay API key (e.g., "mp_live_...")
 * @param baseURL - Optional base URL (defaults to http://localhost:3000)
 * @returns Promise resolving to array of plans
 */
export declare function getPlans(
  apiKey: string,
  baseURL?: string
): Promise<Plan[]>;

export default getPlan;
