"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  WebAuthnMode,
  toCircleSmartAccount,
  toModularTransport,
  toPasskeyTransport,
  toWebAuthnCredential,
  getUserOperationGasPrice,
} from "@circle-fin/modular-wallets-core";
import {
  createPublicClient,
  type Abi,
  type Hex,
  type Transport,
  type Client,
} from "viem";
import {
  toWebAuthnAccount,
  createBundlerClient,
  type P256Credential,
} from "viem/account-abstraction";
import { SUPPORTED_CHAINS, arcTestnet } from "@/lib/bridge_config";

// ─── Constants & Configurations ──────────────────────────────────────────────

const DEFAULT_CLIENT_URL = "https://modular-sdk.circle.com/v1/rpc/w3s/buidl";

const CHAIN_PATH_MAP: Record<string, string> = {
  Arc_Testnet: "/arcTestnet",
  Base_Sepolia: "/baseSepolia",
  Arbitrum_Sepolia: "/arbitrumSepolia",
  Avalanche_Fuji: "/avalancheFuji",
  Optimism_Sepolia: "/optimismSepolia",
  Polygon_Amoy_Testnet: "/polygonAmoy",
  Unichain_Sepolia: "/unichainSepolia",
  Monad_Testnet: "/monadTestnet",
};

export interface SdkSession {
  username: string;
  credential: P256Credential;
  walletAddress: string;
}

interface CircleSDKContextValue {
  isReady: boolean;
  isInitializing: boolean;
  session: SdkSession | null;
  walletAddress: string | null;
  username: string | null;
  registerPasskey: (username: string) => Promise<void>;
  loginWithPasskey: (username?: string) => Promise<void>;
  clearSession: () => void;
  executeTransaction: (
    calls: { to: Hex; data: Hex; value?: bigint }[],
    sponsorGas?: boolean,
    chainKey?: string
  ) => Promise<{ userOpHash: Hex; txHash: Hex }>;
  readOnChain: (
    abi: Abi,
    address: Hex,
    functionName: string,
    args: readonly unknown[],
    chainKey?: string
  ) => Promise<unknown>;
}

