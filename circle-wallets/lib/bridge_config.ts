import {
  baseSepolia,
  avalancheFuji,
  arbitrumSepolia,
  optimismSepolia,
  polygonAmoy,
  unichainSepolia,
  sepolia,
} from "viem/chains";
import { parseUnits } from "viem";

// ── Custom chain definitions ──────────────────────────────────────────────────

export const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
} as const;

export const customSepolia = {
  ...sepolia,
  rpcUrls: {
    ...sepolia.rpcUrls,
    default: { http: ["https://ethereum-sepolia-rpc.publicnode.com"] },
  },
} as const;

export const monadTestnet = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz"] } },
  blockExplorers: {
    default: {
      name: "MonadScan",
      url: "https://testnet.monadexplorer.com",
    },
  },
} as const;

export const hyperEvmTestnet = {
  id: 998,
  name: "HyperEVM Testnet",
  nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
  rpcUrls: { default: { http: ["https://api.hyperliquid-testnet.xyz/evm"] } },
  blockExplorers: {
    default: { name: "HyperEVM Explorer", url: "https://testnet.hyperliquid.xyz" },
  },
} as const;

export const seiAtlantic2 = {
  id: 713715,
  name: "Sei Atlantic-2",
  nativeCurrency: { name: "SEI", symbol: "SEI", decimals: 18 },
  rpcUrls: { default: { http: ["https://evm-rpc-testnet.sei-apis.com"] } },
  blockExplorers: {
    default: { name: "Sei Explorer", url: "https://seitrace.com" },
  },
} as const;

