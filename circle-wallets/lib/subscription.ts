export const ARC_CHAIN_ID = 5042002;
export const ARC_BLOCKCHAIN = "ARC-TESTNET";

export const SUBSCRIPTION_GATEWAY_ADDRESS =
  process.env.NEXT_PUBLIC_SUBSCRIPTION_GATEWAY_ADDRESS ??
  "0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2";

export const ARC_USDC_ADDRESS =
  process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS ??
  "0x3600000000000000000000000000000000000000";

export const ARC_RPC_URL =
  process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "https://rpc.testnet.arc.network";

export const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || "";

export const IPFS_GATEWAY_BASE =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY_BASE ?? "https://ipfs.filebase.io/ipfs/";

export const HIGH_FEE = {
  type: "level" as const,
  config: {
    feeLevel: "HIGH" as const,
  },
};

export interface SubscriptionFeature {
  title: string;
  description: string;
}

export interface SubscriptionUiMetadata {
  type: "subscription-ui";
  version: "1.1";
  brand: {
    name: string;
    website: string;
  };
  tiers: {
    label: string;
    price: string;
    features: SubscriptionFeature[];
  }[];
}

export function normalizeIpfsUri(ipfsHash: string) {
  return ipfsHash.startsWith("ipfs://") ? ipfsHash : `ipfs://${ipfsHash}`;
}

export function ipfsHashToHttpUrl(ipfsHash: string) {
  const normalized = normalizeIpfsUri(ipfsHash);
  return `${IPFS_GATEWAY_BASE}${normalized.replace("ipfs://", "")}`;
}

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

export function validateSubscriptionMetadata(input: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["metadata must be a JSON object"] };
  }

  const value = input as Record<string, unknown>;
  
  if (value.type !== "subscription-ui") {
    errors.push("type must be 'subscription-ui'");
  }

  if (value.version !== "1.1" && value.version !== "1.0") {
    errors.push("version must be '1.0' or '1.1'");
  }

  // Handle Legacy 1.0
  if (value.version === "1.0") {
     if (!isNonEmptyString(value.name)) errors.push("name is required for v1.0");
     if (!Array.isArray(value.features)) errors.push("features array is required for v1.0");
  }

  // Brand is required for v1.1
  if (value.version === "1.1") {
    if (!value.brand || typeof value.brand !== "object") {
      errors.push("brand object is required for v1.1");
    } else {
      const brand = value.brand as Record<string, unknown>;
      if (!isNonEmptyString(brand.name)) {
        errors.push("brand.name is required");
      }
      if (!isNonEmptyString(brand.website)) {
        errors.push("brand.website is required");
      }
    }
  }

  if (value.version === "1.1") {
    if (!Array.isArray(value.tiers)) {
      errors.push("tiers must be an array for v1.1");
    } else if (value.tiers.length === 0) {
      errors.push("tiers must have at least one item");
    } else {
      for (let i = 0; i < value.tiers.length; i++) {
        const tier = value.tiers[i];
        if (!isRecord(tier)) {
          errors.push(`tiers[${i}] must be an object`);
          continue;
        }
        if (!isNonEmptyString(tier.label)) errors.push(`tiers[${i}].label is required`);
        if (!isNonEmptyString(tier.price)) errors.push(`tiers[${i}].price is required`);
        
        if (!Array.isArray(tier.features)) {
          errors.push(`tiers[${i}].features must be an array`);
        } else {
          for (let j = 0; j < tier.features.length; j++) {
            const feature = tier.features[j];
            if (!isRecord(feature) || !isNonEmptyString(feature.title) || !isNonEmptyString(feature.description)) {
              errors.push(`tiers[${i}].features[${j}] must have title and description`);
            }
          }
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function isAddressLike(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}
