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
  Plus
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

type MyPlanRow = {
  id: string;
  planId: string;
  price: string;
  duration: string;
  active: boolean;
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
  const { wallet } = useDashboardContext();
  const [data, setData] = useState<MyPlansResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!wallet?.address) {
        setLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams({ seller: wallet.address });
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
      <div className="flex flex-col gap-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive bg-destructive/10 p-6 text-sm text-destructive font-bold flex items-center gap-3">
        <Activity className="h-5 w-5" />
        {error}
      </div>
    );
  }

  if (!data || data.plans.length === 0) {
    return (
      <Card className="border-dashed flex flex-col items-center justify-center p-20 text-center gap-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <CreditCard className="h-6 w-6" />
        </div>
        <div>
          <CardTitle className="text-2xl">No Plans Found</CardTitle>
          <CardDescription className="mt-2 max-w-sm">
            You haven't created any subscription plans yet. Launch your first plan to start earning USDC.
          </CardDescription>
        </div>
        <Link 
          href="/dashboard/plans/create" 
          className={cn(buttonVariants({ variant: "default" }), "mt-4 shadow-lg shadow-primary/20")}
        >
          <Plus className="mr-2 h-4 w-4" /> Create New Plan
        </Link>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Creator Console</h2>
        <p className="text-muted-foreground mt-1">Manage your subscription offerings and view performance analytics.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Active Plans</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.activePlans}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase">Of {data.summary.totalPlans} Total</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Total Gross</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(formatUnits(data.summary.totalGross, 6)).toFixed(2)}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase">Cumulative Volume</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Net Settled</CardTitle>
            <Activity className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(formatUnits(data.summary.totalNet, 6)).toFixed(2)}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase">After protocol fees</p>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground shadow-xl shadow-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-80">New Offering</CardTitle>
            <Plus className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-[10px] opacity-80 uppercase font-black">Ready for more?</p>
            <Link href="/dashboard/plans/create" className="text-sm font-bold flex items-center gap-1 hover:underline">
               Launch New Plan <ChevronRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {sortedPlans.map((plan) => {
          const title = plan.metadata?.name ?? `Plan ${plan.planId.slice(0, 10)}`;
          return (
            <Card key={plan.planId} className="group overflow-hidden transition-all hover:shadow-md border-border bg-card">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="group-hover:text-primary transition-colors">{title}</CardTitle>
                  <CardDescription className="mt-1">
                    {plan.metadata?.brand?.name ?? "Self-Hosted"} · {humanDuration(plan.duration)} Cycle
                  </CardDescription>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  plan.active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                }`}>
                  {plan.active ? "Active" : "Inactive"}
                </div>
              </CardHeader>

              <CardContent className="pt-4 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted/50 p-3 flex flex-col gap-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Members</p>
                    <p className="text-lg font-bold flex items-center gap-2">
                      <Users className="h-4 w-4 text-sky-500" />
                      {plan.analysis.totalSubscribers}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 flex flex-col gap-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Active Now</p>
                    <p className="text-lg font-bold flex items-center gap-2 text-emerald-600">
                      <Activity className="h-4 w-4" />
                      {plan.analysis.activeSubscribers}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 flex flex-col gap-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Retention</p>
                    <p className="text-lg font-bold text-sky-600">
                      {plan.analysis.repeatBuyerRate.toFixed(1)}%
                    </p>
                  </div>
                   <div className="rounded-lg bg-muted/50 p-3 flex flex-col gap-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Net Profit</p>
                    <p className="text-lg font-bold">
                      ${Number(formatUnits(plan.analysis.netEarnings, 6)).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <p className="text-[10px] text-muted-foreground font-medium italic">
                    {plan.analysis.lastSubscriptionAgeDays == null
                      ? "Empty roster"
                      : `Last signup ${plan.analysis.lastSubscriptionAgeDays}d ago`}
                  </p>
                  <Link 
                    href={`/dashboard/my-plans/${plan.planId}`} 
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Detailed Insights <ChevronRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