export const sonicBlazeTestnet = {
  id: 57054,
  name: "Sonic Testnet",
  nativeCurrency: { name: "S", symbol: "S", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.blaze.soniclabs.com"] } },
  blockExplorers: {
    default: { name: "Sonic Explorer", url: "https://testnet.sonicscan.org" },
  },
} as const;

// ── Bridge chain identifiers ──────────────────────────────────────────────────

export type BridgeChain =
  | "Arc_Testnet"
  | "Base_Sepolia"
  | "Arbitrum_Sepolia"
  | "Avalanche_Fuji"
  | "Ethereum_Sepolia"
  | "Optimism_Sepolia"
  | "Polygon_Amoy_Testnet"
  | "Unichain_Sepolia"
  | "Monad_Testnet"
  | "HyperEVM_Testnet"
  | "Sei_Testnet"
  | "Sonic_Testnet";

// ── Supported chains with metadata ───────────────────────────────────────────

export const SUPPORTED_CHAINS = [
  {
    name: "Arc Testnet",
    identifier: "Arc_Testnet" as BridgeChain,
    viemChain: arcTestnet,
    usdcAddress: null, // native USDC on Arc
    decimals: 18,
    nativeSymbol: "USDC",
    icon: "/arc-logo.png",
  },
  {
    name: "Base Sepolia",
    identifier: "Base_Sepolia" as BridgeChain,
    viemChain: {
      ...baseSepolia,
      rpcUrls: {
        ...baseSepolia.rpcUrls,
        default: { http: ["https://base-sepolia-rpc.publicnode.com"] },
      },
    },
    usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    decimals: 6,
    nativeSymbol: "ETH",
    icon: "https://avatars.githubusercontent.com/u/108554348?s=200&v=4",
  },
  {
    name: "Arbitrum Sepolia",
    identifier: "Arbitrum_Sepolia" as BridgeChain,
    viemChain: {
      ...arbitrumSepolia,
      rpcUrls: {
        ...arbitrumSepolia.rpcUrls,
        default: { http: ["https://sepolia-rollup.arbitrum.io/rpc"] },
      },
    },
    usdcAddress: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    decimals: 6,
    nativeSymbol: "ETH",
    icon: "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
  },
  {
    name: "Avalanche Fuji",
    identifier: "Avalanche_Fuji" as BridgeChain,
    viemChain: {
      ...avalancheFuji,
      rpcUrls: {
        ...avalancheFuji.rpcUrls,
        default: { http: ["https://avalanche-fuji-c-chain-rpc.publicnode.com"] },
      },
    },
    usdcAddress: "0x5425890298aed601595a70AB815c96711a31Bc65",
    decimals: 6,
    nativeSymbol: "AVAX",
    icon: "https://cryptologos.cc/logos/avalanche-avax-logo.png",
  },
  {
    name: "Ethereum Sepolia",
    identifier: "Ethereum_Sepolia" as BridgeChain,
    viemChain: customSepolia,
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    decimals: 6,
    nativeSymbol: "ETH",
    icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  },
  {
    name: "OP Sepolia",
    identifier: "Optimism_Sepolia" as BridgeChain,
    viemChain: {
      ...optimismSepolia,
      rpcUrls: {
        ...optimismSepolia.rpcUrls,
        default: { http: ["https://optimism-sepolia-rpc.publicnode.com"] },
      },
    },
    usdcAddress: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
    decimals: 6,
    nativeSymbol: "ETH",
    icon: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png",
  },
  {
    name: "Polygon Amoy",
    identifier: "Polygon_Amoy_Testnet" as BridgeChain,
    viemChain: {
      ...polygonAmoy,
      rpcUrls: {
        ...polygonAmoy.rpcUrls,
        default: { http: ["https://polygon-amoy-bor-rpc.publicnode.com"] },
      },
      fees: {
        ...polygonAmoy.fees,
        async estimateFeesPerGas() {
          return {
            maxPriorityFeePerGas: parseUnits("30", 9),
            maxFeePerGas: parseUnits("50", 9),
          };
        },
      },
    },
    usdcAddress: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
    decimals: 6,
    nativeSymbol: "MATIC",
    icon: "https://cryptologos.cc/logos/polygon-matic-logo.png",
  },
  {
    name: "Unichain Sepolia",
    identifier: "Unichain_Sepolia" as BridgeChain,
    viemChain: {
      ...unichainSepolia,
      rpcUrls: {
        ...unichainSepolia.rpcUrls,
        default: { http: ["https://unichain-sepolia-rpc.publicnode.com"] },
      },
    },
    usdcAddress: "0x31d0220469e10c4E71834a79b1f276d740d3768F",
    decimals: 6,
    nativeSymbol: "ETH",
    icon: "https://ethglobal.storage/static/faucet/unichain.png",
  },
  {
    name: "Monad Testnet",
    identifier: "Monad_Testnet" as BridgeChain,
    viemChain: monadTestnet,
    usdcAddress: "0x534b2f3A21130d7a60830c2Df862319e593943A3",
    decimals: 6,
    nativeSymbol: "MON",
    icon: "https://ethglobal.storage/static/faucet/monad-testnet.png",
  },
  {
    name: "HyperEVM Testnet",
    identifier: "HyperEVM_Testnet" as BridgeChain,
    viemChain: hyperEvmTestnet,
    usdcAddress: null, // USDC not yet widely available on HyperEVM testnet
    decimals: 6,
    nativeSymbol: "HYPE",
    icon: "./hyperliquid.png",
  },
  {
    name: "Sei Atlantic-2",
    identifier: "Sei_Testnet" as BridgeChain,
    viemChain: seiAtlantic2,
    usdcAddress: "0x3f88DeCCef29F9D5a2a12C3dCdF3bDA2F28Da1C0",
    decimals: 6,
    nativeSymbol: "SEI",
    icon: "https://cryptologos.cc/logos/sei-sei-logo.png",
  },
  {
    name: "Sonic Testnet",
    identifier: "Sonic_Testnet" as BridgeChain,
    viemChain: sonicBlazeTestnet,
    usdcAddress: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
    decimals: 6,
    nativeSymbol: "S",
    icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  },
] as const;

// ── CCTP V2 constants ─────────────────────────────────────────────────────────

export const MESSAGE_TRANSMITTER_ADDRESS =
  "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275" as const;
export const MESSAGE_SENT_TOPIC =
  "0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036" as const;
export const CCTP_ATTESTATION_API =
  "https://iris-api-sandbox.circle.com/v1/attestations/" as const;

export const CCTP_CONFIG: Record<BridgeChain, { messenger: string; domain: number }> = {
  Ethereum_Sepolia: { messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", domain: 0 },
  Avalanche_Fuji:   { messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", domain: 1 },
  Optimism_Sepolia: { messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", domain: 2 },
  Arbitrum_Sepolia: { messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", domain: 3 },
  Base_Sepolia:     { messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", domain: 6 },
  Polygon_Amoy_Testnet: { messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", domain: 7 },
  Unichain_Sepolia: { messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", domain: 10 },
  Sonic_Testnet:    { messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", domain: 13 },
  Sei_Testnet:      { messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", domain: 16 },
  HyperEVM_Testnet: { messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", domain: 19 },
  Arc_Testnet:      { messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", domain: 26 },
  Monad_Testnet:    { messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", domain: 15 },
};

// ── Privy config ──────────────────────────────────────────────────────────────

export const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";
export const privyClientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID ?? "";

export const privyConfig = {
  loginMethods: ["wallet"] as const,
  appearance: { walletList: ["metamask"] as const },
  embeddedWallets: { createOnLogin: "off" as const },
  supportedChains: SUPPORTED_CHAINS.map((c) => c.viemChain),
} as const;
