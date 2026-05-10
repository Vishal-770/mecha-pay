import { getCircleClient } from "./circleClient";

/**
 * Validates that the provided address belongs to the user identified by userToken.
 * Returns true if valid, false otherwise.
 */
export async function validateWalletOwnership(userToken: string, address: string): Promise<boolean> {
  if (!userToken || !address) return false;
  try {
    const client = getCircleClient();
    const response = await client.listWallets({ userToken });
    const wallets = response.data?.wallets ?? [];
    
    const target = address.toLowerCase();
    return wallets.some(w => w.address.toLowerCase() === target);
  } catch (err) {
    console.error("Wallet ownership validation failed:", err);
    return false;
  }
}

/**
 * Gets all wallet addresses associated with a userToken.
 */
export async function getUserAddresses(userToken: string): Promise<string[]> {
  if (!userToken) return [];
  try {
    const client = getCircleClient();
    const response = await client.listWallets({ userToken });
    const wallets = response.data?.wallets ?? [];
    return wallets.map(w => w.address.toLowerCase());
  } catch (err) {
    console.error("Failed to fetch user addresses:", err);
    return [];
  }
}
