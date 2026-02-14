export const ARC_CHAIN_ID = 5042002;
export const ARC_BLOCKCHAIN = "ARC-TESTNET";

export const SUBSCRIPTION_GATEWAY_ADDRESS =
  process.env.NEXT_PUBLIC_SUBSCRIPTION_GATEWAY_ADDRESS ??
  "0x2BC2f391fca4144f708eEa918d94348684Bdb544";

export const ARC_USDC_ADDRESS =
  process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS ??
  "0x3600000000000000000000000000000000000000";

export const ARC_RPC_URL =
  process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "https://rpc.testnet.arc.network";

export const SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_SUBGRAPH_URL ??
  `https://api.studio.thegraph.com/query/1704298/mecha-pay/v0.0.3`;

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
  version: "1.0";
  name: string;
  brand: {
    name: string;
    website: string;
  };
  features: SubscriptionFeature[];
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

export function validateSubscriptionMetadata(input: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["metadata must be a JSON object"] };
  }

  const value = input as Record<string, unknown>;
  const topLevelKeys = Object.keys(value);
  const allowedTopLevel = ["type", "version", "name", "brand", "features"];

  if (topLevelKeys.length !== allowedTopLevel.length) {
    errors.push(
      "metadata must contain exactly: type, version, name, brand, features",
    );
  }

  for (const key of topLevelKeys) {
    if (!allowedTopLevel.includes(key)) {
      errors.push(`unknown key: ${key}`);
    }
  }

  if (value.type !== "subscription-ui") {
    errors.push("type must be 'subscription-ui'");
  }

  if (value.version !== "1.0") {
    errors.push("version must be '1.0'");
  }

  if (!isNonEmptyString(value.name)) {
    errors.push("name is required");
  }

  if (!value.brand || typeof value.brand !== "object") {
    errors.push("brand object is required");
  } else {
    const brand = value.brand as Record<string, unknown>;
    const brandKeys = Object.keys(brand);
    if (
      brandKeys.length !== 2 ||
      !brandKeys.includes("name") ||
      !brandKeys.includes("website")
    ) {
      errors.push("brand must contain exactly: name, website");
    }
    if (!isNonEmptyString(brand.name)) {
      errors.push("brand.name is required");
    }
    if (!isNonEmptyString(brand.website)) {
      errors.push("brand.website is required");
    }
  }

  if (!Array.isArray(value.features)) {
    errors.push("features must be an array");
  } else if (value.features.length === 0) {
    errors.push("features must have at least one item");
  } else {
    for (let i = 0; i < value.features.length; i += 1) {
      const feature = value.features[i];
      if (!feature || typeof feature !== "object") {
        errors.push(`features[${i}] must be an object`);
        continue;
      }
      const featureRecord = feature as Record<string, unknown>;
      const featureKeys = Object.keys(featureRecord);
      if (
        featureKeys.length !== 2 ||
        !featureKeys.includes("title") ||
        !featureKeys.includes("description")
      ) {
        errors.push(`features[${i}] must contain exactly: title, description`);
      }
      if (!isNonEmptyString(featureRecord.title)) {
        errors.push(`features[${i}].title is required`);
      }
      if (!isNonEmptyString(featureRecord.description)) {
        errors.push(`features[${i}].description is required`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function isAddressLike(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}
