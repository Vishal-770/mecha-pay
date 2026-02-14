import {
  baseSepolia,
  avalancheFuji,
  arbitrumSepolia,
  optimismSepolia,
  polygonAmoy,
  unichainSepolia,
  lineaSepolia,
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

export const seiTestnet = {
  id: 1328,
  name: "Sei Testnet",
  nativeCurrency: { name: "SEI", symbol: "SEI", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://evm-rpc-testnet.sei-apis.com"] },
  },
  blockExplorers: {
    default: { name: "Seitrace", url: "https://seitrace.com/atlantic-2" },
  },
} as const;

export const worldChainSepolia = {
  id: 4801,
  name: "World Chain Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://worldchain-sepolia.g.alchemy.com/public"] },
  },
  blockExplorers: {
    default: { name: "Worldscan", url: "https://worldscan.org" },
  },
} as const;

export const inkTestnet = {
  id: 763373,
  name: "Ink Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc-gel-sepolia.inkonchain.com"] },
  },
  blockExplorers: {
    default: {
      name: "Ink Explorer",
      url: "https://explorer-sepolia.inkonchain.com",
    },
  },
} as const;

export const xdcApothem = {
  id: 51,
  name: "XDC Apothem",
  nativeCurrency: { name: "XDC", symbol: "XDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://erpc.apothem.network"] } },
  blockExplorers: {
    default: { name: "XDCScan", url: "https://apothem.xdcscan.io" },
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

export const codexTestnet = {
  id: 812242,
  name: "Codex Testnet",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.codex-stg.xyz"] } },
  blockExplorers: {
    default: { name: "Codex Explorer", url: "https://explorer.codex-stg.xyz" },
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
  | "Linea_Sepolia"
  | "Sei_Testnet"
  | "World_Chain_Sepolia"
  | "Ink_Testnet"
  | "XDC_Apothem"
  | "Monad_Testnet"
  | "Codex_Testnet";

// ── Supported chains with metadata ───────────────────────────────────────────

export const SUPPORTED_CHAINS = [
  {
    name: "Arc Testnet",
    identifier: "Arc_Testnet" as BridgeChain,
    viemChain: arcTestnet,
    usdcAddress: null, // native USDC on Arc
    decimals: 18,
    nativeSymbol: "USDC",
    icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  },
  {
    name: "Base Sepolia",
    identifier: "Base_Sepolia" as BridgeChain,
    viemChain: baseSepolia,
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
      fees: {
        ...arbitrumSepolia.fees,
        async estimateFeesPerGas() {
          return {
            maxPriorityFeePerGas: parseUnits("30", 9),
            maxFeePerGas: parseUnits("50", 9),
          };
        },
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
    viemChain: avalancheFuji,
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
    viemChain: optimismSepolia,
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
    viemChain: unichainSepolia,
    usdcAddress: "0x31d0220469e10c4E71834a79b1f276d740d3768F",
    decimals: 6,
    nativeSymbol: "ETH",
    icon: "https://ethglobal.storage/static/faucet/unichain.png",
  },
  {
    name: "Linea Sepolia",
    identifier: "Linea_Sepolia" as BridgeChain,
    viemChain: lineaSepolia,
    usdcAddress: "0xFEce4462D57bD51A6A552365A011b95f0E16d9B7",
    decimals: 6,
    nativeSymbol: "ETH",
    icon: "https://ethglobal.storage/static/faucet/linea-sepolia.png",
  },
  {
    name: "Sei Testnet",
    identifier: "Sei_Testnet" as BridgeChain,
    viemChain: seiTestnet,
    usdcAddress: "0x4fCF1784B31630811181f670Aea7A7bEF803eaED",
    decimals: 6,
    nativeSymbol: "SEI",
    icon: "https://cryptologos.cc/logos/sei-sei-logo.png",
  },
  {
    name: "World Chain Sepolia",
    identifier: "World_Chain_Sepolia" as BridgeChain,
    viemChain: worldChainSepolia,
    usdcAddress: "0x66145f38cBAC35Ca6F1Dfb4914dF98F1614aeA88",
    decimals: 6,
    nativeSymbol: "ETH",
    icon: "https://ethglobal.storage/static/faucet/world-chain-sepolia.png",
  },
  {
    name: "Ink Testnet",
    identifier: "Ink_Testnet" as BridgeChain,
    viemChain: inkTestnet,
    usdcAddress: "0xFabab97dCE620294D2B0b0e46C68964e326300Ac",
    decimals: 6,
    nativeSymbol: "ETH",
    icon: "https://inkonchain.com/logo/ink-mark-light.webp",
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
  Linea_Sepolia:    { messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", domain: 11 },
  Arc_Testnet:      { messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", domain: 26 },
  Sei_Testnet:      { messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", domain: 16 },
  World_Chain_Sepolia: { messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", domain: 14 },
  Ink_Testnet:      { messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", domain: 21 },
  XDC_Apothem:      { messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", domain: 18 },
  Monad_Testnet:    { messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", domain: 15 },
  Codex_Testnet:    { messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", domain: 12 },
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
