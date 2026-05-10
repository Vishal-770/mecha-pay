"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { cn } from "@/lib/utils";
import { 
  Button, 
  buttonVariants 
} from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Activity, 
  Calendar,
  ChevronRight,
  Plus,
  Zap,
  Target,
  ArrowUpRight,
  Layers,
  Globe
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PlanAnalytics = {
  totalSubscribers: number;
  activeSubscribers: number;
  expiredSubscribers: number;
  grossEarnings: string;
  feeCollected: string;
  netEarnings: string;
  averageRevenuePerSubscriber: string;
  repeatBuyerCount: number;
  repeatBuyerRate: number;
  lastSubscriptionAgeDays: number | null;
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

type Tier = {
  tierId: string;
  price: string;
  label: string;
  active: boolean;
};

type MyPlanRow = {
  id: string;
  planId: string;
  price: string;
  duration: string;
  active: boolean;
  tiers: Tier[];
  metadata: {
    name?: string;
    brand?: { name?: string };
  } | null;
  analysis: PlanAnalytics;
};

type MyPlansResponse = {
  plans: MyPlanRow[];
  summary: {
    totalPlans: number;
    activePlans: number;
    totalGross: string;
    totalNet: string;
  };
};

function humanDuration(secondsValue: string) {
  const seconds = Number(secondsValue);
  const days = Math.floor(seconds / 86400);
  if (days >= 1) return `${days} day${days !== 1 ? "s" : ""}`;
  const hours = Math.floor(seconds / 3600);
  if (hours >= 1) return `${hours}h`;
  return `${Math.max(Math.floor(seconds / 60), 1)}m`;
}

export default function MyPlansPage() {
  const { wallet, sessionUserToken } = useDashboardContext();
  const [data, setData] = useState<MyPlansResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!wallet?.address || !sessionUserToken) {
        setLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams({ 
          seller: wallet.address,
          userToken: sessionUserToken 
        });
        const response = await fetch(
          `/api/subscription/my-plans?${params.toString()}`,
          { cache: "no-store" }
        );
        const json = (await response.json()) as MyPlansResponse & { error?: string };
        if (!response.ok) throw new Error(json.error ?? "Failed to load my plans");
        if (mounted) setData(json);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void run();
    return () => { mounted = false; };
  }, [wallet?.address]);

  const sortedPlans = useMemo(() => {
    if (!data?.plans) return [];
    return [...data.plans].sort(
      (a, b) => Number(b.analysis.grossEarnings) - Number(a.analysis.grossEarnings)
    );
  }, [data?.plans]);

  if (loading) {
    return (
      <div className="p-8 space-y-10">
        <Skeleton className="h-12 w-1/3 rounded-xl" />
        <div className="grid gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4">
          <Activity className="h-12 w-12 text-destructive mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tight">Sync Failure</h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{error}</p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()} className="h-10 rounded-xl px-8 text-[10px] font-black uppercase tracking-widest">
            Retry Sync
          </Button>
        </div>
      </div>
    );
  }

  if (!data || data.plans.length === 0) {
    return (
      <div className="p-8">
        <Card className="border-dashed border-2 bg-muted/5 flex flex-col items-center justify-center p-24 text-center gap-6 rounded-[3rem]">
          <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center text-muted-foreground/30 shadow-inner">
            <Zap size={40} strokeWidth={2.5} />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black uppercase tracking-tight">No Protocols Deployed</CardTitle>
            <CardDescription className="max-w-xs mx-auto text-xs font-bold uppercase tracking-widest leading-relaxed">
              Launch your first subscription gateway to start receiving settled payments on ARC.
            </CardDescription>
          </div>
          <Link 
            href="/dashboard/plans/create" 
            className={cn(buttonVariants({ variant: "default" }), "h-12 px-8 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/40")}
          >
            <Plus className="mr-2 h-4 w-4 stroke-[3px]" /> Deploy Protocol
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full py-12 px-6 space-y-12">
      
      {/* Header Matrix */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-border/40 pb-10">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Settlement Hub</p>
          <h2 className="text-4xl font-black uppercase tracking-tight text-foreground">Creator Console</h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Global Protocol Management & Settlement Liquidity</p>
        </div>
        <Link 
          href="/dashboard/plans/create" 
          className={cn(buttonVariants({ variant: "default" }), "h-12 px-8 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/40")}
        >
          <Plus className="mr-2 h-4 w-4 stroke-[3px]" /> New Offering
        </Link>
      </div>

      {/* Global Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Gateways", value: data.summary.activePlans, sub: `Of ${data.summary.totalPlans} Total`, icon: Globe, color: "text-primary" },
          { label: "Total Volume", value: `$${Number(formatUnits(BigInt(data.summary.totalGross), 6)).toLocaleString()}`, sub: "Cumulative Settled", icon: TrendingUp, color: "text-emerald-500" },
          { label: "Net Settled", value: `$${Number(formatUnits(BigInt(data.summary.totalNet), 6)).toLocaleString()}`, sub: "After Registry Fees", icon: Activity, color: "text-sky-500" },
          { label: "Loyalty Status", value: "High", sub: "Based on Renewals", icon: Target, color: "text-amber-500" },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border/80 shadow-none rounded-2xl group hover:bg-muted/5 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</CardTitle>
              <stat.icon size={14} className={cn(stat.color, "stroke-[3px]")} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black italic text-foreground leading-none">{stat.value}</div>
              <p className="text-[9px] font-bold text-muted-foreground/60 mt-2 uppercase tracking-widest">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Protocol Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {sortedPlans.map((plan) => {
          const title = plan.metadata?.name ?? plan.metadata?.brand?.name ?? `Protocol ${plan.planId.slice(0, 10)}`;
          const prices = plan.tiers?.map(t => BigInt(t.price)) ?? [];
          const minPrice = prices.length > 0 ? prices.reduce((a, b) => a < b ? a : b) : BigInt(0);
          const maxPrice = prices.length > 0 ? prices.reduce((a, b) => a > b ? a : b) : BigInt(0);
          const priceDisplay = minPrice === maxPrice 
            ? `${formatUnits(minPrice, 6)} USDC`
            : `${formatUnits(minPrice, 6)} - ${formatUnits(maxPrice, 6)} USDC`;

          return (
            <Card key={plan.planId} className="group relative overflow-hidden bg-card border-border/80 rounded-[2rem] shadow-none hover:border-primary/30 transition-all duration-500">
              <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full -mr-20 -mt-20 group-hover:bg-primary/10 transition-all duration-700" />
              
              <CardHeader className="p-8 pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">{title}</h3>
                      <ArrowUpRight size={16} className="text-muted-foreground/20 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                      <span className="flex items-center gap-1"><Layers size={10} /> {plan.tiers?.length || 1} Tiers</span>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span className="flex items-center gap-1"><Calendar size={10} /> {humanDuration(plan.duration)} Cycle</span>
                    </div>
                  </div>
                  <Badge variant={plan.active ? "secondary" : "outline"} className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border-none shadow-sm",
                    plan.active ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground/40"
                  )}>
                    {plan.active ? "Live" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-8 pt-6 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Settlement Volume</p>
                    <p className="text-2xl font-black italic text-foreground leading-none">${Number(formatUnits(BigInt(plan.analysis.grossEarnings), 6)).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Active Now</p>
                    <p className="text-2xl font-black italic text-emerald-500 leading-none">{plan.analysis.activeSubscribers}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Renewal Rate</p>
                    <p className="text-2xl font-black italic text-sky-500 leading-none">{plan.analysis.repeatBuyerRate.toFixed(1)}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Registry Pricing</p>
                    <p className="text-sm font-black text-primary leading-none uppercase tracking-tight">{priceDisplay}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-border/40">
                  <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest">
                    {plan.analysis.lastSubscriptionAgeDays == null
                      ? "Zero Registry Activity"
                      : `Last Activity: ${plan.analysis.lastSubscriptionAgeDays}D Ago`}
                  </p>
                  <Link 
                    href={`/dashboard/my-plans/${plan.planId}`} 
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-10 rounded-xl px-6 border-border/80 font-black uppercase tracking-widest text-[9px] shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all")}
                  >
                    View Protocol Insights <ChevronRight className="ml-1 h-3 w-3 stroke-[3px]" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="pt-10 text-center opacity-20">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">Mecha Pay Merchant OS • Institutional Subscription Infrastructure</p>
      </div>

    </div>
  );
}
