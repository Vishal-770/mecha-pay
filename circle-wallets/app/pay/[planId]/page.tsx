"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { formatUnits } from "ethers";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  Wallet,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Table as TableIcon,
  Search,
  ChevronRight,
  Loader2,
  ArrowDownUp,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

import BridgeUSDC from "@/components/BridgeUSDC";
import Loader from "@/components/Loader";

interface Plan {
  id: string;
  planId: string;
  price: string;
  duration: string;
  active: boolean;
  metadata: {
    name?: string;
    description?: string;
    brand?: {
      name?: string;
      website?: string;
    };
    features?: Array<{
      title: string;
      description: string;
    }>;
  } | null;
}

function humanDuration(secondsValue: string) {
  const seconds = Number(secondsValue);
  const days = Math.floor(seconds / 86400);
  if (days >= 1) return `${days} day${days !== 1 ? "s" : ""}`;
  const hours = Math.floor(seconds / 3600);
  if (hours >= 1) return `${hours}h`;
  return `${Math.max(Math.floor(seconds / 60), 1)}m`;
}

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { session, executeChallenge, isReady } = useCircleSDK();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [wallet, setWallet] = useState<{
    id: string;
    address: string;
    balance: string;
  } | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<
    "idle" | "approving" | "subscribing" | "success" | "error"
  >("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [hasSubscribed, setHasSubscribed] = useState<boolean>(false);

  const router = useRouter();
  const planId = params.planId as string;
  const userId = searchParams.get("userId");

  // Redirect after success
  useEffect(() => {
    if (txStatus === "success") {
      const timer = setTimeout(() => {
        router.replace("/dashboard/subscriptions");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [txStatus, router]);

  // Check if already subscribed
  useEffect(() => {
    const checkEligibility = async () => {
      if (!wallet?.address || !planId) return;
      try {
        const res = await fetch("/api/subscription/eligibility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscriber: wallet.address,
            planId: planId,
          }),
        });
        if (!res.ok) return;
        const data = await res.json();
        // If not eligible to buy, it means they are already subscribed (ACTIVE)
        setHasSubscribed(!data.eligible);
      } catch (err) {
        console.error("Failed to check subscription eligibility", err);
      }
    };
    if (wallet?.address) checkEligibility();
  }, [wallet?.address, planId]);

  // Fetch plan details
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/payment/plan/${planId}`);
        if (!res.ok) throw new Error("Subscription plan not found in registry");
        const data = await res.json();
        setPlan(data.plan);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load protocol",
        );
      } finally {
        setLoading(false);
      }
    };
    if (planId) fetchPlan();
  }, [planId]);

  // Fetch wallet and balance
  const refreshWalletData = useCallback(async () => {
    if (!session?.userToken) return;
    setWalletLoading(true);
    try {
      const res = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken: session.userToken }),
      });
      const data = await res.json();
      const arcWallet = data.wallets?.find(
        (w: any) => w.blockchain === "ARC-TESTNET",
      );

      if (arcWallet) {
        // 1. Try exact match
        let usdc = arcWallet.tokenBalances?.find(
          (t: any) => t.symbol.toUpperCase() === "USDC",
        );

        // 2. Try fuzzy match
        if (!usdc) {
          usdc = arcWallet.tokenBalances?.find(
            (t: any) =>
              t.symbol.toUpperCase().includes("USDC") ||
              t.name.toUpperCase().includes("USD COIN"),
          );
        }

        // 3. Arc fallback
        if (!usdc) {
          usdc = arcWallet.tokenBalances?.find((t: any) => t.isNative);
        }

        setWallet({
          id: arcWallet.id,
          address: arcWallet.address,
          balance: usdc?.amount || "0",
        });
      }
    } catch (err) {
      console.error("Wallet sync failed:", err);
    } finally {
      setWalletLoading(false);
    }
  }, [session?.userToken]);

  useEffect(() => {
    if (session) refreshWalletData();
  }, [session, refreshWalletData]);

  const handlePayment = async () => {
    if (!session || !wallet || !plan || !userId) return;

    try {
      setTxStatus("approving");

      // 1. Check & Approve USDC
      const approveRes = await fetch("/api/payment/approve-usdc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userToken: session.userToken,
          walletId: wallet.id,
          amount: formatUnits(plan.price, 6),
        }),
      });

      if (approveRes.ok) {
        const { challengeId } = await approveRes.json();
        await executeChallenge(challengeId);
      }

      // 2. Subscribe
      setTxStatus("subscribing");
      const subRes = await fetch("/api/payment/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userToken: session.userToken,
          walletId: wallet.id,
          planId: plan.planId,
          userId: userId,
        }),
      });

      if (!subRes.ok)
        throw new Error("Failed to execute protocol subscription");

      const { challengeId: subChallengeId } = await subRes.json();
      await executeChallenge(subChallengeId);

      setTxStatus("success");
      setTxHash("SUCCESS_PROTOCOL_SETTLED"); // Generic success indicator
    } catch (err) {
      setTxStatus("error");
      setError(
        err instanceof Error ? err.message : "Protocol execution failed",
      );
    }
  };

  if (!isReady || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
          Syncing Registry...
        </p>
      </div>
    );
  }

  if (error && txStatus !== "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="max-w-md w-full border-rose-500/20 bg-rose-500/5 shadow-none rounded-2xl">
          <CardHeader>
            <CardTitle className="text-rose-500 flex items-center gap-2 font-black uppercase tracking-tight">
              <AlertCircle size={20} /> Registry Fault
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm font-medium text-muted-foreground">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full h-11 border-rose-500/20 text-rose-500 font-bold uppercase tracking-widest text-[10px]"
            >
              Retry Sync
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isInsufficient =
    wallet && plan
      ? Number(wallet.balance) < Number(formatUnits(plan.price, 6))
      : false;

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="max-w-7xl mx-auto py-12 px-6 lg:px-12">
        <div className="grid lg:grid-cols-[1fr_400px] gap-12 lg:gap-16">
          {/* Left: Detailed Plan Ledger */}
          <div className="space-y-12">
            <header className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="rounded-full">
                  Subscription Protocol
                </Badge>
                {plan?.metadata?.brand?.name && (
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                    By {plan.metadata.brand.name}
                  </span>
                )}
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight break-words">
                {plan?.metadata?.name || "Protocol Gateway"}
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground leading-relaxed max-w-2xl break-words">
                {plan?.metadata?.description ||
                  "A secure, automated subscription protocol settling on the Arc network via high-precision USDC transfers."}
              </p>
            </header>

            <Separator />

            {/* Feature Ledger */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <TableIcon size={16} className="text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Capabilities & Features
                </h3>
              </div>

              <Card className="border-border shadow-none overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-1/3 min-w-[120px] text-xs font-bold uppercase tracking-widest py-4 px-6">
                          Headline
                        </TableHead>
                        <TableHead className="min-w-[200px] text-xs font-bold uppercase tracking-widest py-4 px-6">
                          Proposition
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(plan?.metadata?.features || []).map((f, i) => (
                        <TableRow key={i} className="border-border">
                          <TableCell className="font-bold text-xs px-6 py-5 text-primary break-words whitespace-normal">
                            {f.title}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground px-6 py-5 break-words whitespace-normal">
                            {f.description}
                          </TableCell>
                        </TableRow>
                      ))}
                      {!plan?.metadata?.features?.length && (
                        <TableRow>
                          <TableCell
                            colSpan={2}
                            className="h-24 text-center text-sm text-muted-foreground"
                          >
                            No features declared in registry.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </section>

            <footer className="pt-8 flex flex-col sm:flex-row sm:items-center gap-10">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Recurrence
                </span>
                <p className="text-xl font-bold">
                  {plan ? humanDuration(plan.duration) : "—"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Asset Layer
                </span>
                <p className="text-xl font-bold">
                  USDC{" "}
                  <span className="text-xs text-muted-foreground">
                    (Arc Testnet)
                  </span>
                </p>
              </div>
            </footer>
          </div>

          {/* Right: Payment Center */}
          <div className="lg:sticky lg:top-12 h-fit space-y-6">
            <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden p-0">
              <CardHeader className="p-6 pb-0 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground break-words line-clamp-2">
                      Secure Settlement
                    </span>
                  </div>
                  <ShieldCheck size={18} className="text-primary shrink-0" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Subscription Cost
                  </span>
                  <p className="text-4xl font-bold tracking-tight text-foreground break-words">
                    {plan ? formatUnits(plan.price, 6) : "0.00"}{" "}
                    <span className="text-sm text-muted-foreground uppercase font-bold">
                      USDC
                    </span>
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-8 space-y-6">
                {!session ? (
                  <div className="space-y-4 text-center p-6 border border-dashed rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground font-medium">
                      Please sign in with Circle Wallets to proceed with this
                      subscription.
                    </p>
                    <Button
                      onClick={() => {
                        // Preserve the full URL with all query params for post-login redirect
                        const currentPath = window.location.pathname;
                        const currentSearch = window.location.search;
                        const redirectUrl = encodeURIComponent(
                          `${currentPath}${currentSearch}`,
                        );
                        router.push(`/login?redirect=${redirectUrl}`);
                      }}
                      className="w-full h-11 text-xs font-bold uppercase tracking-widest"
                    >
                      Sign In to Continue
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Wallet Box */}
                    <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                          Connected Wallet
                        </span>
                        <Badge variant="outline" className="text-[8px] h-4">
                          ARC-L2
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-mono text-foreground truncate max-w-full block overflow-hidden text-ellipsis">
                          {wallet?.address ||
                            truncateAddress(
                              "0x0000000000000000000000000000000000000000",
                            )}
                        </p>
                        <div className="flex items-center justify-between pt-2 gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">
                            Available
                          </span>
                          <span
                            className={cn(
                              "text-sm font-bold",
                              isInsufficient
                                ? "text-destructive"
                                : "text-foreground",
                            )}
                          >
                            {walletLoading
                              ? "..."
                              : wallet
                                ? Number(wallet.balance).toFixed(2)
                                : "0.00"}{" "}
                            USDC
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Final Action */}
                    {hasSubscribed ? (
                      <Button
                        disabled
                        variant="ghost"
                        className="w-full h-12 bg-emerald-500/10 text-emerald-600 font-bold uppercase tracking-widest text-xs cursor-default hover:bg-emerald-500/10"
                      >
                        <CheckCircle2 className="mr-2 size-5" />
                        Active Subscription Detected
                      </Button>
                    ) : (
                      <Button
                        onClick={handlePayment}
                        disabled={
                          !wallet || isInsufficient || txStatus !== "idle"
                        }
                        className="w-full h-12 text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        {txStatus === "idle" ? (
                          <>
                            Confirm & Subscribe
                            <ArrowRight className="ml-2 size-4" />
                          </>
                        ) : txStatus === "success" ? (
                          <>
                            Settlement Confirmed
                            <CheckCircle2 className="ml-2 size-4" />
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="animate-pulse">
                              {txStatus.toUpperCase()}...
                            </span>
                          </div>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bridge USDC Section */}
            <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ArrowDownUp className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-widest">
                    Bridge USDC
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Move USDC between your EOA wallet and your Arc Circle wallet.
                </p>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-11 text-xs font-bold uppercase tracking-widest"
                    >
                      Open Bridge
                      <ArrowDownUp className="ml-2 h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Bridge USDC</SheetTitle>
                      <SheetDescription>
                        Bidirectional USDC bridge between EOA and Arc Circle
                        wallet
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <BridgeUSDC
                        isCompact={true}
                        defaultDestChain="Arc_Testnet"
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </Card>

            {/* Support Footer */}
            <div className="px-2 space-y-4">
              <p className="text-[10px] text-muted-foreground leading-relaxed text-center">
                By executing this protocol, you authorize the automated transfer
                of {plan ? formatUnits(plan.price, 6) : "0"} USDC per cycle from
                your Arc Vault.
              </p>
              <Separator />
              <div className="flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                <span>Secure</span>
                <span>•</span>
                <span>Non-Custodial</span>
                <span>•</span>
                <span>Arc Built</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
