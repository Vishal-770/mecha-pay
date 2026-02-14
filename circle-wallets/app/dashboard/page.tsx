"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  CreditCard, 
  ArrowUpRight, 
  Plus, 
  ShoppingBag, 
  Activity 
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AnalyticsResponse = {
  globalOverview: {
    totalPlans: number;
    activePlans: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
  };
  sellerMetrics: {
    planCount: number;
    activePlanCount: number;
    subscriptionCount: number;
    totalGrossRevenue: string;
    totalNetRevenue: string;
    totalFeeContributed: string;
  } | null;
  buyerMetrics: {
    subscriptionCount: number;
    activeSubscriptionCount: number;
    totalSpent: string;
    totalFeesPaid: string;
  } | null;
  topPlans: Array<{
    id: string;
    subscriptionCount: number;
    totalGrossVolume: string;
    netRevenue: string;
    metadata: { name?: string } | null;
  }>;
  recentSubscriptions: Array<{
    id: string;
    subscriber: string;
    seller: string;
    planId: string;
    totalAmount: string;
    blockTimestamp: string;
  }>;
  revenueHistory?: Array<{
    date: string;
    revenue: string;
  }>;
};

function truncate(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export default function DashboardOverviewPage() {
  const { wallet } = useDashboardContext();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const params = new URLSearchParams();
        if (wallet?.address) {
          params.set("seller", wallet.address);
          params.set("subscriber", wallet.address);
        }

        const response = await fetch(
          `/api/subscription/analytics?${params.toString()}`,
          {
            cache: "no-store",
          },
        );
        const json = (await response.json()) as AnalyticsResponse;
        if (mounted) setAnalytics(json);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, [wallet?.address]);

  const usdcBalance = useMemo(() => {
    const token = wallet?.tokenBalances.find(
      (entry) => entry.symbol.toUpperCase() === "USDC",
    );
    if (!token) return "0.00";
    return Number(token.amount).toFixed(2);
  }, [wallet?.tokenBalances]);

  const seller = analytics?.sellerMetrics;
  const buyer = analytics?.buyerMetrics;

  const chartData = useMemo(() => {
    if (!analytics?.revenueHistory) return [];
    
    return analytics.revenueHistory.map((entry: { date: string, revenue: string }) => ({
      name: entry.date.split("-").slice(1).join("/"), // MM/DD
      value: Number(formatUnits(entry.revenue, 6))
    }));
  }, [analytics?.revenueHistory]);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Command Center</h1>
        <p className="text-muted-foreground">
          Real-time insights across your creator and buyer profiles.
        </p>
      </div>

      {/* Primary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Creator Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <div className="text-3xl font-bold tracking-tight">
                ${Number(formatUnits(seller?.totalNetRevenue ?? "0", 6)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">Cumulative after protocol fees</p>
          </CardContent>
          <div className="absolute bottom-0 right-0 h-16 w-32 opacity-10">
             <TrendingUp className="h-full w-full" />
          </div>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Memberships</CardTitle>
            <Activity className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-12" />
            ) : (
              <div className="text-3xl font-bold tracking-tight">{buyer?.activeSubscriptionCount ?? 0}</div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">Active subscriptions you hold</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Capital Deployed</CardTitle>
            <ShoppingBag className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <div className="text-3xl font-bold tracking-tight">
                ${Number(formatUnits(buyer?.totalSpent ?? "0", 6)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">Total spent across all plans</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Revenue Visualization */}
        <Card className="lg:col-span-4 border-border bg-card">
          <CardHeader>
            <CardTitle>Net Revenue Growth</CardTitle>
            <CardDescription>Estimated earnings performance over current cycle</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--muted-foreground)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--primary)" 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Snapshot */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Wallet Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground p-0 mb-1">Managed Address</p>
                  <p className="font-mono text-xs text-foreground break-all">
                    {wallet?.address ?? "No active wallet"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">USDC Balance</p>
                    <p className="text-xl font-bold">{usdcBalance}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Creator Plans</p>
                    <p className="text-xl font-bold">{seller?.planCount ?? 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Quick Discovery
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              <Button asChild variant="default" className="w-full justify-start gap-3 h-12 rounded-none shadow-lg shadow-primary/20">
                <Link href="/dashboard/plans/create" className="flex items-center">
                  <ArrowUpRight className="h-4 w-4 shrink-0" />
                  <span className="font-black uppercase italic tracking-tighter text-xs">Launch New Plan</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-3 h-12 rounded-none border-border">
                <Link href="/dashboard/marketplace" className="flex items-center">
                  <ShoppingBag className="h-4 w-4 shrink-0" />
                  <span className="font-bold uppercase italic tracking-tighter text-xs">Marketplace</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start gap-3 h-12 rounded-none hover:bg-muted font-bold">
                <Link href="/dashboard/subscriptions" className="flex items-center">
                  <Activity className="h-4 w-4 shrink-0" />
                  <span className="font-bold uppercase italic tracking-tighter text-xs">Activity History</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Plans */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Top Performing Plans</CardTitle>
            <CardDescription>Best-sellers by subscription volume and revenue</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Plan</TableHead>
                  <TableHead className="text-right">Subs</TableHead>
                  <TableHead className="text-right pr-6">Net Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6"><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                      <TableCell className="text-right pr-6"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : (analytics?.topPlans ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground opacity-20" />
                        <p className="text-sm text-muted-foreground font-medium">You haven't launched any plans yet</p>
                        <Link 
                          href="/dashboard/plans/create" 
                          className={cn(buttonVariants({ variant: "link", size: "sm" }), "h-auto p-0")}
                        >
                          Create your first plan
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (analytics?.topPlans ?? []).map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="pl-6 font-medium">
                      <Link className="hover:text-primary transition-colors" href={`/dashboard/marketplace/${plan.id}`}>
                        {plan.metadata?.name ?? truncate(plan.id)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">{plan.subscriptionCount}</TableCell>
                    <TableCell className="text-right pr-6 font-bold">
                      ${Number(formatUnits(plan.netRevenue, 6)).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Monitor incoming and outgoing subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))
              ) : (analytics?.recentSubscriptions ?? []).length === 0 ? (
                  <p className="text-center py-10 text-muted-foreground italic text-sm">No recent activity on your dashboard</p>
              ) : (analytics?.recentSubscriptions ?? []).slice(0, 5).map((entry) => {
                const isIncome = entry.seller.toLowerCase() === wallet?.address?.toLowerCase();
                return (
                  <div key={entry.id} className="flex items-center gap-4 relative">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border",
                      isIncome ? "bg-emerald-50 text-emerald-600" : "bg-sky-50 text-sky-600"
                    )}>
                      {isIncome ? <ArrowUpRight className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                    </div>
                    <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold truncate text-foreground">
                          {isIncome ? "Payment Received" : `Subscription to ${truncate(entry.planId)}`}
                        </p>
                        <p className={cn(
                          "text-sm font-bold",
                          isIncome ? "text-emerald-600" : "text-foreground"
                        )}>
                          {isIncome ? "+" : "-"}${Number(formatUnits(entry.totalAmount, 6)).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground truncate font-medium">
                          {isIncome ? `from ${truncate(entry.subscriber)}` : `via ${truncate(entry.seller)}`}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                          {new Date(Number(entry.blockTimestamp) * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          { (analytics?.recentSubscriptions ?? []).length > 5 && (
            <div className="p-6 pt-0">
              <Button  variant="ghost" size="sm" className="w-full text-muted-foreground">
                <Link href="/dashboard/subscriptions">View all transactions</Link>
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
