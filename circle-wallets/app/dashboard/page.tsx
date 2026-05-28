"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ArrowUpRight, ArrowDownRight, Plus, ExternalLink,
  TrendingUp, Activity,
} from "lucide-react";

/* ─── Resolve a CSS variable to a concrete colour string ─── */
function useCssColors() {
  return useMemo(() => {
    if (typeof window === "undefined") {
      return {
        primary: "#3b82f6",
        muted: "#64748b",
        border: "rgba(148,163,184,0.12)",
        tooltip: { bg: "#0f172a", border: "#1e293b" },
      };
    }

    const resolve = (varName: string): string => {
      const el = document.createElement("div");
      el.style.color = `var(${varName})`;
      el.style.display = "none";
      document.body.appendChild(el);
      const rgb = getComputedStyle(el).color;
      document.body.removeChild(el);
      return rgb || "#3b82f6";
    };

    return {
      primary: resolve("--primary"),
      muted: resolve("--muted-foreground"),
      border: "rgba(148,163,184,0.10)",
      tooltip: { bg: "#0f172a", border: "#1e293b" },
    };
  }, []);
}



type AnalyticsResponse = {
  sellerMetrics: { planCount: number; activePlanCount: number; subscriptionCount: number; totalGrossRevenue: string; totalNetRevenue: string; totalFeeContributed: string } | null;
  buyerMetrics: { subscriptionCount: number; activeSubscriptionCount: number; totalSpent: string; totalFeesPaid: string } | null;
  topPlans: Array<{ id: string; subscriptionCount: number; totalGrossVolume: string; netRevenue: string; active: boolean; tiers?: { tierId: string; price: string; label: string }[]; metadata: { name?: string; brand?: { name?: string } } | null }>;
  recentSubscriptions: Array<{ id: string; subscriber: string; seller: string; planId: string; tierId: string; tier: { label: string; price: string } | null; totalAmount: string; feeAmount: string; blockTimestamp: string }>;
  revenueHistory?: Array<{ date: string; revenue: string }>;
  monthlyStats?: Array<{ id: string; monthStartTimestamp: string; plansCreated: number; subscriptionsCreated: number; totalGrossVolume: string; totalFeesCollected: string }>;
  transactions?: Array<{ id: string; type: string; from: string; to: string | null; amount: string | null; fee: string | null; plan: { id: string } | null; blockTimestamp: string }>;
};