const CircleSDKContext = createContext<CircleSDKContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function CircleSDKProvider({ children }: { children: ReactNode }) {
  const clientKey = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY || "";
  const clientUrl = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_URL || DEFAULT_CLIENT_URL;
  const isConfigured = !!clientKey;

  const [username, setUsername] = useState<string | null>(null);
  const [credential, setCredential] = useState<P256Credential | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const passkeyTransport = useMemo(() => {
    if (!isConfigured) return null;
    return toPasskeyTransport(clientUrl, clientKey);
  }, [clientUrl, clientKey, isConfigured]);

  // Helper to get Viem clients for a chain.
  // Always uses toModularTransport — Circle's bundler only supports the sponsored (paymaster: true) path.
  const getClients = useCallback((chainKey: string = "Arc_Testnet") => {
    if (!isConfigured) throw new Error("Circle client key is not configured.");
    
    const path = CHAIN_PATH_MAP[chainKey] || "/arcTestnet";
    const chainMeta = SUPPORTED_CHAINS.find((c) => c.identifier === chainKey);
    const chain = chainMeta ? chainMeta.viemChain : arcTestnet;

    const transportUrl = `${clientUrl}${path}`;
    const transport = toModularTransport(transportUrl, clientKey) as Transport;

    const publicClient = createPublicClient({ chain, transport });
    const bundlerClient = createBundlerClient({ chain, transport });

    return { publicClient, bundlerClient, chain };
  }, [clientUrl, clientKey, isConfigured]);

  // Load session from storage and resolve on mount
  useEffect(() => {
    let active = true;

    async function initSession() {
      if (typeof window === "undefined") return;

      const storedUsername = localStorage.getItem("circle_username") || "";
      const storedCred = localStorage.getItem("circle_credential");

      if (!storedUsername || !storedCred || !isConfigured) {
        if (active) {
          setIsReady(true);
        }
        return;
      }

      let parsedCred: P256Credential | null = null;
      try {
        parsedCred = JSON.parse(storedCred);
      } catch (err) {
        console.error("Failed to parse stored credential:", err);
      }

      if (!parsedCred) {
        if (active) {
          setIsReady(true);
        }
        return;
      }

      setIsInitializing(true);
      try {
        const { publicClient } = getClients("Arc_Testnet");
        const acct = await toCircleSmartAccount({
          client: publicClient as Client,
          owner: toWebAuthnAccount({ credential: parsedCred }),
          name: storedUsername,
        });

        if (active) {
          setUsername(storedUsername);
          setCredential(parsedCred);
          setWalletAddress(acct.address);
        }
      } catch (err) {
        console.error("Failed to resolve modular wallet on mount:", err);
        // Clean up bad session
        localStorage.removeItem("circle_credential");
        localStorage.removeItem("circle_username");
      } finally {
        if (active) {
          setIsInitializing(false);
          setIsReady(true);
        }
      }
    }

    void initSession();

    return () => {
      active = false;
    };
  }, [isConfigured, getClients]);

  // Passkey actions
  const registerPasskey = useCallback(async (newUser: string) => {
    if (!passkeyTransport) throw new Error("Passkey transport not initialized.");
    const trimmed = newUser.trim();
    if (!trimmed) throw new Error("Username cannot be empty.");

    const cred = await toWebAuthnCredential({
      transport: passkeyTransport,
      mode: WebAuthnMode.Register,
      username: trimmed,
    });

    const { publicClient } = getClients("Arc_Testnet");
    const acct = await toCircleSmartAccount({
      client: publicClient as Client,
      owner: toWebAuthnAccount({ credential: cred }),
      name: trimmed,
    });

    localStorage.setItem("circle_credential", JSON.stringify(cred));
    localStorage.setItem("circle_username", trimmed);
    
    setCredential(cred);
    setUsername(trimmed);
    setWalletAddress(acct.address);
    setIsReady(true);
  }, [passkeyTransport, getClients]);

  const loginWithPasskey = useCallback(async (existingUser?: string) => {
    if (!passkeyTransport) throw new Error("Passkey transport not initialized.");
    
    const resolvedUser = existingUser?.trim() || localStorage.getItem("circle_username") || "";
    if (!resolvedUser) throw new Error("Username is required to find passkey.");

    const cred = await toWebAuthnCredential({
      transport: passkeyTransport,
      mode: WebAuthnMode.Login,
    });

    const { publicClient } = getClients("Arc_Testnet");
    const acct = await toCircleSmartAccount({
      client: publicClient as Client,
      owner: toWebAuthnAccount({ credential: cred }),
      name: resolvedUser,
    });

    localStorage.setItem("circle_credential", JSON.stringify(cred));
    localStorage.setItem("circle_username", resolvedUser);

    setCredential(cred);
    setUsername(resolvedUser);
    setWalletAddress(acct.address);
    setIsReady(true);
  }, [passkeyTransport, getClients]);

  const clearSession = useCallback(() => {
    localStorage.removeItem("circle_credential");
    localStorage.removeItem("circle_username");
    setCredential(null);
    setUsername(null);
    setWalletAddress(null);
  }, []);

  // Client-Side Transaction Submitting.
  // Matches Circle's official reference: sendUserOperation with account, calls, paymaster:true only.
  // Circle's bundler auto-handles all gas estimation when paymaster:true is set.
  const executeTransaction = useCallback(async (
    calls: { to: Hex; data: Hex; value?: bigint }[],
    _sponsorGas: boolean = true,
    chainKey: string = "Arc_Testnet"
  ) => {
    if (!credential || !username) {
      throw new Error("No active smart account session. Register or login first.");
    }

    const { publicClient, bundlerClient } = getClients(chainKey);

    const smartAccount = await toCircleSmartAccount({
      client: publicClient as Client,
      owner: toWebAuthnAccount({ credential }),
      name: username,
    });

    // Use Circle's gas price oracle — Arc Testnet bundler requires >= 1 gwei maxPriorityFeePerGas.
    // Viem's default fee estimation returns ~0.002 gwei which the bundler rejects.
    // We only set gas PRICES here; gas LIMITS are left to the bundler to auto-estimate.
    const gasPrices = await getUserOperationGasPrice(publicClient as Client);
    const maxFeePerGas = BigInt(gasPrices.medium.maxFeePerGas);
    const maxPriorityFeePerGas = BigInt(gasPrices.medium.maxPriorityFeePerGas);

    const userOpHash = await bundlerClient.sendUserOperation({
      account: smartAccount,
      calls,
      paymaster: true,
      maxFeePerGas,
      maxPriorityFeePerGas,
      // Do NOT set verificationGasLimit / callGasLimit / preVerificationGas manually.
      // Manual overrides invalidate the bundler's paymasterData signature (causes AA23).
    });

    const { receipt } = await bundlerClient.waitForUserOperationReceipt({
      hash: userOpHash,
    });

    return {
      userOpHash,
      txHash: receipt.transactionHash,
    };
  }, [credential, username, getClients]);

  // Client-Side Contract Reading Helper
  const readOnChain = useCallback(async (
    abi: Abi,
    address: Hex,
    functionName: string,
    args: readonly unknown[],
    chainKey: string = "Arc_Testnet"
  ) => {
    const { publicClient } = getClients(chainKey);
    return publicClient.readContract({
      abi,
      address,
      functionName,
      args,
    });
  }, [getClients]);

  const session = useMemo<SdkSession | null>(() => {
    if (!username || !credential || !walletAddress) return null;
    return {
      username,
      credential,
      walletAddress,
    };
  }, [username, credential, walletAddress]);

  return (
    <CircleSDKContext.Provider
      value={{
        isReady,
        isInitializing,
        session,
        walletAddress,
        username,
        registerPasskey,
        loginWithPasskey,
        clearSession,
        executeTransaction,
        readOnChain,
      }}
    >
      {children}
    </CircleSDKContext.Provider>
  );
}

export function useCircleSDK() {
  const ctx = useContext(CircleSDKContext);
  if (!ctx) {
    throw new Error("useCircleSDK must be used inside <CircleSDKProvider>");
  }
  return ctx;
}