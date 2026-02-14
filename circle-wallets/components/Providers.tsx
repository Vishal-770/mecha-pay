"use client";

import React, { useState } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CircleSDKProvider } from "@/context/CircleSDKContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { arcTestnet } from "@/lib/privy_config";
import { 
  baseSepolia, 
  avalancheFuji, 
  arbitrumSepolia, 
  sepolia,
  optimismSepolia,
  polygonAmoy,
  unichainSepolia,
  lineaSepolia
} from "viem/chains";

import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

const Providers = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            retry: 1,
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 10000),
            staleTime: 60_000,
          },
        },
      }),
  );

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#676FFF",
          showWalletLoginFirst: true,
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        supportedChains: [
          arcTestnet,
          baseSepolia,
          arbitrumSepolia,
          avalancheFuji,
          sepolia,
          optimismSepolia,
          polygonAmoy,
          unichainSepolia,
          lineaSepolia
        ],
      }}
    >
      <SmartWalletsProvider>
        <QueryClientProvider client={queryClient}>
          <CircleSDKProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </CircleSDKProvider>
        </QueryClientProvider>
      </SmartWalletsProvider>
    </PrivyProvider>
  );
};

export default Providers;