const fmt = (v: string | null | undefined) =>
  Number(formatUnits(v ?? "0", 6)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const trunc = (v: string) => `${v.slice(0, 6)}…${v.slice(-4)}`;

const TX_LABELS: Record<string, string> = {
  SUBSCRIBE:   "Subscribe",
  CREATE_PLAN: "Plan Created",
  UPDATE_PLAN: "Plan Updated",
  WITHDRAW:    "Withdraw",
  SET_FEE:     "Fee Update",
};

/* ─── Reusable metric row ─── */
function MetricRow({ label, value, sub, loading }: { label: string; value: string; sub?: string; loading: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-2.5 border-b border-border/20 last:border-0">
      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold leading-none">{label}</span>
      <div className="text-right">
        {loading ? <Skeleton className="h-3.5 w-20 inline-block" /> : (
          <>
            <span className="text-sm font-mono font-bold text-foreground">{value}</span>
            {sub && <span className="ml-2 text-[10px] text-muted-foreground">{sub}</span>}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Section label ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4 leading-none">
      {children}
    </p>
  );
}


export default function DashboardOverviewPage() {
  const { wallet, sessionUserToken } = useDashboardContext();
  const clr = useCssColors();
  const tooltipStyle = {
    background: clr.tooltip.bg,
    border: `1px solid ${clr.tooltip.border}`,
    borderRadius: 6,
    fontSize: 11,
    color: "#e2e8f0",
    padding: "6px 10px",
  };
  const { data: analytics = null, isLoading: loading } = useQuery<AnalyticsResponse>({
    queryKey: ["dashboardAnalytics", wallet?.address, sessionUserToken],
    queryFn: async () => {
      if (!wallet?.address || !sessionUserToken) return null as unknown as AnalyticsResponse;
      const p = new URLSearchParams({
        seller: wallet.address,
        subscriber: wallet.address,
        userToken: sessionUserToken
      });
      const res = await fetch(`/api/subscription/analytics?${p.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: !!wallet?.address && !!sessionUserToken,
    refetchInterval: 15000, // Refresh automatically every 15 seconds
    refetchOnWindowFocus: true,
  });

  const tokenBalances = wallet?.tokenBalances ?? [];
  let usdcToken = tokenBalances.find((t) => t.symbol.toUpperCase() === "USDC");
  if (!usdcToken) usdcToken = tokenBalances.find((t) => t.symbol.toUpperCase().includes("USDC"));
  if (!usdcToken && wallet?.blockchain === "ARC-TESTNET") usdcToken = tokenBalances.find((t) => t.isNative);
  const usdcBalance = usdcToken ? Number(usdcToken.amount).toFixed(2) : "0.00";

  const revenueChart = useMemo(() =>
    (analytics?.revenueHistory ?? []).map(e => ({
      d: e.date.slice(5),
      v: Number(formatUnits(e.revenue, 6)),
    })), [analytics?.revenueHistory]);

  const monthlyChart = useMemo(() =>
    [...(analytics?.monthlyStats ?? [])].reverse().map(e => ({
      m: new Date(Number(e.monthStartTimestamp) * 1000).toLocaleDateString("en", { month: "short" }),
      vol: Number(formatUnits(e.totalGrossVolume, 6)),
      subs: e.subscriptionsCreated,
    })), [analytics?.monthlyStats]);

  const s = analytics?.sellerMetrics;
  const b = analytics?.buyerMetrics;

  return (
    <div className="w-full bg-background">

      {/* ── Top bar ── */}
      <div className="border-b border-border/40 px-5 md:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-sm font-bold tracking-tight">Overview</h1>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate max-w-50 sm:max-w-xs md:max-w-none opacity-60">
            {wallet?.address ?? "—"}
          </p>
        </div>
        <div className="flex items-center gap-5 sm:gap-7">
          <div className="hidden sm:block text-right">
            <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">Balance</p>
            {loading
              ? <Skeleton className="h-5 w-20 mt-1" />
              : <p className="text-base font-black font-mono mt-0.5">{usdcBalance} <span className="text-[10px] font-normal text-muted-foreground">USDC</span></p>
            }
          </div>
          <div className="hidden md:block text-right">
            <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">Network</p>
            <p className="text-xs font-bold font-mono mt-0.5 text-foreground/80">{wallet?.blockchain ?? "—"}</p>
          </div>
          <Link href="/dashboard/plans/create" className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5 text-xs font-bold uppercase tracking-wider shrink-0 h-8 px-3")}>
            <Plus className="h-3.5 w-3.5" /> New Plan
          </Link>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="flex flex-col xl:grid xl:grid-cols-12 xl:divide-x divide-border/40">

        {/* ── Left: metrics ── */}
        <div className="xl:col-span-2 flex flex-col sm:flex-row xl:flex-col divide-y xl:divide-y sm:divide-y-0 sm:divide-x xl:divide-x-0 divide-border/40 border-b xl:border-b-0">

          <div className="px-5 py-5 flex-1">
            <SectionLabel>Your Revenue</SectionLabel>
            <MetricRow label="Net Revenue"   value={`$${fmt(s?.totalNetRevenue)}`}   loading={loading} />
            <MetricRow label="Gross Revenue" value={`$${fmt(s?.totalGrossRevenue)}`} loading={loading} />
            <MetricRow label="Active Plans"  value={`${s?.activePlanCount ?? 0} of ${s?.planCount ?? 0}`} loading={loading} />
            <MetricRow label="Subscribers"   value={String(s?.subscriptionCount ?? 0)} loading={loading} />
            <MetricRow label="Fees Paid"     value={`$${fmt(s?.totalFeeContributed)}`} loading={loading} />
          </div>

          <div className="px-5 py-5 flex-1">
            <SectionLabel>Your Spending</SectionLabel>
            <MetricRow label="Total Spent"      value={`$${fmt(b?.totalSpent)}`}              loading={loading} />
            <MetricRow label="Active Plans"     value={String(b?.activeSubscriptionCount ?? 0)} loading={loading} />
            <MetricRow label="All Subscriptions" value={String(b?.subscriptionCount ?? 0)}       loading={loading} />
            <MetricRow label="Fees Paid"        value={`$${fmt(b?.totalFeesPaid)}`}            loading={loading} />
          </div>

          <div className="px-5 py-5 flex-1 hidden sm:block">
            <SectionLabel>Quick Links</SectionLabel>
            {[
              { href: "/dashboard/my-plans",     label: "My Plans" },
              { href: "/dashboard/subscriptions", label: "Subscriptions" },
              { href: "/dashboard/marketplace",   label: "Marketplace" },
              { href: "/dashboard/plans/create",  label: "Create Plan" },
            ].map(l => (
              <Link key={l.href} href={l.href} className="flex items-center justify-between py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group">
                {l.label}
                <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── Center: charts + tx feed ── */}
        <div className="xl:col-span-7 flex flex-col divide-y divide-border/40 border-b xl:border-b-0">

          {/* Revenue area chart */}
          <div className="px-6 py-6">
            <div className="flex items-end justify-between mb-5">
              <div>
                <SectionLabel>30-Day Revenue</SectionLabel>
                {loading
                  ? <Skeleton className="h-7 w-28" />
                  : <p className="text-2xl font-black font-mono leading-none">${fmt(s?.totalNetRevenue)}</p>
                }
              </div>
              <div className="flex items-center gap-1.5 text-blue-500 text-[10px] font-bold mb-1">
                <TrendingUp className="h-3.5 w-3.5" /> Net earnings
              </div>
            </div>
            {loading ? <Skeleton className="h-44 w-full rounded-lg" /> : (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={clr.primary} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={clr.primary} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 6" vertical={false} stroke={clr.border} />
                    <XAxis
                      dataKey="d"
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: clr.muted }}
                      interval={4}
                    />
                    <YAxis
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: clr.muted }}
                      tickFormatter={v => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ stroke: clr.primary, strokeWidth: 1, strokeDasharray: "3 3" }}
                      formatter={(v) => [`$${Number(v ?? 0).toFixed(2)}`, "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={clr.primary}
                      strokeWidth={2}
                      fill="url(#revenueGrad)"
                      dot={false}
                      activeDot={{ r: 4, fill: clr.primary, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Monthly bar chart */}
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <SectionLabel>Monthly Volume</SectionLabel>
                <p className="text-xs text-muted-foreground">12-month gross USDC &amp; subscription metrics</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm inline-block" style={{ background: clr.primary, opacity: 0.9 }} />
                  Volume
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm inline-block" style={{ background: clr.muted }} />
                  Subs
                </span>
              </div>
            </div>
            {loading ? <Skeleton className="h-36 w-full rounded-lg" /> : (
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChart} barSize={9} barGap={3} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 6" vertical={false} stroke={clr.border} />
                    <XAxis
                      dataKey="m"
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: clr.muted }}
                    />
                    <YAxis
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: clr.muted }}
                      tickFormatter={v => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ fill: clr.border, opacity: 0.1 }}
                      formatter={(v, name) => {
                        const num = Number(v ?? 0);
                        return [
                          name === "vol" ? `$${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : num, 
                          name === "vol" ? "Volume" : "Subscriptions"
                        ];
                      }}
                    />
                    <Bar 
                      dataKey="vol"  
                      fill={clr.primary} 
                      radius={[3, 3, 0, 0]} 
                      opacity={0.8}
                      activeBar={{ fill: clr.primary, opacity: 1, stroke: clr.primary, strokeWidth: 1 }}
                    />
                    <Bar 
                      dataKey="subs" 
                      fill={clr.muted}   
                      radius={[3, 3, 0, 0]} 
                      opacity={0.5}
                      activeBar={{ fill: clr.muted, opacity: 0.8, stroke: clr.muted, strokeWidth: 1 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* On-chain activity feed */}
          <div className="flex-1">
            <div className="px-6 py-4 border-b border-border/30 flex items-center justify-between">
              <SectionLabel>Recent Transactions</SectionLabel>
              <Link href="/dashboard/subscriptions" className="text-[10px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                All <ExternalLink className="h-2.5 w-2.5" />
              </Link>
            </div>
            {loading ? (
              <div className="divide-y divide-border/20">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 flex-1" />
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                ))}
              </div>
            ) : (analytics?.transactions ?? []).length === 0 ? (
              <div className="flex items-center justify-center h-28 text-muted-foreground text-xs">No transactions yet</div>
            ) : (
              <div className="divide-y divide-border/20">
                {(analytics?.transactions ?? []).slice(0, 12).map(tx => {
                  const isIn = tx.to?.toLowerCase() === wallet?.address?.toLowerCase();
                  const label = TX_LABELS[tx.type] ?? tx.type;
                  return (
                    <div key={tx.id} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-5 px-6 py-3.5 hover:bg-muted/10 transition-colors">
                      <div>
                        <p className="text-xs font-semibold leading-none">{label}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-1">{trunc(tx.from)}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">{tx.plan ? trunc(tx.plan.id) : "—"}</p>
                      {tx.amount ? (
                        <div className={cn("flex items-center gap-0.5 text-xs font-mono font-bold", isIn ? "text-blue-400" : "text-slate-400")}>
                          {isIn ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                          ${fmt(tx.amount)}
                        </div>
                      ) : <span />}
                      <p className="text-[10px] text-muted-foreground tabular-nums">
                        {new Date(Number(tx.blockTimestamp) * 1000).toLocaleDateString("en", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: top plans + events + month stats ── */}
        <div className="xl:col-span-3 flex flex-col divide-y divide-border/40">

          {/* Top plans ranked */}
          <div className="px-5 py-5">
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>Top Plans</SectionLabel>
              <Link href="/dashboard/my-plans" className="text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
                All →
              </Link>
            </div>
            {loading ? (
              <div className="space-y-2.5">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)}</div>
            ) : (analytics?.topPlans ?? []).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-muted-foreground mb-3">No plans yet</p>
                <Link href="/dashboard/plans/create" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs h-7")}>
                  <Plus className="h-3 w-3 mr-1.5" /> Create
                </Link>
              </div>
            ) : (
              <div className="space-y-0.5">
                {(analytics?.topPlans ?? []).map((plan, i) => {
                  const name = plan.metadata?.brand?.name ?? plan.metadata?.name ?? trunc(plan.id);
                  return (
                    <Link key={plan.id} href={`/dashboard/my-plans/${plan.id}`}
                      className="flex items-center gap-3 px-2.5 py-2.5 rounded-md hover:bg-muted/30 transition-colors group">
                      <span className="text-[10px] text-muted-foreground font-mono w-4 shrink-0 text-center">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate group-hover:text-indigo-400 transition-colors">{name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{plan.subscriptionCount} subs · {plan.tiers?.length ?? 0} tiers</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-mono font-bold">${fmt(plan.netRevenue)}</p>
                        <div className={cn("text-[9px] font-black uppercase mt-0.5", plan.active ? "text-blue-400" : "text-muted-foreground/50")}>
                          {plan.active ? "live" : "off"}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent sub events */}
          <div className="flex-1 px-5 py-5">
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>Recent Events</SectionLabel>
              <Activity className="h-3.5 w-3.5 text-muted-foreground/60" />
            </div>
            {loading ? (
              <div className="space-y-2.5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-full rounded" />)}</div>
            ) : (analytics?.recentSubscriptions ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No events in last 30 days</p>
            ) : (
              <div>
                {(analytics?.recentSubscriptions ?? []).slice(0, 10).map(sub => {
                  const isSale = sub.seller.toLowerCase() === wallet?.address?.toLowerCase();
                  return (
                    <div key={sub.id} className="flex items-center gap-3 py-2.5 border-b border-border/15 last:border-0">
                      <div className={cn("shrink-0 h-1.5 w-1.5 rounded-full mt-0.5", isSale ? "bg-blue-400" : "bg-indigo-400")} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-mono text-muted-foreground truncate">{trunc(sub.subscriber)}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] uppercase font-black tracking-wider text-indigo-400/80">
                            {sub.tier?.label ?? `#${sub.tierId}`}
                          </span>
                          <span className="text-[9px] text-muted-foreground/60">
                            {new Date(Number(sub.blockTimestamp) * 1000).toLocaleDateString("en", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                      <p className={cn("text-xs font-mono font-bold shrink-0 tabular-nums", isSale ? "text-blue-400" : "text-slate-300")}>
                        {isSale ? "+" : ""}{fmt(sub.totalAmount)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* This month's protocol stats */}
          <div className="px-5 py-5">
            <SectionLabel>This Month</SectionLabel>
            {(analytics?.monthlyStats ?? []).slice(0, 1).map(m => (
              <div key={m.id}>
                <MetricRow label="Volume"   value={`$${fmt(m.totalGrossVolume)}`}     loading={loading} />
                <MetricRow label="New Subs" value={String(m.subscriptionsCreated)}    loading={loading} />
                <MetricRow label="New Plans" value={String(m.plansCreated)}           loading={loading} />
                <MetricRow label="Fees"     value={`$${fmt(m.totalFeesCollected)}`}   loading={loading} />
              </div>
            ))}
            {(analytics?.monthlyStats ?? []).length === 0 && !loading && (
              <p className="text-xs text-muted-foreground">No data this month</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
