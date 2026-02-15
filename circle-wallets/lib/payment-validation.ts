// Validation utilities for payment page

export function isValidPlanId(planId: string): boolean {
  // bytes32 hex format: 0x followed by 64 hex characters
  return /^0x[a-fA-F0-9]{64}$/.test(planId);
}

export function isValidUserId(userId: string): boolean {
  // Allow alphanumeric, underscore, hyphen (flexible for different DB formats)
  // Max length 100 characters
  return /^[a-zA-Z0-9_-]{1,100}$/.test(userId);
}

export function isValidSuccessUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return false;
    }
    // Prevent localhost/127.0.0.1 redirects in production
    if (process.env.NODE_ENV === "production") {
      if (
        parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1" ||
        parsed.hostname.startsWith("192.168.") ||
        parsed.hostname.startsWith("10.") ||
        parsed.hostname.startsWith("172.")
      ) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

export function sanitizeUserId(userId: string): string {
  // Remove any potentially dangerous characters
  return userId.replace(/[^a-zA-Z0-9_-]/g, "");
}

export function validatePaymentParams(params: {
  planId?: string;
  userId?: string;
  successUrl?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!params.planId) {
    errors.push("Plan ID is required");
  } else if (!isValidPlanId(params.planId)) {
    errors.push("Invalid plan ID format");
  }

  if (!params.userId) {
    errors.push("User ID is required");
  } else if (!isValidUserId(params.userId)) {
    errors.push("Invalid user ID format (alphanumeric, underscore, hyphen only, max 100 chars)");
  }

  if (params.successUrl && !isValidSuccessUrl(params.successUrl)) {
    errors.push("Invalid success URL");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
