"use client";

import { useState, useEffect } from "react";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createPublicClient, http, getAddress, isAddress, encodeFunctionData } from "viem";

import { 
  ShieldCheck, 
  Settings, 
  TrendingUp, 
  Wallet, 
  RefreshCw,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  ArrowDownCircle,
  Percent,
  ShieldAlert,
  Lock
} from "lucide-react";
import { formatUnits } from "ethers";
import { SUBSCRIPTION_GATEWAY_ADDRESS, ARC_RPC_URL } from "@/lib/subscription";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const MINIMAL_ABI = [
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "feeBps",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", "type": "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

function isWalletAccount(value: unknown): value is { type: string; address?: string } {
  return !!value && typeof value === "object" && "type" in value && typeof (value as { type?: unknown }).type === "string";
}

function getAccountAddress(value: { address?: string }): string | null {
  return value.address ? value.address.toLowerCase() : null;
}

export default function AdminDashboardPage() {
  const { wallet } = useDashboardContext();
  const { executeTransaction } = useCircleSDK();
  const { user, authenticated, logout, connectWallet } = usePrivy();
  const { wallets } = useWallets();
  const connectedEOA = wallets[0]?.address; // The most recently connected/linked EOA

  const [isVerifying, setIsVerifying] = useState(true);
  const [contractOwnerAddr, setContractOwnerAddr] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Stats
  const [protocolFee, setProtocolFee] = useState<number>(0);
  const [accumulatedFees, setAccumulatedFees] = useState<string>("0");
  
  // Actions
  const [newFee, setNewFee] = useState<string>("");
  const [withdrawAddress, setWithdrawAddress] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  
  const [processing, setProcessing] = useState(false);

  // Security Guard: Check ownership via Privy EOA and Contract state
  useEffect(() => {
    const fetchRequiredOwner = async () => {
      setIsVerifying(true);
      try {
        const client = createPublicClient({
          chain: {
            id: 5042002, // Arc Testnet
            name: "Arc Testnet",
            nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
            rpcUrls: { default: { http: [ARC_RPC_URL] }, public: { http: [ARC_RPC_URL] } },
          },
          transport: http(),
        });

        const contractOwnerRaw = await client.readContract({
          address: SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`,
          abi: MINIMAL_ABI,
          functionName: "owner",
        });

        if (contractOwnerRaw && isAddress(contractOwnerRaw)) {
          setContractOwnerAddr(getAddress(contractOwnerRaw));
        }
      } catch (err) {
        console.error("Ownership fetch failed:", err);
      } finally {
        setIsVerifying(false);
      }
    };

    void fetchRequiredOwner();
  }, []);

  // Use useMemo for stable and direct ownership verification
  const isOwner = (() => {
    if (!authenticated || !user || !contractOwnerAddr) return false;

    // Use a direct string comparison for absolute certainty
    // Scan all linked accounts and wallets for ANY matching address
    const target = contractOwnerAddr.toLowerCase();
    
    const walletsList = (user.linkedAccounts || [])
      .filter((acc) => isWalletAccount(acc) && acc.type === "wallet")
      .map((acc) => getAccountAddress(acc))
      .filter((addr): addr is string => typeof addr === "string");

    if (connectedEOA) walletsList.push(connectedEOA.toLowerCase());
    if (user.wallet?.address) walletsList.push(user.wallet.address.toLowerCase());
    if (wallet?.address) walletsList.push(wallet.address.toLowerCase());

    return walletsList.some(addr => addr === target);
  })();

  const fetchStats = async () => {
    if (!isOwner) return;
    try {
      setLoading(true);
      
      const client = createPublicClient({
        chain: {
          id: 5042002, // Arc Testnet
          name: "Arc Testnet",
          nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
          rpcUrls: { default: { http: [ARC_RPC_URL] }, public: { http: [ARC_RPC_URL] } },
        },
        transport: http(),
      });

      // Get Fee BPS
      const bps = await client.readContract({
        address: SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`,
        abi: MINIMAL_ABI,
        functionName: "feeBps",
      });
      setProtocolFee(Number(bps));

      // Get Treasury Balance (fees accumulated in contract)
      const balance = await client.readContract({
        address: "0x3600000000000000000000000000000000000000" as `0x${string}`, // Arc USDC
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`],
      });
      setAccumulatedFees(balance.toString());
      
    } catch (err) {
      console.error("Failed to fetch admin metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOwner) {
      void fetchStats();
    }
  }, [isOwner, wallet?.address]);

  const handleUpdateFee = async () => {
    if (!wallet?.address || !newFee) return;
    setProcessing(true);
    setError(null);
    try {
      const subscriptionGatewayAbi = [
        {
          name: "setFee",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [{ name: "newFeeBps", type: "uint256" }],
          outputs: []
        }
      ] as const;

      const txData = encodeFunctionData({
        abi: subscriptionGatewayAbi,
        functionName: "setFee",
        args: [BigInt(newFee)],
      });

      await executeTransaction(
        [
          {
            to: SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`,
            data: txData,
          }
        ],
        false, // sponsorGas
        "Arc_Testnet" // chainKey
      );

      setProtocolFee(Number(newFee));
      setNewFee("");
      void fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!wallet?.address || !withdrawAddress || !withdrawAmount) return;
    setProcessing(true);
    setError(null);
    try {
      const amountIn6 = BigInt(Math.round(Number(withdrawAmount) * 1e6));
      
      const subscriptionGatewayAbi = [
        {
          name: "withdrawFees",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" }
          ],
          outputs: []
        }
      ] as const;

      const txData = encodeFunctionData({
        abi: subscriptionGatewayAbi,
        functionName: "withdrawFees",
        args: [withdrawAddress as `0x${string}`, amountIn6],
      });

      await executeTransaction(
        [
          {
            to: SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`,
            data: txData,
          }
        ],
        false, // sponsorGas
        "Arc_Testnet" // chainKey
      );

      setWithdrawAmount("");
      void fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setProcessing(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader />
        <p className="text-sm font-black uppercase italic">Verifying Governance Authority...</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-center px-6">
        <div className="mb-6 rounded-3xl bg-red-500/10 p-6 text-red-500 ring-1 ring-red-500/20">
          <ShieldAlert size={48} />
        </div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Access Restricted</h1>
        <p className="max-w-md text-sm text-muted-foreground font-bold leading-relaxed mb-8">
          This manual override interface is exclusive to the **Mecha Pay Protocol Owner**. 
          Your connected EOA is not authorized to access governance functions.
        </p>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-muted/50 border border-border text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Your Connected Wallet</p>
              <p className="text-xs font-mono truncate">{connectedEOA || user?.wallet?.address || "No wallet connected"}</p>
            </div>
            
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">Required Admin Wallet</p>
              <p className="text-xs font-mono text-foreground truncate">{contractOwnerAddr || "Fetching..."}</p>
            </div>
            
            <div className="flex items-start gap-2 text-left p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
              <AlertCircle size={14} className="text-orange-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-orange-500/80 leading-tight">
                CRITICAL: Only the wallet address specified above has the authority to access governance and treasury functions.
              </p>
            </div>
          </div>

          {!user?.wallet?.address ? (
            <Button 
              onClick={() => void connectWallet()}
              className="h-12 bg-primary font-black uppercase italic tracking-widest text-xs"
            >
              Connect Management Wallet
            </Button>
          ) : !isOwner && contractOwnerAddr && (
            <Button 
              variant="default" 
              onClick={() => {
                // Manually trigger a re-render/re-fetch if state is out of sync
                setIsVerifying(true);
                // The useEffect will re-run on next render if we change a dependency dummy
              }}
              className="h-12 bg-blue-600 font-black uppercase italic tracking-widest text-xs hover:bg-blue-700 shadow-xl shadow-blue-500/20"
            >
              Verify Connection
            </Button>
          )}

          {user?.wallet?.address && !isOwner && (
            <Button 
              variant="outline" 
              onClick={() => void logout()}
              className="h-12 border-primary/20 bg-primary/5 font-black uppercase italic tracking-widest text-xs hover:bg-primary/10"
            >
              Disconnect Wallet
            </Button>
          )}
          
          <Button asChild variant="ghost" className="h-10 font-bold uppercase tracking-widest text-[10px]">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold mb-1">
            <ShieldCheck size={18} />
            <span className="text-sm tracking-wider uppercase">Governance</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Protocol Administration</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Manage global parameters and treasury settlement.</p>
        </div>
        
        <button 
          onClick={() => void fetchStats()}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold hover:bg-muted transition-colors"
        >
          <RefreshCw size={16} /> Refresh Metrics
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm font-medium text-red-500">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Admin Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-3xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-primary/10 text-primary p-2.5">
              <Percent size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Fee</span>
          </div>
          <div className="mt-6 flex items-baseline gap-1">
            <p className="text-4xl font-black text-foreground">{protocolFee / 100}%</p>
            <p className="text-sm font-bold text-muted-foreground">BPS: {protocolFee}</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground font-medium">Applied to every subscription transaction.</p>
        </article>

        <article className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-blue-500/10 text-blue-500 p-2.5">
              <TrendingUp size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Protocol Revenue</span>
          </div>
          <div className="mt-6">
            <p className="text-4xl font-black text-foreground">{formatUnits(accumulatedFees, 6)} USDC</p>
            <p className="mt-2 text-xs text-muted-foreground font-medium">Total fees accumulated in protocol treasury.</p>
          </div>
        </article>

        <article className="rounded-3xl bg-linear-to-br from-primary/10 to-primary/5 p-6 border border-primary/20 shadow-xl shadow-primary/5">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-primary/20 p-2.5 text-primary">
              <Lock size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Verified Admin</span>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <div>
              <p className="text-[10px] font-black uppercase text-primary mb-1">Authenticated via Privy</p>
              <p className="text-xs font-mono text-foreground mb-1 truncate">{user?.wallet?.address}</p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <ShieldCheck size={12} /> Authorization Confirmed
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-full border-primary/20 bg-primary/5 font-black uppercase italic tracking-widest text-[10px] hover:bg-primary/20"
              onClick={() => void logout()}
            >
              Disconnect EOA
            </Button>
          </div>
        </article>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Protocol Fee Management */}
        <article className="rounded-[2.5rem] border border-border bg-card p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="rounded-2xl bg-muted p-3 text-muted-foreground">
              <Settings size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground font-black uppercase italic tracking-tighter">Update Protocol Fee</h3>
              <p className="text-xs text-muted-foreground mt-0.5 font-bold uppercase">Global parameter deployment</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground font-mono">New Fee in BPS (100 = 1%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={newFee}
                  onChange={(e) => setNewFee(e.target.value)}
                  placeholder="e.g. 250"
                  className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 rounded-lg bg-muted px-2 py-1 text-[10px] font-black uppercase text-muted-foreground">
                  MAX: 10%
                </div>
              </div>
            </div>

            <button 
              onClick={() => void handleUpdateFee()}
              disabled={processing || !newFee}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-black text-primary-foreground shadow-xl shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 uppercase italic tracking-widest"
            >
              {processing ? "Broadcasting..." : "Update Global Fee"}
              {!processing && <ChevronRight size={18} />}
            </button>
          </div>
        </article>

        {/* Treasury Management */}
        <article className="rounded-[2.5rem] border border-border bg-card p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-500">
              <ArrowDownCircle size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground font-black uppercase italic tracking-tighter">Treasury Withdrawal</h3>
              <p className="text-xs text-muted-foreground mt-0.5 font-bold uppercase">Settle protocol revenue</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground font-mono">Recipient Address</label>
              <input 
                type="text" 
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-muted-foreground/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground font-mono">Amount (USDC)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-base font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-muted-foreground/30"
                />
              </div>
            </div>

            <button 
              onClick={() => void handleWithdraw()}
              disabled={processing || !withdrawAddress || !withdrawAmount}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all disabled:opacity-50 uppercase italic tracking-widest"
            >
              {processing ? "Confirming..." : "Initiate Withdrawal"}
              {!processing && <ChevronRight size={18} />}
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
