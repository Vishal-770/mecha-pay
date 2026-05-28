"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { formatUnits, parseUnits, createPublicClient, http, encodeFunctionData } from "viem";
import { arcTestnet } from "@/lib/bridge_config";
import { SUBSCRIPTION_GATEWAY_ADDRESS, ARC_USDC_ADDRESS } from "@/lib/subscription";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowDownUp,
  ChevronRight,
  ExternalLink,
  Zap,
  Lock,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import BridgeUSDC from "@/components/BridgeUSDC";
import { ModeToggle } from "@/components/ModeToggle";

/* ── Types ── */
interface Tier {
  id: string;
  tierId: string;
  price: string;
  label: string;
  active: boolean;
}

interface Plan {
  id: string;
  planId: string;
  duration: string;
  active: boolean;
  tiers: Tier[];
  seller: {
    id: string;
  };
  metadata: {
    name?: string;
    description?: string;
    brand?: { name?: string; website?: string };
    tiers?: Array<{
      label: string;
      price: string;
      features: Array<{ title: string; description: string }>;
    }>;
  } | null;
}

type TierTxStatus = "idle" | "subscribing" | "success" | "error";

/* ── Helpers ── */
function humanDuration(s: string) {
  const sec = Number(s);
  const d = Math.floor(sec / 86400);
  if (d >= 1) return `${d} day${d !== 1 ? "s" : ""}`;
  const h = Math.floor(sec / 3600);
  if (h >= 1) return `${h}h`;
  return `${Math.max(Math.floor(sec / 60), 1)}m`;
}

const trunc   = (v: string) => `${v.slice(0, 6)}…${v.slice(-4)}`;
const fmt6    = (v: string) =>
  Number(formatUnits(BigInt(v), 6)).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/* ══════════════════════════════════════════════════════ */
