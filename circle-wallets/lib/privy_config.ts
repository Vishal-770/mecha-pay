import {
  baseSepolia,
  avalancheFuji,
  arbitrumSepolia,
  sepolia,
} from "viem/chains";

export const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
} as const;

// Custom Sepolia with a more stable RPC to avoid 408/rate limits
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
    default: {
      http: [
        "https://evm-rpc-testnet.sei-apis.com",
        "https://sei-testnet-public.nodies.app",
        "https://sei-testnet-2-rpc.brocha.in",
      ],
    },
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
    default: { name: "Ink Explorer", url: "https://explorer-sepolia.inkonchain.com" },
  },
} as const;

export const xdcApothem = {
  id: 51,
  name: "XDC Apothem",
  nativeCurrency: { name: "XDC", symbol: "XDC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://erpc.apothem.network"] },
  },
  blockExplorers: {
    default: { name: "XDCScan", url: "https://apothem.xdcscan.io" },
  },
} as const;

export const monadTestnet = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: { name: "MonadScan", url: "https://testnet.monadexplorer.com" },
  },
} as const;

export const codexTestnet = {
  id: 812242,
  name: "Codex Testnet",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.codex-stg.xyz"] },
  },
  blockExplorers: {
    default: { name: "Codex Explorer", url: "https://explorer.codex-stg.xyz" },
  },
} as const;

export const config = {
  // Create embedded wallets for users who don't have a wallet
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
  } as any,
  // Enable Smart Wallets (Account Abstraction)
  smartWallets: {
    createOnLogin: "users-without-wallets",
  },
  supportedChains: [
    arcTestnet,
    baseSepolia,
    arbitrumSepolia,
    avalancheFuji,
    customSepolia,
    seiTestnet,
    worldChainSepolia,
    inkTestnet,
    xdcApothem,
    monadTestnet,
    codexTestnet,
  ],
};

export const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";
export const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID || "";
