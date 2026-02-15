"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type PaymentFlowStatus = "idle" | "loading" | "success" | "error";

export interface PaymentParams {
  planId: string;
  userId: string;
  successUrl?: string;
}

export interface PaymentContextValue {
  // Query params
  params: PaymentParams | null;
  setParams: (params: PaymentParams) => void;
  
  // Payment flow state
  status: PaymentFlowStatus;
  setStatus: (status: PaymentFlowStatus) => void;
  error: string | null;
  setError: (error: string | null) => void;
  
  // Transaction data
  transactionHash: string | null;
  setTransactionHash: (hash: string | null) => void;
  
  // Wallet connection
  isWalletConnected: boolean;
  setIsWalletConnected: (connected: boolean) => void;
  walletType: "circle" | "privy" | null;
  setWalletType: (type: "circle" | "privy" | null) => void;
  
  // Helper methods
  reset: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const PaymentContext = createContext<PaymentContextValue | null>(null);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useState<PaymentParams | null>(null);
  const [status, setStatus] = useState<PaymentFlowStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletType, setWalletType] = useState<"circle" | "privy" | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setTransactionHash(null);
  }, []);

  // Auto-detect wallet connection based on Circle SDK session or Privy
  useEffect(() => {
    if (walletType === "circle" || walletType === "privy") {
      setIsWalletConnected(true);
    } else {
      setIsWalletConnected(false);
    }
  }, [walletType]);

  return (
    <PaymentContext.Provider
      value={{
        params,
        setParams,
        status,
        setStatus,
        error,
        setError,
        transactionHash,
        setTransactionHash,
        isWalletConnected,
        setIsWalletConnected,
        walletType,
        setWalletType,
        reset,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePayment(): PaymentContextValue {
  const ctx = useContext(PaymentContext);
  if (!ctx) {
    throw new Error("usePayment must be used inside <PaymentProvider>");
  }
  return ctx;
}
