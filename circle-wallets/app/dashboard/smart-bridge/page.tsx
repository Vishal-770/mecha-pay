"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createPublicClient, http, formatUnits, type EIP1193Provider } from "viem";
import Image from "next/image";
import {
  createUnifiedBalanceKitContext,
  deposit,
  spend,
  estimateSpend,
} from "@circle-fin/unified-balance-kit";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import { SUPPORTED_CHAINS } from "@/lib/bridge_config";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Wallet,
  RefreshCw,
  Copy,
  Check,
  LogOut,
  ExternalLink,
  Loader2,
  ArrowRight,
  CircleDot,
  CheckCircle2,
  AlertCircle,
  Info,
  Check as CheckIcon,
  Search,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const erc20Abi = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
] as const;

const GATEWAY_KIT_ID: Record<string, string> = {
  Base_Sepolia: "Base_Sepolia",
  Avalanche_Fuji: "Avalanche_Fuji",
  Arbitrum_Sepolia: "Arbitrum_Sepolia",
  Ethereum_Sepolia: "Ethereum_Sepolia",
  Optimism_Sepolia: "Optimism_Sepolia",
  Polygon_Amoy_Testnet: "Polygon_Amoy_Testnet",
  Unichain_Sepolia: "Unichain_Sepolia",
  HyperEVM_Testnet: "HyperEVM_Testnet",
  Sei_Testnet: "Sei_Testnet",
  Sonic_Testnet: "Sonic_Testnet",
};

const GATEWAY_DISPLAY: Record<string, string> = {
  Base_Sepolia: "Base Sepolia",
  Avalanche_Fuji: "Avalanche Fuji",
  Arbitrum_Sepolia: "Arbitrum Sepolia",
  Ethereum_Sepolia: "Ethereum Sepolia",
  Optimism_Sepolia: "OP Sepolia",
  Polygon_Amoy_Testnet: "Polygon Amoy",
  Unichain_Sepolia: "Unichain Sepolia",
  HyperEVM_Testnet: "HyperEVM Testnet",
  Sei_Testnet: "Sei Atlantic-2",
  Sonic_Testnet: "Sonic Testnet",
};

type StepStatus = "idle" | "pending" | "done" | "error";

interface BridgeStep {
  label: string;
  status: StepStatus;
  detail?: string;
}

interface ChainBalanceInfo {
  chainIdentifier: string;
  chainName: string;
  icon: string;
  nativeSymbol: string;
  nativeBalance: string;
  usdcBalance: string;
  status: "success" | "error" | "loading";
}

interface RouteEstimate {
  chainIdentifier: string;
  fee: string;
  net: string;
  status: "success" | "error" | "loading";
}

const kitContext = createUnifiedBalanceKitContext();

type KitChain = Parameters<typeof deposit>[1]["from"]["chain"];

type LooseEip1193Provider = {
  request: (args: { method: string; params?: unknown }) => Promise<unknown>;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener: (event: string, listener: (...args: unknown[]) => void) => void;
};

