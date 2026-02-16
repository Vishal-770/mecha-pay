import { connectToDatabase } from "./db";
import { hashApiKey } from "./api-keys";

/**
 * Validates an API key from the request header and returns the associated userId.
 * Throws an error if the key is invalid or revoked.
 */
export async function validateApiKey(apiKey: string): Promise<{ userId: string; merchantAddress: string | null }> {
  const { db } = await connectToDatabase();
  
  const trimmedKey = apiKey.trim();
  const hashedKey = hashApiKey(trimmedKey);
  
  const keyRecord = await db.collection("api_keys").findOne({
    keyHash: hashedKey,
    revokedAt: null
  });

  if (!keyRecord) {
    throw new Error("Invalid or revoked API key");
  }

  // Update lastUsedAt asynchronously
  db.collection("api_keys").updateOne(
    { _id: keyRecord._id },
    { $set: { lastUsedAt: new Date() } }
  ).catch(err => console.error("Failed to update lastUsedAt", err));

  return { 
    userId: keyRecord.userId, 
    merchantAddress: keyRecord.merchantAddress 
  };
}