export default function PaymentPage() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { session, executeTransaction, isReady, clearSession } = useCircleSDK();

  const planId      = params.planId as string;
  const userId      = searchParams.get("userId") ?? "";
  const redirectUrl = searchParams.get("redirectUrl") ?? "";

  /* ── State ── */
  const [plan, setPlan]           = useState<Plan | null>(null);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [wallet, setWallet]           = useState<{ id: string; address: string; balance: string } | null>(null);

  // Per-tier tx state
  const [tierStatus, setTierStatus] = useState<Record<string, TierTxStatus>>({});
  const [tierError, setTierError]   = useState<Record<string, string>>({});
  const [subscription, setSubscription] = useState<{
    status: "ACTIVE" | "EXPIRED";
    remainingSeconds: number;
    lastEndTime: string;
    lastTierId?: string;
    tierIds?: string[];
  } | null>(null);

  // Success state — which tier was just purchased
  const [succeededTier, setSucceededTier] = useState<Tier | null>(null);
  const [countdown, setCountdown]         = useState(3);

  /* ── Redirect countdown after success ── */
  useEffect(() => {
    if (!succeededTier) return;
    setCountdown(3);
    const tick = setInterval(() => {
      setCountdown(p => {
        if (p <= 1) {
          clearInterval(tick);
          const dest = redirectUrl
            ? decodeURIComponent(redirectUrl)
            : "/dashboard/subscriptions";
          router.replace(dest);
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [succeededTier, redirectUrl, router]);

  /* ── Load plan ── */
  useEffect(() => {
    if (!planId) return;
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/payment/plan/${planId}`);
        if (!res.ok) throw new Error("Plan not found in registry");
        const data = await res.json();
        setPlan(data.plan as Plan);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load plan");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [planId]);

  /* ── Load wallet ── */
  const { data: walletBalance = "0", refetch: refetchWalletBalance, isLoading: walletLoading } = useQuery({
    queryKey: ["walletBalance", session?.walletAddress],
    queryFn: async () => {
      if (!session?.walletAddress) return "0";
      const publicClient = createPublicClient({
        chain: arcTestnet,
        transport: http(arcTestnet.rpcUrls.default.http[0]),
      });
      const balance = await publicClient.getBalance({
        address: session.walletAddress as `0x${string}`,
      });
      return formatUnits(balance, 18);
    },
    enabled: !!session?.walletAddress,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  useEffect(() => {
    if (!session?.walletAddress) {
      setWallet(null);
      return;
    }
    setWallet({
      id: "Arc_Testnet",
      address: session.walletAddress,
      balance: walletBalance,
    });
  }, [session?.walletAddress, walletBalance]);

  /* ── Check existing subscription ── */
  useEffect(() => {
    if (!planId) return;
    if (!userId && !wallet?.address) return;
    const checkSub = async () => {
      try {
        const queryParam = userId
          ? `userId=${encodeURIComponent(userId)}`
          : `subscriber=${encodeURIComponent(wallet?.address ?? "")}`;
        const res = await fetch(`/api/subscription/my-subscriptions/${planId}?${queryParam}`);
        if (res.ok) {
          const data = await res.json();
          setSubscription(data.subscription);
        } else {
          setSubscription(null);
        }
      } catch {
        setSubscription(null);
      }
    };
    void checkSub();
  }, [wallet?.address, planId, userId]);

  const isOwner = wallet?.address.toLowerCase() === plan?.seller?.id?.toLowerCase();
  const isActiveSub = subscription?.status === "ACTIVE" && (subscription?.remainingSeconds ?? 0) > 0;

  /* ── Per-tier payment ── */
  const handleTierPayment = async (tier: Tier) => {
    if (!session || !wallet || !plan) return;

    const tid = tier.id;
    setTierError(p => ({ ...p, [tid]: "" }));
    setTierStatus(p => ({ ...p, [tid]: "subscribing" }));

    try {
      const erc20Abi = [
        {
          name: "approve",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" }
          ],
          outputs: [{ name: "", type: "bool" }]
        }
      ] as const;

      const subscriptionGatewayAbi = [
        {
          name: "subscribe",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "planId", type: "bytes32" },
            { name: "tierId", type: "uint256" },
            { name: "buyerData", type: "string" }
          ],
          outputs: []
        }
      ] as const;

      const requiredAmount = BigInt(tier.price);
      
      const approveData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`, requiredAmount],
      });

      const subscribeData = encodeFunctionData({
        abi: subscriptionGatewayAbi,
        functionName: "subscribe",
        args: [
          plan.planId as `0x${string}`,
          BigInt(tier.tierId),
          userId || wallet.address
        ],
      });

      const calls = [
        {
          to: ARC_USDC_ADDRESS as `0x${string}`,
          data: approveData,
        },
        {
          to: SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`,
          data: subscribeData,
        }
      ];

      await executeTransaction(calls, false, "Arc_Testnet");
      void refetchWalletBalance();

      // Aggressive Polling for Indexer Sync
      setTierStatus(p => ({ ...p, [tid]: "success" }));
      
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const queryParam = userId
            ? `userId=${encodeURIComponent(userId)}`
            : `subscriber=${encodeURIComponent(wallet.address)}`;
          const res = await fetch(`/api/subscription/my-subscriptions/${planId}?${queryParam}`);
          if (res.ok) {
            const data = await res.json();
            if (data.subscription?.status === "ACTIVE") {
              clearInterval(poll);
              setSucceededTier(tier);
              setSubscription(data.subscription);
            }
          }
        } catch { /* continue */ }
        
        if (attempts > 30) { // 60 seconds max
          clearInterval(poll);
          // If still not found, we'll just let the success screen show anyway
          setSucceededTier(tier);
        }
      }, 2000);

    } catch (err) {
      setTierStatus(p => ({ ...p, [tid]: "error" }));
      setTierError(p => ({
        ...p,
        [tid]: err instanceof Error ? err.message : "Transaction failed",
      }));
    }
  };

  const activeTiers = plan?.tiers.filter(t => t.active) ?? [];
  const brandName = plan?.metadata?.brand?.name;
  const planName  = plan?.metadata?.name ?? "Subscription Protocol";

  /* ── Loading ── */
  if (!isReady || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground animate-pulse font-mono">
          Syncing Registry…
        </p>
      </div>
    );
  }

  /* ── Load error ── */
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="text-destructive">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-destructive">Registry Vault Fault</p>
              <h2 className="text-xl font-extrabold tracking-tight">Plan Not Found</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">{loadError}</p>
            </div>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full h-10 font-bold text-xs uppercase tracking-wider rounded-md border-border hover:bg-muted"
          >
            Retry Registry Link
          </Button>
        </div>
      </div>
    );
  }

  /* ── Success screen ── */
  if (succeededTier) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="h-12 w-12 flex items-center justify-center text-primary">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
                Payment Settled
              </p>
              <h2 className="text-2xl font-extrabold tracking-tight">Subscription Active</h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Thank you for your payment. Your subscription credentials have been registered on Arc Testnet.
              </p>
            </div>
          </div>

          <div className="divide-y divide-border/30 border-t border-b border-border/30 text-xs py-2 max-w-sm mx-auto">
            <div className="py-3 flex justify-between">
              <span className="text-muted-foreground font-medium">Product</span>
              <span className="font-semibold text-foreground">{planName}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-muted-foreground font-medium">Billing Plan</span>
              <span className="font-semibold text-foreground">{succeededTier.label}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-muted-foreground font-medium">Amount Paid</span>
              <span className="font-semibold text-foreground font-mono">${fmt6(succeededTier.price)} USDC</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-muted-foreground font-medium">Billing Cycle</span>
              <span className="font-semibold text-foreground">{plan ? humanDuration(plan.duration) : "—"}</span>
            </div>
          </div>

          <div className="space-y-4 max-w-sm mx-auto">
            <div className="h-[2px] bg-muted overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-out" 
                style={{ width: `${(countdown / 3) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>Redirecting</span>
              <span className="font-bold font-mono text-foreground">{countdown}s</span>
            </div>
          </div>

          <div className="pt-4">
            <Link 
              href={redirectUrl ? decodeURIComponent(redirectUrl) : "/dashboard/subscriptions"}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
            >
              Continue to Application <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main UI ── */
  return (
    <main className="min-h-screen bg-background text-foreground py-12 md:py-24 px-6 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
        
        {/* Top Header / Nav */}
        <div className="flex items-center justify-between pb-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <Zap className="h-4 w-4 text-foreground fill-foreground/10" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] font-sans text-foreground">Mecha Pay</span>
          </Link>
          <div className="flex items-center gap-4">
            {session && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Connected</span>
                </div>
                <span className="h-2.5 w-px bg-border/30" />
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to log out?")) {
                      clearSession();
                    }
                  }}
                  className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
            <ModeToggle />
          </div>
        </div>

        {/* Brand & Plan Details Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            {brandName && (
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {brandName}
              </span>
            )}
            {brandName && plan?.metadata?.brand?.website && (
              <a
                href={plan.metadata.brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1 transition-colors"
              >
                Visit Site <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{planName}</h1>
          {plan?.metadata?.description && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {plan.metadata.description}
            </p>
          )}
        </div>

        {/* Billing Overview Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-t border-b border-border/30 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Billing Period</span>
            <p className="font-semibold text-foreground text-sm">{plan ? humanDuration(plan.duration) : "—"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Settlement Token</span>
            <p className="font-semibold text-foreground text-sm">USDC (ERC-20)</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Network</span>
            <div className="flex items-center gap-1.5 text-foreground font-semibold text-sm">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Arc Testnet</span>
            </div>
          </div>
        </div>

        {/* Wallet / Payment Method Info */}
        <div className="space-y-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
            Payment Method
          </h2>

          {!session ? (
            <div className="py-12 text-center space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-bold uppercase tracking-widest text-foreground">Secure Sign-In Required</p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Connect your secure developer or user wallet to verify credentials and complete your payment on Arc Testnet.
                </p>
              </div>
              <Button
                onClick={() => {
                  const here = `${window.location.pathname}${window.location.search}`;
                  router.push(`/login?redirect=${encodeURIComponent(here)}`);
                }}
                className="px-8 h-10 text-[10px] font-bold uppercase tracking-wider rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Active Wallet Balance */}
              <div className="space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Your Balance</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold font-mono tracking-tight text-foreground">
                    {walletLoading ? "…" : wallet ? Number(wallet.balance).toFixed(2) : "0.00"}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">USDC</span>
                </div>
                <p className="text-[11px] font-mono text-muted-foreground/60">
                  Address: {wallet ? trunc(wallet.address) : "—"}
                </p>
              </div>

              {/* Top Up / Bridge */}
              <div className="space-y-3 sm:border-l sm:border-border/20 sm:pl-8 flex flex-col justify-between">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Funding Pipeline</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Deposit or bridge canonical USDC instantly to your Arc blockchain wallet set.</p>
                </div>
                <div className="pt-2">
                  <Sheet>
                     <SheetTrigger asChild>
                       <button className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline text-left flex items-center gap-1.5 transition-colors cursor-pointer">
                         Bridge USDC <ChevronRight className="h-3.5 w-3.5" />
                       </button>
                     </SheetTrigger>
                     <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-background border-l border-border/30">
                       <SheetHeader>
                         <SheetTitle>Bridge USDC</SheetTitle>
                         <SheetDescription className="text-xs">Bridge canonical USDC instantly to your Arc blockchain wallet set.</SheetDescription>
                       </SheetHeader>
                       <div className="mt-6">
                         <BridgeUSDC isCompact={true} defaultDestChain="Arc_Testnet" />
                       </div>
                     </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Existing Alert Statuses (Left-Border Bar Layout) */}
        {isActiveSub && (
          <div className="border-l-2 border-blue-500 pl-4 py-2 space-y-1 text-blue-500 transition-all">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-wider">Active Subscription Found</p>
            </div>
            <p className="text-xs leading-relaxed">
              You have an active subscription for this plan. Remaining cycle duration:{" "}
              <span className="font-bold font-mono">{humanDuration(String(subscription?.remainingSeconds ?? 0))}</span>
            </p>
          </div>
        )}

        {isOwner && (
          <div className="border-l-2 border-primary pl-4 py-2 space-y-1 text-primary transition-all">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-wider">Ownership Detected</p>
            </div>
            <p className="text-xs leading-relaxed">
              You are the creator of this protocol contract. Subscription actions are deactivated for the owner address.
            </p>
          </div>
        )}

        {/* Tier Selection (Open Stack separated by border rows) */}
        <div className="space-y-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
            Select Subscription Tier
          </h2>

          {activeTiers.length === 0 ? (
            <p className="text-xs text-muted-foreground">No active tiers are configured in the plan registry.</p>
          ) : (
            <div className="divide-y divide-border/30 border-t border-b border-border/30">
              {activeTiers.map(tier => {
                const st = tierStatus[tier.id] ?? "idle";
                const err = tierError[tier.id];
                const isInsuf = wallet
                  ? Number(wallet.balance) < Number(formatUnits(BigInt(tier.price), 6))
                  : false;
                const busy = st === "subscribing";
                const succeeded = st === "success";

                const metaTier = plan?.metadata?.tiers?.find(mt => mt.label === tier.label);
                const tierFeatures = metaTier?.features ?? [];
                const isThisTierActive = isActiveSub && (subscription?.tierIds?.includes(tier.tierId) || subscription?.lastTierId === tier.tierId);

                return (
                  <div
                    key={tier.id}
                    className={cn(
                      "py-8 transition-all relative flex flex-col md:flex-row md:items-start justify-between gap-8",
                      isInsuf && !succeeded && "opacity-75"
                    )}
                  >
                    <div className="space-y-4 flex-1">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-lg font-bold text-foreground leading-tight">{tier.label}</h3>
                          <span className="text-[9px] font-bold bg-muted border border-border/40 rounded px-1.5 py-0.5 text-muted-foreground uppercase tracking-widest font-mono">
                            ID: {tier.tierId}
                          </span>
                          {succeeded && (
                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest font-mono flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 animate-pulse" /> Purchased
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Access for {humanDuration(plan?.duration ?? "0")} per billing cycle
                        </p>
                      </div>

                      {/* features list */}
                      {tierFeatures.length > 0 && (
                        <div className="space-y-2 pt-2">
                          {tierFeatures.map((f, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground/90 leading-tight">{f.title}</p>
                                {f.description && (
                                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                                    {f.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {err && (
                        <div className="text-xs text-destructive flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5" /> {err}
                        </div>
                      )}
                    </div>

                    {/* Price & Action button */}
                    <div className="flex flex-col md:items-end justify-between gap-4 min-w-[150px] shrink-0 md:self-stretch">
                      <div className="md:text-right">
                        <p className="text-3xl font-bold font-mono text-foreground leading-none">${fmt6(tier.price)}</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mt-1">USDC / Cycle</p>
                      </div>

                      <div className="w-full">
                        {isOwner ? (
                          <div className="text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 bg-primary/5 py-2.5 rounded-md text-center font-sans">
                            Owner
                          </div>
                        ) : isThisTierActive ? (
                          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-500 border border-blue-500/20 bg-blue-500/5 py-2.5 rounded-md text-center font-sans">
                            Active
                          </div>
                        ) : !session ? null : succeeded ? (
                          <div className="text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 bg-primary/5 py-2.5 rounded-md text-center animate-pulse font-sans">
                            Syncing…
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleTierPayment(tier)}
                            disabled={busy || !wallet || isInsuf}
                            className={cn(
                              "w-full h-10 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all shadow-none font-sans",
                              isInsuf 
                                ? "bg-muted/50 border border-border/20 text-muted-foreground cursor-not-allowed" 
                                : "bg-primary text-primary-foreground hover:opacity-90"
                            )}
                          >
                            {busy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : isInsuf ? (
                              "Insufficient USDC"
                            ) : (
                              "Purchase Tier"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Context Metadata Panel */}
        {(userId || redirectUrl) && (
          <div className="space-y-4 pt-6 border-t border-border/30">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Checkout Metadata
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              {userId && (
                <div className="space-y-1.5">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">User Context ID</p>
                  <p className="font-mono text-foreground break-all">{userId}</p>
                </div>
              )}
              {redirectUrl && (
                <div className="space-y-1.5">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Redirect Handshake</p>
                  <p className="font-mono text-foreground truncate">{decodeURIComponent(redirectUrl)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Secure Verified References */}
        <div className="pt-8 border-t border-border/30 flex flex-col items-center gap-2 text-center text-muted-foreground/60">
          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-widest">
            <span>Secure Connection</span>
            <span className="h-2.5 w-px bg-border/40" />
            <span>USDC Gas-Paid</span>
            <span className="h-2.5 w-px bg-border/40" />
            <span>Circle W3S</span>
          </div>
          <p className="text-[9px] text-muted-foreground/40 uppercase tracking-widest">
            Verified Mecha Payment Gateway
          </p>
        </div>

      </div>
    </main>
  );
}
