"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  Users,
  Activity,
  ChevronRight,
  Plus,
  Zap,
  Target,
  ArrowUpRight,
  Layers,
  Globe,
  Calendar,
} from "lucide-react";

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
  if (days >= 1) return `${days}d`;
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
          userToken: sessionUserToken,
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
      <div className="w-full py-10 px-6 lg:px-12 max-w-[1400px] mx-auto space-y-0">
        <div className="py-8 border-b border-border/15 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border/15 border-b border-border/15">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="px-6 py-6 first:pl-0 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
        <div className="pt-6 space-y-0">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="py-5 border-b border-border/10 flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-10 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="py-16 flex flex-col items-center gap-4 text-center border-b border-border/15">
          <Activity size={24} className="text-destructive/50" />
          <div>
            <p className="text-sm font-semibold text-foreground">Failed to load plans</p>
            <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.plans.length === 0) {
    return (
      <div className="w-full py-10 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="py-8 border-b border-border/15 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground">My Plans</p>
            <h2 className="text-xl font-semibold tracking-tight mt-0.5">My Plans</h2>
          </div>
          <Link
            href="/dashboard/plans/create"
            className={cn(buttonVariants({ size: "sm" }), "h-9 px-4 text-xs font-medium rounded-lg gap-1.5")}
          >
            <Plus size={13} /> New Plan
          </Link>
        </div>
        <div className="py-24 flex flex-col items-center gap-5 text-center">
          <div className="h-12 w-12 rounded-xl bg-muted/30 flex items-center justify-center">
            <Zap size={20} className="text-muted-foreground/40" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold">No plans yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Create your first subscription plan to start accepting recurring USDC payments.
            </p>
          </div>
          <Link
            href="/dashboard/plans/create"
            className={cn(buttonVariants({ size: "sm" }), "h-9 px-5 text-xs font-medium rounded-lg gap-1.5 mt-2")}
          >
            <Plus size={13} /> Create Your First Plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-10 px-6 lg:px-12 pb-28 max-w-[1400px] mx-auto space-y-0">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between py-8 border-b border-border/15">
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">My Plans</p>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">My Plans</h2>
          <p className="text-xs text-muted-foreground">Manage your subscription plans and track earnings</p>
        </div>
        <Link
          href="/dashboard/plans/create"
          className={cn(buttonVariants({ size: "sm" }), "h-9 px-4 text-xs font-medium rounded-lg gap-1.5 shrink-0")}
        >
          <Plus size={13} /> New Plan
        </Link>
      </div>

      {/* ── Summary Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border/15 border-b border-border/15">
        {[
          {
            label: "Active Plans",
            value: `${data.summary.activePlans} / ${data.summary.totalPlans}`,
            sub: "Currently live",
            icon: Globe,
          },
          {
            label: "Total Volume",
            value: `$${Number(formatUnits(BigInt(data.summary.totalGross), 6)).toLocaleString()}`,
            sub: "Gross revenue",
            icon: TrendingUp,
          },
          {
            label: "Net Earnings",
            value: `$${Number(formatUnits(BigInt(data.summary.totalNet), 6)).toLocaleString()}`,
            sub: "After fees",
            icon: Activity,
          },
          {
            label: "Total Subscribers",
            value: `${sortedPlans.reduce((s, p) => s + p.analysis.totalSubscribers, 0)}`,
            sub: "Across all plans",
            icon: Users,
          },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col gap-1.5 px-6 py-6 first:pl-0 last:pr-0">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              <stat.icon size={12} className="text-muted-foreground/30" />
            </div>
            <p className="text-2xl font-semibold tracking-tight text-foreground">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground/60">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Plans List ─────────────────────────────────────── */}
      <div className="pt-6">
        {/* Column Headers */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-6 pb-3 border-b border-border/10 items-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">Plan</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 text-right w-24">Volume</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 text-right w-20 hidden md:block">Members</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 text-right w-20 hidden lg:block">Renewal</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 text-right w-24"></p>
        </div>

        {sortedPlans.map((plan) => {
          const title = plan.metadata?.name ?? plan.metadata?.brand?.name ?? `Plan ${plan.planId.slice(0, 10)}`;
          const prices = plan.tiers?.map(t => BigInt(t.price)) ?? [];
          const minPrice = prices.length > 0 ? prices.reduce((a, b) => a < b ? a : b) : BigInt(plan.price || "0");
          const maxPrice = prices.length > 0 ? prices.reduce((a, b) => a > b ? a : b) : BigInt(plan.price || "0");
          const priceDisplay = minPrice === maxPrice
            ? `$${formatUnits(minPrice, 6)}`
            : `$${formatUnits(minPrice, 6)}–$${formatUnits(maxPrice, 6)}`;

          return (
            <Link
              key={plan.planId}
              href={`/dashboard/my-plans/${plan.planId}`}
              className="group grid grid-cols-[1fr_auto_auto_auto_auto] gap-6 py-5 border-b border-border/10 items-center hover:bg-muted/[0.025] transition-colors -mx-3 px-3 rounded-lg"
            >
              {/* Plan Info */}
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{title}</p>
                  <span className={cn(
                    "inline-flex items-center text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0",
                    plan.active
                      ? "bg-blue-500/10 text-blue-600"
                      : "bg-muted text-muted-foreground/60"
                  )}>
                    {plan.active ? "● Active" : "○ Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 mt-1 text-[11px] text-muted-foreground/60">
                  <span className="flex items-center gap-1">
                    <Layers size={10} /> {plan.tiers?.length || 1} tier{(plan.tiers?.length || 1) !== 1 ? "s" : ""}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={10} /> {humanDuration(plan.duration)} cycle
                  </span>
                  <span>·</span>
                  <span>{priceDisplay} USDC</span>
                  {plan.analysis.lastSubscriptionAgeDays != null && (
                    <>
                      <span>·</span>
                      <span>last activity {plan.analysis.lastSubscriptionAgeDays}d ago</span>
                    </>
                  )}
                </div>
              </div>

              {/* Volume */}
              <div className="text-right w-24">
                <p className="text-sm font-semibold text-foreground">
                  ${Number(formatUnits(BigInt(plan.analysis.grossEarnings), 6)).toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">gross</p>
              </div>

              {/* Members */}
              <div className="text-right w-20 hidden md:block">
                <p className="text-sm font-semibold text-foreground">{plan.analysis.activeSubscribers}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">active</p>
              </div>

              {/* Renewal Rate */}
              <div className="text-right w-20 hidden lg:block">
                <p className="text-sm font-semibold text-foreground">{plan.analysis.repeatBuyerRate.toFixed(1)}%</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">repeat</p>
              </div>

              {/* Arrow */}
              <div className="w-8 flex justify-end">
                <ArrowUpRight size={13} className="text-muted-foreground/20 group-hover:text-muted-foreground transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
