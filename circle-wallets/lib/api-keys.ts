import { createHash, randomBytes } from "crypto";

/**
 * Generates a high-entropy API key with a 'mp_live_' prefix.
 */
export function generateApiKey(): string {
  const bytes = randomBytes(24); // 192 bits of entropy
  return `mp_live_${bytes.toString("hex")}`;
}

/**
 * Creates a SHA-256 hash of an API key for secure storage.
 */
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
