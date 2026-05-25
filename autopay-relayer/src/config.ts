import { Chain, Hex } from "viem";

export const arcTestnet: Chain = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
};

export const PORT = process.env.PORT || 4000;
export const MONGODB_URI = process.env.MONGODB_URI;
export const MONGODB_DB = process.env.MONGODB_DB || "mecha-pay";
export const SUBSCRIPTION_GATEWAY_ADDRESS = "0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2" as Hex;
export const ARC_USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as Hex;
export const ARC_RPC_URL = "https://rpc.testnet.arc.network";

if (!MONGODB_URI) {
  console.error("Fatal Error: MONGODB_URI environment variable is missing.");
  process.exit(1);
}
