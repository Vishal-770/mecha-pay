"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { useCircleSDK } from "@/context/CircleSDKContext";

import { 
  ArrowLeft, 
  ExternalLink, 
  Globe, 
  Users, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck,
  Activity,
  CheckCircle2,
  BadgeCheck,
  Layers,
  ArrowRight
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Feature = { title: string; description: string };

type Tier = {
  id: string;
  tierId: string;
  price: string;
  label: string;
};

type PlanMetadata = {
  version?: string;
  name?: string;
  brand?: { name?: string; website?: string };
  features?: Feature[]; // v1.0
  tiers?: { label: string; price: string; features: Feature[] }[]; // v1.1
} | null;

type BuyerRow = {
  id: string;
  subscriber: string;
  status: "ACTIVE" | "EXPIRED";
  subscriptionCount: number;
  totalSpent: string;
  lastStartTime: string;
  lastEndTime: string;
  remainingSeconds: number;
};

type PlanResponse = {
  plan: {
    planId: string;
    price: string;
    duration: string;
    active: boolean;
    subscriptionCount: number;
    totalGrossVolume: string;
    totalFeesCollected: string;
    lastSubscriptionAt: string | null;
    seller: { id: string };
    metadata: PlanMetadata;
    tiers: Tier[];
  };
  isOwnerView: boolean;
  buyers: BuyerRow[];
  metrics: {
    activeBuyerCount: number;
    expiredBuyerCount: number;
    totalBuyers: number;
  };
  analytics?: {
    grossEarnings: string;
    feeCollected: string;
    netEarnings: string;
    avgRevenuePerSubscriber: string;
    repeatBuyerCount: number;
    repeatBuyerRate: number;
    activeRate: number;
    windows: {
      sevenDays: {
        subscriptionCount: number;
        grossVolume: string;
        totalFees: string;
        averageTicket: string;
      };
      thirtyDays: {
        subscriptionCount: number;
        grossVolume: string;
        totalFees: string;
        averageTicket: string;
      };
    };
  };
};

type EligibilityResponse = {
  eligible: boolean;
  reason: string;
  remainingSeconds: number;
};

function humanDuration(secondsValue: string) {
  const seconds = Number(secondsValue);
  const days = Math.floor(seconds / 86400);
  if (days >= 1) return `${days} day${days !== 1 ? "s" : ""}`;
  const hours = Math.floor(seconds / 3600);
  if (hours >= 1) return `${hours}h`;
  return `${Math.max(Math.floor(seconds / 60), 1)}m`;
}

function formatCountdown(totalSeconds: number) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function truncateAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function daysSince(timestamp: string | null) {
  if (!timestamp) return null;
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(now - Number(timestamp), 0);
  return Math.floor(diff / 86400);
}

export default function MarketplaceDetailPage() {
  const params = useParams<{ id: string }>();
  const { executeChallenge } = useCircleSDK();
  const { wallet, userCircleId, sessionUserToken } = useDashboardContext();

  const [data, setData] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

  const userAddress = wallet?.address ?? "";

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const viewer = wallet?.address ? `?viewer=${wallet.address}` : "";
        const response = await fetch(
          `/api/subscription/plan/${params.id}${viewer}`,
          { cache: "no-store" }
        );
        const json = (await response.json()) as PlanResponse & { error?: string };
        if (!response.ok) throw new Error(json.error ?? "Failed to load plan");
        if (mounted) {
          setData(json);
          if (json.plan.tiers?.length > 0) {
            setSelectedTierId(json.plan.tiers[0].tierId);
          }
        }
      } catch (err) {
        if (mounted)
          setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (params.id) void run();
    return () => { mounted = false; };
  }, [params.id, wallet?.address]);

  useEffect(() => {
    if (!data?.plan || !wallet?.address) return;
    let mounted = true;
    const run = async () => {
      try {
        const res = await fetch("/api/subscription/eligibility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscriber: wallet.address,
            planId: data.plan.planId,
          }),
        });
        const json = (await res.json()) as EligibilityResponse;
        if (mounted) setEligibility(json);
      } catch {
        if (mounted) {
          setEligibility({ eligible: true, reason: "UNKNOWN", remainingSeconds: 0 });
        }
      }
    };
    void run();
    return () => { mounted = false; };
  }, [data?.plan, wallet?.address]);

  const title = useMemo(() => {
    if (!data?.plan) return "Plan";
    return data.plan.metadata?.name ?? data.plan.metadata?.brand?.name ?? `Protocol ${data.plan.planId.slice(0, 10)}`;
  }, [data?.plan]);

  const selectedTier = useMemo(() => {
    if (!data?.plan || !selectedTierId) return null;
    return data.plan.tiers.find((t) => t.tierId === selectedTierId);
  }, [data?.plan, selectedTierId]);

  const activeFeatures = useMemo(() => {
    if (!data?.plan?.metadata) return [];
    const meta = data.plan.metadata;
    if (meta.version === "1.1" && meta.tiers && selectedTier) {
       const tierMeta = meta.tiers.find(t => t.label === selectedTier.label);
       return tierMeta?.features ?? [];
    }
    return meta.features ?? [];
  }, [data?.plan?.metadata, selectedTier]);

  const handleBuy = async () => {
    if (!wallet?.id || !userCircleId || !userAddress) {
      setError("Wallet and user are required before subscribing");
      return;
    }
    if (!data?.plan || !selectedTier) {
      setError("Please select a pricing tier");
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const eligRes = await fetch("/api/subscription/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriber: userAddress,
          planId: data.plan.planId,
        }),
      });
      const latestEligibility = (await eligRes.json()) as EligibilityResponse;
      if (!latestEligibility.eligible) {
        throw new Error(
          `Subscription still active. Remaining ${formatCountdown(latestEligibility.remainingSeconds)}.`
        );
      }

      const allowanceRes = await fetch("/api/subscription/allowance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: wallet.address }),
      });
      const allowanceJson = (await allowanceRes.json()) as { allowance?: string; error?: string };
      if (!allowanceRes.ok || !allowanceJson.allowance) {
        throw new Error(allowanceJson.error ?? "Failed to check allowance");
      }

      const allowance = BigInt(allowanceJson.allowance);
      const required = BigInt(selectedTier.price);

      if (allowance < required) {
        const approveRes = await fetch("/api/subscription/approve-usdc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userToken: sessionUserToken,
            walletId: wallet.id,
            amount: formatUnits(required, 6),
          }),
        });
        const approveJson = (await approveRes.json()) as { challengeId?: string; error?: string };
        if (!approveRes.ok || !approveJson.challengeId) {
          throw new Error(approveJson.error ?? "Approval challenge failed");
        }
        await executeChallenge(approveJson.challengeId);
      }

      const subscribeRes = await fetch("/api/subscription/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userToken: sessionUserToken,
          walletId: wallet.id,
          planId: data.plan.planId,
          tierId: selectedTier.tierId,
          buyerData: userCircleId,
        }),
      });
      const subscribeJson = (await subscribeRes.json()) as { challengeId?: string; error?: string };
      if (!subscribeRes.ok || !subscribeJson.challengeId) {
        throw new Error(subscribeJson.error ?? "Subscribe challenge failed");
      }
      await executeChallenge(subscribeJson.challengeId);
      setSuccessMsg(`Subscribed to ${selectedTier.label} tier successfully`);
      setEligibility({ eligible: false, reason: "ACTIVE", remainingSeconds: Number(data.plan.duration) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-40 rounded-3xl bg-slate-100 animate-pulse" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const { plan, metrics, buyers, isOwnerView, analytics } = data;
  const brand = plan.metadata?.brand;
  const blocked = eligibility ? !eligibility.eligible : false;
  const lastSubscriptionDays = daysSince(plan.lastSubscriptionAt);

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-3 h-8 text-muted-foreground hover:text-foreground">
            <Link href="/dashboard/marketplace" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Marketplace
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <Badge variant={plan.active ? "secondary" : "outline"} className={plan.active ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10" : ""}>
              {plan.active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border shadow-none bg-muted/30">
              <CardContent className="p-4">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Subs</p>
                 <p className="text-xl font-bold tracking-tight mt-1">{metrics.totalBuyers}</p>
                 <p className="text-[9px] font-medium text-emerald-600 uppercase mt-0.5">{metrics.activeBuyerCount} Active</p>
              </CardContent>
            </Card>
            <Card className="border-border shadow-none bg-muted/30">
              <CardContent className="p-4">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Gross (USDC)</p>
                 <p className="text-xl font-bold tracking-tight mt-1">{Number(formatUnits(plan.totalGrossVolume, 6)).toFixed(1)}</p>
                 <p className="text-[9px] font-medium text-muted-foreground uppercase mt-0.5">Plan Lifetime</p>
              </CardContent>
            </Card>
            <Card className="border-border shadow-none bg-muted/30">
              <CardContent className="p-4">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Net (USDC)</p>
                 <p className="text-xl font-bold tracking-tight mt-1">{Number(formatUnits(analytics?.netEarnings ?? "0", 6)).toFixed(1)}</p>
                 <p className="text-[9px] font-medium text-primary uppercase mt-0.5">Post-Fee</p>
              </CardContent>
            </Card>
            <Card className="border-border shadow-none bg-muted/30">
              <CardContent className="p-4">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Retention</p>
                 <p className="text-xl font-bold tracking-tight mt-1">{analytics?.repeatBuyerRate.toFixed(1)}%</p>
                 <p className="text-[9px] font-medium text-muted-foreground uppercase mt-0.5">Renewal Rate</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {analytics && (
              <Card className="border-border shadow-none">
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary"><TrendingUp size={16} /></div>
                    <div>
                      <CardTitle className="text-base font-bold">Retention Engine</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Subscriber Lifecycle</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border bg-muted/10 p-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">ARPU</p>
                      <p className="text-sm font-bold mt-1">{Number(formatUnits(analytics.avgRevenuePerSubscriber, 6)).toFixed(1)} USDC</p>
                    </div>
                    <div className="rounded-lg border bg-muted/10 p-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Fees Paid</p>
                      <p className="text-sm font-bold mt-1">{Number(formatUnits(analytics.feeCollected, 6)).toFixed(2)} USDC</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
                     <Users size={14} className="text-primary" />
                     <span className="text-xs font-bold">{analytics.repeatBuyerCount} members have settled multiple times.</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {analytics && (
              <Card className="border-border shadow-none">
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600"><Activity size={16} /></div>
                    <div>
                      <CardTitle className="text-base font-bold">Momemtum Log</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Velocity Checks</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-3">
                   <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                      <span className="text-xs font-semibold">Past 7 Days</span>
                      <div className="text-right">
                         <p className="text-xs font-bold">{analytics.windows.sevenDays.subscriptionCount} Subs</p>
                         <p className="text-[10px] text-muted-foreground uppercase">{Number(formatUnits(analytics.windows.sevenDays.grossVolume, 6)).toFixed(1)} USDC</p>
                      </div>
                   </div>
                   <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                      <span className="text-xs font-semibold">Past 30 Days</span>
                      <div className="text-right">
                         <p className="text-xs font-bold">{analytics.windows.thirtyDays.subscriptionCount} Subs</p>
                         <p className="text-[10px] text-muted-foreground uppercase">{Number(formatUnits(analytics.windows.thirtyDays.grossVolume, 6)).toFixed(1)} USDC</p>
                      </div>
                   </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="border-border shadow-none">
            <CardHeader className="p-6">
               <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary"><Users size={18} /></div>
                  <div>
                    <CardTitle className="text-base font-bold">Protocol Registry</CardTitle>
                    <CardDescription className="text-[11px] font-medium uppercase tracking-widest mt-1">
                      {isOwnerView ? "Privileged Creator View" : "Public Registry"}
                    </CardDescription>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-0">
              {buyers.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground italic">No on-chain history for this protocol.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-6 h-10">Subscriber</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-6 h-10">Status</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-6 h-10 text-right">Volume</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buyers.map((buyer) => (
                      <TableRow key={buyer.id} className="hover:bg-muted/30 border-b border-border transition-colors">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div className="h-6 w-6 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                               {buyer.subscriber.slice(2, 4).toUpperCase()}
                             </div>
                             <div className="flex flex-col">
                               <span className="font-mono text-xs font-medium">{buyer.subscriber}</span>
                               <span className="text-[9px] text-muted-foreground">{buyer.status === "ACTIVE" ? `${formatCountdown(buyer.remainingSeconds)} left` : "Registration Expired"}</span>
                             </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge variant={buyer.status === "ACTIVE" ? "secondary" : "outline"} className={buyer.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600 border-none" : "opacity-40"}>
                            {buyer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                           <p className="text-xs font-bold leading-none">{formatUnits(buyer.totalSpent, 6)} <span className="text-[10px] text-muted-foreground font-normal">USDC</span></p>
                           <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">{buyer.subscriptionCount} cycles</p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border bg-card shadow-sm overflow-hidden border-t-4 border-t-primary">
            <CardContent className="p-6 space-y-6">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Settlement Duration</p>
                  <p className="text-lg font-bold text-foreground">Every {humanDuration(plan.duration)}</p>
               </div>
               <Separator />
               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers size={14} className="text-primary" /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Select Your Tier</span>
                  </div>
                  <div className="space-y-2">
                    {plan.tiers.map((tier) => (
                      <button
                        key={tier.tierId}
                        onClick={() => setSelectedTierId(tier.tierId)}
                        disabled={blocked || !plan.active}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left group",
                          selectedTierId === tier.tierId ? "bg-primary/5 border-primary shadow-sm" : "bg-muted/10 border-border hover:border-primary/30"
                        )}
                      >
                        <div className="space-y-1">
                          <p className={cn("text-[10px] font-black uppercase tracking-widest", selectedTierId === tier.tierId ? "text-primary" : "text-muted-foreground")}>{tier.label}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold">{formatUnits(tier.price, 6)}</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">USDC</span>
                          </div>
                        </div>
                        <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all", selectedTierId === tier.tierId ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                          {selectedTierId === tier.tierId && <CheckCircle2 size={12} strokeWidth={4} />}
                        </div>
                      </button>
                    ))}
                  </div>
               </div>
               <Separator />
               <div className="space-y-3">
                  {!isOwnerView && (
                    <>
                      <Button 
                        onClick={() => void handleBuy()}
                        disabled={submitting || blocked || !plan.active || !wallet || !selectedTierId}
                        className="group w-full font-black uppercase tracking-[0.2em] text-[10px] h-12 rounded-xl transition-all shadow-lg shadow-primary/10"
                      >
                        {submitting ? "Processing Gateway..." : blocked ? `Active Subscription` : !wallet ? "Connect Wallet" : (
                          <>Subscribe {selectedTier?.label}<ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform stroke-[3px]" /></>
                        )}
                      </Button>
                      {blocked && (
                        <div className="flex flex-col items-center gap-1 mt-2">
                           <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Expiry Reached In</p>
                           <p className="text-xs font-bold text-primary">{formatCountdown(eligibility!.remainingSeconds)}</p>
                        </div>
                      )}
                    </>
                  )}
                  {isOwnerView && (
                    <div className="space-y-4">
                       <Badge variant="outline" className="w-full justify-center h-10 py-0 font-bold uppercase tracking-widest border-dashed border-primary/40 text-primary">Protocol Owner</Badge>
                       <p className="text-[10px] text-center text-muted-foreground leading-relaxed italic">Registry analytics are visible to you. Users see a masked version of the subscriber list.</p>
                    </div>
                  )}
                  {error && <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20"><p className="text-[11px] text-center font-bold text-destructive uppercase tracking-widest">{error}</p></div>}
                  {successMsg && <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20"><p className="text-[11px] text-center font-bold text-emerald-600 uppercase tracking-widest">{successMsg}</p></div>}
               </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-none">
            <CardHeader className="p-6 pb-4">
               <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-sky-500/10 p-2 text-sky-600"><Globe size={18} /></div>
                  <CardTitle className="text-base font-bold">Brand Hub</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-6">
              <div className="space-y-4">
                <div><label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Provider</label><p className="text-sm font-semibold mt-0.5">{brand?.name || "Verified Merchant"}</p></div>
                {brand?.website && (
                  <div><label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Origin</label>
                    <a href={brand.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline text-sm font-medium mt-0.5">{brand.website.replace(/^https?:\/\//, "")}<ExternalLink size={12} /></a>
                  </div>
                )}
                <div><label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Activity</label><p className="text-sm font-semibold mt-0.5">{lastSubscriptionDays == null ? "No history" : `${lastSubscriptionDays} day(s) ago`}</p></div>
              </div>
              <Separator />
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                <ShieldCheck size={14} className="text-emerald-500" /><span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground italic truncate">Syncing: {truncateAddress(plan.seller.id)}</span>
              </div>
            </CardContent>
          </Card>

          {activeFeatures.length > 0 && (
            <Card className="border-border shadow-none animate-in fade-in zoom-in-95 duration-300">
              <CardHeader className="p-6 pb-4">
                 <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600"><BadgeCheck size={18} /></div>
                    <div>
                       <CardTitle className="text-base font-bold">Tier Perks</CardTitle>
                       <CardDescription className="text-[9px] font-bold text-primary uppercase tracking-widest">{selectedTier?.label} Benefits</CardDescription>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-3">
                  {activeFeatures.map((feature, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/10 border border-border">
                      <CheckCircle2 size={12} className="text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold leading-none">{feature.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
