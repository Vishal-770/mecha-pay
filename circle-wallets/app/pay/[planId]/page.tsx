"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { formatUnits } from "ethers";
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

type TierTxStatus = "idle" | "approving" | "subscribing" | "success" | "error";

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
  Number(formatUnits(v, 6)).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/* ══════════════════════════════════════════════════════ */
export default function PaymentPage() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { session, executeChallenge, isReady, clearSession } = useCircleSDK();

  const planId      = params.planId as string;
  const userId      = searchParams.get("userId") ?? "";
  const redirectUrl = searchParams.get("redirectUrl") ?? "";

  /* ── State ── */
  const [plan, setPlan]           = useState<Plan | null>(null);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [wallet, setWallet]           = useState<{ id: string; address: string; balance: string } | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  // Per-tier tx state
  const [tierStatus, setTierStatus] = useState<Record<string, TierTxStatus>>({});
  const [tierError, setTierError]   = useState<Record<string, string>>({});
  const [subscription, setSubscription] = useState<{
    status: "ACTIVE" | "EXPIRED";
    remainingSeconds: number;
    lastEndTime: string;
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
  const refreshWallet = useCallback(async () => {
    if (!session?.userToken) return;
    setWalletLoading(true);
    try {
      const res = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken: session.userToken }),
      });
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const arc = data.wallets?.find((w: any) => w.blockchain === "ARC-TESTNET");
      if (arc) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const usdc = arc.tokenBalances?.find((t: any) => t.symbol.toUpperCase() === "USDC")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ?? arc.tokenBalances?.find((t: any) => t.symbol.toUpperCase().includes("USDC"))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ?? arc.tokenBalances?.find((t: any) => t.isNative);
        setWallet({ id: arc.id, address: arc.address, balance: usdc?.amount ?? "0" });
      }
    } catch { /* ignore */ } finally {
      setWalletLoading(false);
    }
  }, [session?.userToken]);

  useEffect(() => { if (session) void refreshWallet(); }, [session, refreshWallet]);

  /* ── Check existing subscription ── */
  useEffect(() => {
    if (!wallet?.address || !planId) return;
    const checkSub = async () => {
      try {
        const res = await fetch(`/api/subscription/my-subscriptions/${planId}?subscriber=${wallet.address}`);
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
  }, [wallet?.address, planId]);

  const isOwner = wallet?.address.toLowerCase() === plan?.seller?.id?.toLowerCase();
  const isActiveSub = subscription?.status === "ACTIVE" && (subscription?.remainingSeconds ?? 0) > 0;

  /* ── Per-tier payment ── */
  const handleTierPayment = async (tier: Tier) => {
    if (!session || !wallet || !plan) return;

    const tid = tier.id;
    setTierError(p => ({ ...p, [tid]: "" }));
    setTierStatus(p => ({ ...p, [tid]: "approving" }));

    try {
      // 0. Check Allowance
      const allowanceRes = await fetch("/api/subscription/allowance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: wallet.address }),
      });
      const allowanceData = await allowanceRes.json();
      const currentAllowance = BigInt(allowanceData.allowance ?? "0");
      const requiredAmount = BigInt(tier.price);

      // 1. Approve USDC (only if needed)
      if (currentAllowance < requiredAmount) {
        setTierStatus(p => ({ ...p, [tid]: "approving" }));
        const approveRes = await fetch("/api/payment/approve-usdc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userToken: session.userToken,
            walletId: wallet.id,
            amount: formatUnits(tier.price, 6),
          }),
        });
        if (approveRes.ok) {
          const { challengeId } = await approveRes.json();
          await executeChallenge(challengeId);
        }
      }

      // 2. Subscribe
      setTierStatus(p => ({ ...p, [tid]: "subscribing" }));
      const subRes = await fetch("/api/payment/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userToken: session.userToken,
          walletId: wallet.id,
          planId: plan.planId,
          userId: userId || wallet.address,
          tierId: tier.tierId,
        }),
      });

      if (!subRes.ok) throw new Error("Subscription execution failed");
      const { challengeId: subChallenge } = await subRes.json();
      await executeChallenge(subChallenge);

      // Aggressive Polling for Indexer Sync
      setTierStatus(p => ({ ...p, [tid]: "success" }));
      
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const res = await fetch(`/api/subscription/my-subscriptions/${planId}?subscriber=${wallet.address}`);
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

  /* ── Loading ── */
  if (!isReady || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
          Syncing Registry…
        </p>
      </div>
    );
  }

  /* ── Load error ── */
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-sm w-full border border-rose-500/20 bg-rose-500/5 rounded-xl p-8 space-y-4">
          <div className="flex items-center gap-2 text-rose-500">
            <AlertCircle className="h-4 w-4" />
            <p className="text-xs font-black uppercase tracking-widest">Registry Fault</p>
          </div>
          <p className="text-sm text-muted-foreground">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-bold uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-colors"
          >
            Retry →
          </button>
        </div>
      </div>
    );
  }

  /* ── Success screen ── */
  if (succeededTier) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6 p-6">
        <div className="flex flex-col items-center gap-5 max-w-sm w-full text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground mb-2">
              Protocol Settled
            </p>
            <h2 className="text-2xl font-black tracking-tight">Subscription Active</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {succeededTier.label} · ${fmt6(succeededTier.price)} USDC / {humanDuration(plan?.duration ?? "0")}
            </p>
          </div>
          <div className="w-full border border-border/40 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Redirecting in</span>
            <span className="text-sm font-black font-mono text-primary">{countdown}s</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            → {redirectUrl ? decodeURIComponent(redirectUrl) : "/dashboard/subscriptions"}
          </p>
        </div>
      </div>
    );
  }

  /* ── Main UI ── */
  const brandName = plan?.metadata?.brand?.name;
  const planName  = plan?.metadata?.name ?? "Subscription Protocol";

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row overflow-hidden">
      
      {/* ── Left Sidebar: Order Summary ── */}
      <div className="w-full lg:w-[450px] bg-muted/20 border-b lg:border-b-0 lg:border-r border-border/40 flex flex-col h-full lg:h-screen sticky top-0 overflow-y-auto">
        <div className="p-8 md:p-12 space-y-12">
          
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Zap className="h-6 w-6 text-primary fill-primary" />
                <span className="text-sm font-black uppercase tracking-[0.3em]">Mecha Pay</span>
              </Link>
              <ModeToggle />
            </div>

            <div className="space-y-2">
              {brandName && (
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                  {brandName}
                </p>
              )}
              <h1 className="text-3xl font-black tracking-tight leading-none">{planName}</h1>
            </div>
          </div>

          {/* Order Details */}
          <div className="pt-8 border-t border-border/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Duration</span>
              <span className="text-xs font-bold">{plan ? humanDuration(plan.duration) : "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Network</span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold">Arc Testnet</span>
              </div>
            </div>
          </div>

          {/* Subscription Status Alert */}
          {isActiveSub && (
            <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Active Subscription</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Time Remaining</p>
                <p className="text-xl font-black font-mono tracking-tight">
                  {humanDuration(String(subscription?.remainingSeconds ?? 0))}
                </p>
              </div>
            </div>
          )}

          {isOwner && (
            <div className="border border-primary/20 bg-primary/5 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Ownership Detected</p>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                You are the creator of this protocol. Payments are disabled for the owner address.
              </p>
            </div>
          )}

          {brandName && plan?.metadata?.brand?.website && (
            <div className="pt-4">
              <a
                href={plan.metadata.brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
              >
                View Provider Site <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ── Right Content: Payment Flow ── */}
      <div className="flex-1 bg-background flex flex-col h-full lg:h-screen overflow-y-auto">
        <div className="max-w-3xl w-full mx-auto px-6 md:px-12 py-12 space-y-12">
          
          {/* Section: Wallet */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                Payment Method
              </h2>
              {session && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => clearSession()}
                    className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-colors"
                  >
                    <LogOut className="h-3 w-3" /> Logout
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Connected</span>
                  </div>
                </div>
              )}
            </div>

            {!session ? (
              <div className="border border-border/40 rounded-2xl p-8 text-center space-y-4 bg-muted/5">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold">Sign in required</p>
                  <p className="text-xs text-muted-foreground">Connect your Mecha wallet to process this payment.</p>
                </div>
                <Button
                  onClick={() => {
                    const here = `${window.location.pathname}${window.location.search}`;
                    router.push(`/login?redirect=${encodeURIComponent(here)}`);
                  }}
                  className="px-8 h-10 text-[10px] font-black uppercase tracking-widest"
                >
                  Sign In to Continue
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border/40 rounded-xl p-5 space-y-3 bg-muted/5">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Your Balance</p>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-black font-mono leading-none">
                      {walletLoading ? "…" : wallet ? Number(wallet.balance).toFixed(2) : "0.00"}
                    </p>
                    <p className="text-xs font-bold text-muted-foreground mb-0.5">USDC</p>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground/60">{wallet ? trunc(wallet.address) : "—"}</p>
                </div>

                <div className="border border-border/40 rounded-xl p-5 flex flex-col justify-between bg-muted/5">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Top Up</p>
                    <ArrowDownUp className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline text-left">
                        Bridge USDC →
                      </button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Bridge USDC</SheetTitle>
                        <SheetDescription>Move USDC to your Arc Circle wallet</SheetDescription>
                      </SheetHeader>
                      <div className="mt-6">
                        <BridgeUSDC isCompact={true} defaultDestChain="Arc_Testnet" />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            )}
          </section>

          {/* Section: Tier Selection */}
          <section className="space-y-6">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              Select Tier
            </h2>

            {activeTiers.length === 0 ? (
              <p className="text-xs text-muted-foreground">No active tiers available.</p>
            ) : (
              <div className="space-y-4">
                {activeTiers.map(tier => {
                  const st = tierStatus[tier.id] ?? "idle";
                  const err = tierError[tier.id];
                  const isInsuf = wallet
                    ? Number(wallet.balance) < Number(formatUnits(tier.price, 6))
                    : false;
                  const busy = st === "approving" || st === "subscribing";
                  const succeeded = st === "success";

                  const metaTier = plan?.metadata?.tiers?.find(mt => mt.label === tier.label);
                  const tierFeatures = metaTier?.features ?? [];

                  return (
                    <div
                      key={tier.id}
                      className={cn(
                        "group border rounded-xl p-6 transition-colors relative overflow-hidden",
                        succeeded
                          ? "border-primary bg-primary/5"
                          : "border-border/40 hover:border-primary/40 hover:bg-muted/5",
                        isInsuf && !succeeded && "opacity-70"
                      )}
                    >
                      {succeeded && (
                        <div className="absolute top-0 right-0 p-3">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                      )}

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-black tracking-tight">{tier.label}</h3>
                            <span className="text-[9px] font-bold bg-muted border border-border/40 rounded px-2 py-0.5 text-muted-foreground uppercase tracking-widest">
                              ID: {tier.tierId}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground font-medium">
                            Full access for {humanDuration(plan?.duration ?? "0")} per cycle
                          </p>

                          {/* Tier-level Features (Vertical List) */}
                          {tierFeatures.length > 0 && (
                            <div className="space-y-2.5 pt-5">
                              {tierFeatures.map((f, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                  <CheckCircle2 className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-foreground/90 leading-none">{f.title}</p>
                                    {f.description && (
                                      <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed font-medium">
                                        {f.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col md:items-end gap-4 min-w-[140px]">
                          <div className="text-right">
                            <p className="text-2xl font-black font-mono leading-none">${fmt6(tier.price)}</p>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1 font-bold">USDC</p>
                          </div>

                          {isOwner ? (
                            <div className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-4 py-2 rounded-lg text-center">
                              Owner
                            </div>
                          ) : isActiveSub ? (
                            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-lg text-center">
                              Active
                            </div>
                          ) : !session ? null : succeeded ? (
                            <div className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-4 py-2 rounded-lg text-center animate-pulse">
                              Processing…
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleTierPayment(tier)}
                              disabled={busy || !wallet || isInsuf}
                              size="sm"
                              className="w-full h-9 text-[10px] font-black uppercase tracking-widest"
                            >
                              {busy ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : isInsuf ? (
                                "Insuf. Funds"
                              ) : (
                                "Purchase"
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {st === "error" && err && (
                        <p className="text-[10px] text-rose-500 mt-4 bg-rose-500/5 p-3 rounded-lg border border-rose-500/20 font-medium">
                          {err}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Context meta if provided */}
          {(userId || redirectUrl) && (
            <div className="border border-dashed border-border/60 rounded-xl p-6 space-y-3 bg-muted/5">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Transaction Metadata</p>
              <div className="grid grid-cols-2 gap-4">
                {userId && (
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Buyer Context</p>
                    <p className="text-[10px] font-mono break-all">{userId}</p>
                  </div>
                )}
                {redirectUrl && (
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Success Return</p>
                    <p className="text-[10px] font-mono truncate">{decodeURIComponent(redirectUrl)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Security */}
          <div className="pt-6 flex flex-col items-center gap-4 border-t border-border/20">
            <div className="flex items-center gap-6 text-muted-foreground/40">
              <ShieldCheck className="h-4 w-4" />
              <div className="h-4 w-px bg-border/40" />
              <Zap className="h-4 w-4" />
              <div className="h-4 w-px bg-border/40" />
              <Lock className="h-4 w-4" />
            </div>
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em] font-black">
              Verified Mecha Payment Gateway
            </p>
          </div>

        </div>
      </div>

    </main>
  );
}