function getReadOnlyProviderForChain(
  walletProvider: LooseEip1193Provider,
  targetChainId: number,
  rpcUrl: string
): LooseEip1193Provider {
  const request: LooseEip1193Provider["request"] = async ({ method, params }) => {
    if (method === "eth_chainId") {
      return `0x${targetChainId.toString(16)}`;
    }
    if (method === "net_version") {
      return String(targetChainId);
    }

    const walletMethods = [
      "eth_accounts",
      "eth_requestAccounts",
      "personal_sign",
      "eth_sign",
      "eth_signTypedData",
      "eth_signTypedData_v4",
      "eth_sendTransaction",
      "eth_sendRawTransaction",
    ];

    const methodName = String(method);
    if (walletMethods.includes(methodName)) {
      return walletProvider.request({ method: methodName, params });
    }

    // Forward all other JSON-RPC requests to the target chain's public RPC
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: methodName,
        params: params ?? [],
      }),
    });
    const json = await res.json();
    if (json.error) {
      throw new Error(json.error.message);
    }
    return json.result;
  };

  return {
    request,
    on: (event, listener) => walletProvider.on(event, listener),
    removeListener: (event, listener) => walletProvider.removeListener(event, listener),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SmartBridgePage() {
  const { login, logout, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const activeWallet = wallets[0];
  const eoaAddress = activeWallet?.address;

  const { walletAddress: scaAddress, isReady: sdkReady } = useCircleSDK();

  const [balances, setBalances] = useState<ChainBalanceInfo[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const [amount, setAmount] = useState("10");
  const [routes, setRoutes] = useState<RouteEstimate[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [isEstimating, setIsEstimating] = useState(false);
  
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeTxHash, setBridgeTxHash] = useState<string | null>(null);
  const [bridgeError, setBridgeError] = useState<string | null>(null);
  const [steps, setSteps] = useState<BridgeStep[]>([]);

  const fetchBalances = useCallback(async (address: string) => {
    await Promise.resolve();
    setIsFetching(true);
    setBalances(
      SUPPORTED_CHAINS.map((chain) => ({
        chainIdentifier: chain.identifier,
        chainName: chain.name,
        icon: chain.icon,
        nativeSymbol: chain.nativeSymbol,
        nativeBalance: "0.00",
        usdcBalance: "0.00",
        status: "loading",
      }))
    );

    const results = await Promise.all(
      SUPPORTED_CHAINS.map(async (chain) => {
        try {
          const publicClient = createPublicClient({
            chain: chain.viemChain,
            transport: http(chain.viemChain.rpcUrls.default.http[0]),
          });

          const nativeBalance = await publicClient.getBalance({
            address: address as `0x${string}`,
          });

          let usdcBalance = 0n;
          if (chain.identifier === "Arc_Testnet") {
            usdcBalance = nativeBalance;
          } else if (chain.usdcAddress) {
            usdcBalance = ((await publicClient
              .readContract({
                address: chain.usdcAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: "balanceOf",
                args: [address as `0x${string}`],
              })
              .catch(() => 0n)) as bigint);
          }

          return {
            chainIdentifier: chain.identifier,
            chainName: chain.name,
            icon: chain.icon,
            nativeSymbol: chain.nativeSymbol,
            nativeBalance: formatUnits(nativeBalance, 18),
            usdcBalance: formatUnits(usdcBalance, chain.decimals),
            status: "success" as const,
          };
        } catch {
          return {
            chainIdentifier: chain.identifier,
            chainName: chain.name,
            icon: chain.icon,
            nativeSymbol: chain.nativeSymbol,
            nativeBalance: "0.00",
            usdcBalance: "0.00",
            status: "error" as const,
          };
        }
      })
    );
    setBalances(results);
    setIsFetching(false);
  }, []);

  useEffect(() => {
    if (!eoaAddress) return;
    const id = setTimeout(() => {
      void fetchBalances(eoaAddress);
    }, 0);
    return () => clearTimeout(id);
  }, [eoaAddress, fetchBalances]);

  const totalUsdc = useMemo(
    () =>
      balances
        .reduce((sum, item) => sum + parseFloat(item.usdcBalance || "0"), 0)
        .toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    [balances]
  );

  const handleCopy = () => {
    if (!eoaAddress) return;
    void navigator.clipboard.writeText(eoaAddress);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const buildAdapter = useCallback(async () => {
    if (!activeWallet) throw new Error("No wallet connected");
    const provider = (await activeWallet.getEthereumProvider()) as LooseEip1193Provider;
    return createViemAdapterFromProvider({
      provider: provider as unknown as EIP1193Provider,
    });
  }, [activeWallet]);

  const ensureWalletChain = useCallback(async (chainIdentifier: string) => {
    if (!activeWallet) throw new Error("No wallet connected");
    const chainInfo = SUPPORTED_CHAINS.find((c) => c.identifier === chainIdentifier);
    if (!chainInfo) throw new Error(`Unknown chain: ${chainIdentifier}`);
    
    const provider = (await activeWallet.getEthereumProvider()) as LooseEip1193Provider;
    const targetChainId = chainInfo.viemChain.id;
    const chainIdHex = `0x${targetChainId.toString(16)}`;

    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError: unknown) {
      const err = switchError as { code?: number };
      if (err.code === 4902) {
        const v = chainInfo.viemChain;
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainIdHex,
              chainName: v.name,
              nativeCurrency: v.nativeCurrency,
              rpcUrls: v.rpcUrls.default.http,
              blockExplorerUrls: v.blockExplorers
                ? [v.blockExplorers.default.url]
                : undefined,
            },
          ],
        });
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        });
      } else {
        throw switchError;
      }
    }
  }, [activeWallet]);

  const ensureWalletChainAdded = useCallback(async (chainIdentifier: string) => {
    if (!activeWallet) throw new Error("No wallet connected");
    const chainInfo = SUPPORTED_CHAINS.find((c) => c.identifier === chainIdentifier);
    if (!chainInfo) throw new Error(`Unknown chain: ${chainIdentifier}`);

    const provider = (await activeWallet.getEthereumProvider()) as LooseEip1193Provider;
    const v = chainInfo.viemChain;
    const chainIdHex = `0x${v.id.toString(16)}`;

    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: chainIdHex,
          chainName: v.name,
          nativeCurrency: v.nativeCurrency,
          rpcUrls: v.rpcUrls.default.http,
          blockExplorerUrls: v.blockExplorers ? [v.blockExplorers.default.url] : undefined,
        },
      ],
    });
  }, [activeWallet]);

  const setStep = (index: number, status: StepStatus, detail?: string) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, status, detail } : s))
    );
  };

  const handleEstimateAll = useCallback(async () => {
    if (!amount || !scaAddress || !eoaAddress || !activeWallet) return;
    
    const eligibleChains = balances.filter(
      (b) =>
        b.status === "success" &&
        GATEWAY_KIT_ID[b.chainIdentifier] &&
        parseFloat(b.usdcBalance) >= parseFloat(amount || "0")
    );

    if (eligibleChains.length === 0) {
      setBridgeError("Insufficient unified balance for this amount on any single chain.");
      return;
    }

    setIsEstimating(true);
    setBridgeError(null);
    setSelectedRoute("");
    
    setRoutes(eligibleChains.map(c => ({
      chainIdentifier: c.chainIdentifier,
      fee: "0",
      net: "0",
      status: "loading"
    })));

    try {
      const provider = (await activeWallet.getEthereumProvider()) as LooseEip1193Provider;
      
      const routePromises = eligibleChains.map(async (chainInfo) => {
        const kitChain = GATEWAY_KIT_ID[chainInfo.chainIdentifier];
        const chainConfig = SUPPORTED_CHAINS.find(c => c.identifier === chainInfo.chainIdentifier);
        if (!chainConfig) {
          return {
            chainIdentifier: chainInfo.chainIdentifier,
            fee: "0",
            net: "0",
            status: "error" as const
          };
        }

        try {
          const rpcUrl = chainConfig.viemChain.rpcUrls.default.http[0];
          const chainProvider = getReadOnlyProviderForChain(
            provider,
            chainConfig.viemChain.id,
            rpcUrl
          );
          
          const chainAdapter = await createViemAdapterFromProvider({
            provider: chainProvider as unknown as EIP1193Provider,
          });

          const estimate = await estimateSpend(kitContext, {
            amount,
            from: {
              adapter: chainAdapter,
              allocations: { amount, chain: kitChain as KitChain },
            },
            to: { adapter: chainAdapter, chain: "Arc_Testnet" },
          });

          const feeTotal = estimate.fees
            ? Object.values(estimate.fees)
                .reduce((sum: number, f: unknown) => {
                  const fee = f as { amount?: string };
                  return sum + parseFloat(fee?.amount ?? "0");
                }, 0)
                .toFixed(6)
            : "0";

          const net = (parseFloat(amount) - parseFloat(feeTotal)).toFixed(6);
          
          return {
            chainIdentifier: chainInfo.chainIdentifier,
            fee: feeTotal,
            net,
            status: "success" as const
          };
        } catch (e: unknown) {
          console.error(`Estimation failed for ${kitChain}:`, e);
          return {
            chainIdentifier: chainInfo.chainIdentifier,
            fee: "0",
            net: "0",
            status: "error" as const
          };
        }
      });

      const completedRoutes = await Promise.all(routePromises);
      
      const successfulRoutes = completedRoutes.filter(r => r.status === "success" && parseFloat(r.net) > 0);
      if (successfulRoutes.length > 0) {
        successfulRoutes.sort((a, b) => parseFloat(a.fee) - parseFloat(b.fee));
        setSelectedRoute(successfulRoutes[0].chainIdentifier);
      }
      
      setRoutes(completedRoutes);

    } catch (e: unknown) {
      const err = e as Error;
      setBridgeError(`Failed to build adapter for estimation: ${err?.message ?? String(err)}`);
      setRoutes([]);
    } finally {
      setIsEstimating(false);
    }
  }, [amount, scaAddress, eoaAddress, activeWallet, balances]);

  const handleBridge = useCallback(async () => {
    if (!selectedRoute || !amount || !scaAddress || !eoaAddress) return;

    setBridgeError(null);
    setBridgeTxHash(null);
    setIsBridging(true);

    const initialSteps: BridgeStep[] = [
      { label: "Building adapter", status: "pending" },
      { label: "Depositing into Gateway", status: "idle" },
      { label: "Spending to Arc Testnet Modular Wallet", status: "idle" },
      { label: "Confirmed on-chain", status: "idle" },
    ];
    setSteps(initialSteps);

    try {
      setStep(0, "pending", "Switching wallet network…");
      await ensureWalletChain(selectedRoute);
      
      setStep(0, "done", "Building adapter…");
      const adapter = await buildAdapter();

      const kitChain = GATEWAY_KIT_ID[selectedRoute] ?? "Ethereum_Sepolia";
      const displayChain = GATEWAY_DISPLAY[selectedRoute] ?? selectedRoute;

      // Find route fee and compute total deposit amount
      const routeInfo = routes.find(r => r.chainIdentifier === selectedRoute);
      const depositAmount = parseFloat(amount).toFixed(6);

      setStep(1, "pending", `Depositing ${depositAmount} USDC on ${displayChain}…`);
      await deposit(kitContext, {
        from: { adapter, chain: kitChain as KitChain },
        amount: depositAmount,
      });

      setStep(1, "done", `${depositAmount} USDC deposited`);

      setStep(2, "pending", "Adding Arc Testnet to wallet…");
      await ensureWalletChainAdded("Arc_Testnet");

      setStep(2, "pending", "Spending USDC to your Arc Testnet modular wallet…");
      const netAmount = routeInfo ? routeInfo.net : amount;
      const result = await spend(kitContext, {
        amount: netAmount,
        from: {
          adapter,
          allocations: { amount: depositAmount, chain: kitChain as KitChain },
        },
        to: {
          adapter,
          chain: "Arc_Testnet",
          recipientAddress: scaAddress as `0x${string}`,
        },
      });
      setStep(2, "done", `Spend submitted: ${result.txHash}`);
      setStep(3, "pending", "Waiting for Arc Testnet confirmation…");

      const arcChain = SUPPORTED_CHAINS.find((c) => c.identifier === "Arc_Testnet");
      if (!arcChain) {
        throw new Error("Arc Testnet chain config not found");
      }

      const arcClient = createPublicClient({
        chain: arcChain.viemChain,
        transport: http(arcChain.viemChain.rpcUrls.default.http[0]),
      });

      await arcClient.waitForTransactionReceipt({
        hash: result.txHash as `0x${string}`,
      });

      setStep(3, "done", "USDC sent to your Arc Testnet modular wallet");
      setBridgeTxHash(result.txHash);
    } catch (e: unknown) {
      const err = e as Error;
      setBridgeError(err?.message ?? String(err));
      setSteps((prev) =>
        prev.map((s) =>
          s.status === "pending" ? { ...s, status: "error" } : s
        )
      );
    } finally {
      setIsBridging(false);
    }
  }, [selectedRoute, amount, scaAddress, eoaAddress, buildAdapter, ensureWalletChain, ensureWalletChainAdded, routes]);

  if (!ready) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authenticated || !eoaAddress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Wallet className="h-5 w-5 text-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Connect External Wallet</h1>
            <p className="text-sm text-muted-foreground">
              Link your web3 wallet to deposit USDC and bridge it to your Arc Testnet account.
            </p>
          </div>
          <Button
            onClick={() => void login()}
            className="w-full h-11"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  const successfulRoutes = routes.filter(r => r.status === "success" && parseFloat(r.net) > 0);
  const bestRoute = successfulRoutes.length > 0 
    ? successfulRoutes.reduce((min, r) => parseFloat(r.fee) < parseFloat(min.fee) ? r : min)
    : null;

  return (
    <div className="max-w-300 mx-auto py-10 px-4 md:px-8 space-y-12">
      
      {/* ── Top Header Section ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Smart Bridge</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Deposit into Unified Balance and spend to your Arc Testnet modular wallet.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Unified Balance</p>
            <p className="text-2xl font-semibold tracking-tight">${totalUsdc} <span className="text-sm font-normal text-muted-foreground">USDC</span></p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-sm font-mono text-foreground">
                {eoaAddress.slice(0, 6)}…{eoaAddress.slice(-4)}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCopy} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                {hasCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {hasCopied ? "Copied" : "Copy"}
              </button>
              <button onClick={() => void logout()} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <LogOut className="h-3 w-3" />
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Layout: 2 Columns ────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_400px] gap-10 items-start">
        
        {/* Left Column: Asset Matrix */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium tracking-tight">Cross-Chain Balances</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void fetchBalances(eoaAddress)}
              disabled={isFetching}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-50 text-xs font-medium">Network</TableHead>
                  <TableHead className="text-xs font-medium text-right">Native Gas</TableHead>
                  <TableHead className="text-xs font-medium text-right">USDC</TableHead>
                  <TableHead className="w-25"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances.map((item) => (
                  <TableRow key={item.chainIdentifier} className="group">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={
                            item.icon.startsWith("http")
                              ? item.icon
                              : `/${item.icon.replace(/^\/+|^\.\//, "")}`
                          }
                          alt={item.chainName}
                          width={20}
                          height={20}
                          className="h-5 w-5 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://cryptologos.cc/logos/usd-coin-usdc-logo.png";
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium">{item.chainName}</p>
                          {GATEWAY_KIT_ID[item.chainIdentifier] && (
                            <p className="text-[10px] text-muted-foreground">Gateway Supported</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      {item.status === "loading" ? (
                        <span className="text-xs text-muted-foreground">...</span>
                      ) : (
                        <span className="text-sm font-mono text-muted-foreground">
                          {parseFloat(item.nativeBalance).toLocaleString(undefined, { maximumFractionDigits: 4 })} {item.nativeSymbol}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      {item.status === "loading" ? (
                        <span className="text-xs text-muted-foreground">...</span>
                      ) : (
                        <span className="text-sm font-mono font-medium">
                          ${parseFloat(item.usdcBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      {GATEWAY_KIT_ID[item.chainIdentifier] && parseFloat(item.usdcBalance || "0") > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setAmount(item.usdcBalance);
                            setRoutes([]);
                            setSelectedRoute("");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          Use Max
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right Column: Routing Engine */}
        <div className="sticky top-8 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-medium tracking-tight mb-6">Route Execution</h2>
            
            <div className="space-y-6">
              {/* Destination */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Destination Wallet</label>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                      <Wallet className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Arc Testnet Modular Wallet</span>
                  </div>
                  {scaAddress ? (
                    <span className="text-xs font-mono text-muted-foreground">{scaAddress.slice(0, 6)}…{scaAddress.slice(-4)}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Not configured</span>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex justify-between">
                  <span>Amount to Bridge</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setRoutes([]); setSelectedRoute(""); }}
                    className="w-full h-11 pl-7 pr-4 rounded-lg border border-border bg-transparent text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 px-3 text-xs"
                    onClick={() => void handleEstimateAll()}
                    disabled={isEstimating || !amount || parseFloat(amount) <= 0 || !scaAddress}
                  >
                    {isEstimating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>

              {/* Routes */}
              {routes.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <label className="text-xs font-medium text-muted-foreground">Available Routes</label>
                  <div className="space-y-2">
                    {routes.map((route) => {
                      const isBest = bestRoute?.chainIdentifier === route.chainIdentifier;
                      const isSelected = selectedRoute === route.chainIdentifier;
                      const isError = route.status === "error";
                      const isLoading = route.status === "loading";
                      const isFeasible = !isError && !isLoading && parseFloat(route.net) > 0;

                      return (
                        <div
                          key={route.chainIdentifier}
                          onClick={() => isFeasible && setSelectedRoute(route.chainIdentifier)}
                          className={`
                            flex items-center justify-between p-3 rounded-lg border transition-all
                            ${!isFeasible ? "opacity-50 bg-muted/20 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"}
                            ${isSelected ? "border-primary bg-primary/5" : "border-border bg-transparent"}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                              {isSelected && <CheckIcon className="h-2.5 w-2.5" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{GATEWAY_DISPLAY[route.chainIdentifier] ?? route.chainIdentifier}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {isBest && isFeasible && <span className="text-[10px] font-medium text-primary">Best Route</span>}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            {isLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                            ) : isError ? (
                              <span className="text-xs text-destructive">Failed</span>
                            ) : !isFeasible ? (
                              <>
                                <p className="text-[10px] font-medium text-destructive uppercase tracking-wider">Not Feasible</p>
                                <p className="text-[10px] text-muted-foreground">Fee: ${route.fee}</p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-mono font-medium">${route.net}</p>
                                <p className="text-[10px] text-muted-foreground">Fee: ${route.fee}</p>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Execution */}
              <div className="pt-4 border-t border-border">
                {sdkReady && !scaAddress && (
                  <div className="mb-4 p-3 rounded-lg bg-secondary border border-border flex items-start gap-2 text-secondary-foreground">
                    <Info className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                    <p className="text-xs">Set up a modular wallet on the Wallet page to receive funds.</p>
                  </div>
                )}

                <Button
                  className="w-full h-11 text-sm font-medium"
                  disabled={isBridging || !selectedRoute || !amount || !scaAddress}
                  onClick={() => void handleBridge()}
                >
                  {isBridging ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    <>Execute Transfer <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </div>

              {/* Status HUD */}
              {steps.length > 0 && (
                <div className="mt-4 space-y-3 bg-muted/30 p-4 rounded-lg border border-border">
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {step.status === "idle" && <CircleDot className="h-3.5 w-3.5 text-muted-foreground/40" />}
                        {step.status === "pending" && <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />}
                        {step.status === "done" && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                        {step.status === "error" && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${step.status === "idle" ? "text-muted-foreground" : "text-foreground"}`}>
                          {step.label}
                        </p>
                        {step.detail && <p className="text-[10px] font-mono text-muted-foreground truncate mt-0.5">{step.detail}</p>}
                      </div>
                    </div>
                  ))}
                  
                  {bridgeTxHash && (
                    <div className="pt-2 mt-2 border-t border-border/50">
                      <a
                        href={`https://testnet.arcscan.app/tx/${bridgeTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        View Transaction on Explorer <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {bridgeError && (
                    <div className="pt-2 mt-2 border-t border-border/50">
                      <p className="text-xs text-destructive wrap-break-word">{bridgeError}</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
