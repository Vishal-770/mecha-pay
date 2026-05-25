import {
  baseSepolia,
  avalancheFuji,
  arbitrumSepolia,
  optimismSepolia,
  polygonAmoy,
  unichainSepolia,
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

export const config = {
  // Create embedded wallets for users who don't have a wallet
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
  },
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
    optimismSepolia,
    polygonAmoy,
    unichainSepolia,
    monadTestnet,
  ],
};

export const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";
export const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID || "";
