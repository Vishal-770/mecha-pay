"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { encodeFunctionData } from "viem";

import { SUBSCRIPTION_GATEWAY_ADDRESS } from "@/lib/subscription";
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
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  Activity, 
  ArrowLeft, 
  ExternalLink, 
  AlertCircle,
  UserCheck,
  Target,
  CheckCircle2,
  ShieldCheck,
  ArrowUpRight,
  Layers,
  Search
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EditPlanDialog } from "./EditPlanDialog";
import MarkdownRenderer from "@/components/MarkdownRenderer";

type BuyerRow = {
  id: string;
  subscriber: string;
  status: "ACTIVE" | "EXPIRED";
  subscriptionCount: number;
  totalSpent: string;
  lastStartTime: string;
  lastEndTime: string;
  buyerData: string;
  remainingSeconds: number;
  updatedAt: string;
};

type ChartPoint = {
  date: string;
  revenue: string;
  subscriptions: number;
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
    tiers?: {
      tierId: string;
      price: string;
      label: string;
    }[];
    metadata: {
      version?: string;
      name?: string;
      brand?: { name?: string; website?: string };
      features?: { title: string; description: string }[];
      tiers?: {
        tierId?: string;
        label: string;
        price: string;
        features: { title: string; description: string }[];
      }[];
    } | null;
  };
  isOwnerView: boolean;
  buyers: BuyerRow[];
  chartData: ChartPoint[];
  metrics: {
    activeBuyerCount: number;
    expiredBuyerCount: number;
    totalBuyers: number;
  };
  analytics: {
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

function humanDuration(secondsValue: string) {
  const seconds = Number(secondsValue);
  const days = Math.floor(seconds / 86400);
  if (days >= 1) return `${days} day${days !== 1 ? "s" : ""}`;
  const hours = Math.floor(seconds / 3600);
  if (hours >= 1) return `${hours}h`;
  return `${Math.max(Math.floor(seconds / 60), 1)}m`;
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

const SectionHeader = ({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: LucideIcon }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-foreground/70 border border-border/30">
      <Icon size={15} strokeWidth={2} />
    </div>
    <div>
      <h2 className="text-sm font-semibold text-foreground leading-none mb-0.5">
        {title}
      </h2>
      <p className="text-[11px] text-muted-foreground leading-none">
        {subtitle}
      </p>
    </div>
  </div>
);

export default function MyPlanDetailPage() {
  const params = useParams<{ id: string }>();
  const { wallet } = useDashboardContext();

  const [data, setData] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState(false);
  const [activeTab, setActiveTab] = useState<"embed" | "hook">("embed");
  
  const { executeTransaction } = useCircleSDK();

  const effectiveFeePct = useMemo(() => {
    if (!data) return 2.5;
    const gross = Number(data.analytics.grossEarnings);
    if (gross <= 0) return 2.5;
    return (Number(data.analytics.feeCollected) / gross) * 100;
  }, [data?.analytics.grossEarnings, data?.analytics.feeCollected]);

  const handleToggleStatus = async () => {
    if (!data?.plan || !wallet?.address) return;
    setToggling(true);
    setError(null);

    try {
      const active = !data.plan.active;
      
      const subscriptionGatewayAbi = [
        {
          name: "setPlanStatus",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "planId", type: "bytes32" },
            { name: "active", type: "bool" }
          ],
          outputs: []
        }
      ] as const;

      const txData = encodeFunctionData({
        abi: subscriptionGatewayAbi,
        functionName: "setPlanStatus",
        args: [data.plan.planId as `0x${string}`, active],
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

      setData({ ...data, plan: { ...data.plan, active } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setToggling(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!params.id || !wallet?.address) return;
      try {
        setLoading(true);
        const viewerParam = `&viewer=${wallet.address}`;
        const response = await fetch(`/api/subscription/plan/${params.id}?first=500${viewerParam}`, {
          cache: "no-store",
        });
        const json = (await response.json()) as PlanResponse & { error?: string };
        if (!response.ok) throw new Error(json.error ?? "Failed to load plan");
        if (mounted) setData(json);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [params.id, wallet?.address]);

  const filteredBuyers = useMemo(() => {
    if (!data?.buyers) return [];
    const q = search.toLowerCase().trim();
    if (!q) return data.buyers;
    return data.buyers.filter(b => 
      b.subscriber.toLowerCase().includes(q) || 
      b.buyerData.toLowerCase().includes(q)
    );
  }, [data?.buyers, search]);

  const chartData = useMemo(() => {
    if (!data?.chartData) return [];
    return data.chartData.map(d => ({
        ...d,
        revenueNum: Number(formatUnits(d.revenue, 6))
    }));
  }, [data?.chartData]);

  const embedMarkdown = useMemo(() => {
    const planId = data?.plan?.planId ?? "0x…";
    return `
Install the package and drop in the dynamic pricing table integrated with Plan ID \`${planId}\`.

\`\`\`bash
npm install mechapay-react
\`\`\`

\`\`\`tsx
// App.tsx
import { MechaProvider } from 'mechapay-react';

function App() {
  return (
    <MechaProvider apiKey="mp_live_your_api_key">
      <YourPricingPage />
    </MechaProvider>
  );
}

// PricingPage.tsx
import { MechaPricingTable } from 'mechapay-react';

function YourPricingPage() {
  return (
    <MechaPricingTable 
      planId="${planId}" 
      userId="user_unique_id"
      appearance={{
        theme: "dark",
        variables: {
          colorPrimary: "#3b82f6",
          borderRadius: "16px"
        }
      }}
    />
  );
}
\`\`\`
`;
  }, [data?.plan?.planId]);

  const hookMarkdown = useMemo(() => {
    const planId = data?.plan?.planId ?? "0x…";
    return `
Inspect active subscriptions, resolve active feature/perk permissions, and local cycle expiration dates on-chain.

\`\`\`tsx
import { useMecha, useMechaPerks } from 'mechapay-react';

function PremiumFeature() {
  const PLAN_ID = "${planId}";
  const USER_ID = "user_unique_id";

  const { status, remainingSeconds, loading: statusLoading } = useMecha(PLAN_ID, USER_ID);
  const { perks, loading: perksLoading } = useMechaPerks(PLAN_ID, USER_ID);

  if (statusLoading || perksLoading) return <div>Checking status...</div>;
  if (status !== 'ACTIVE') return <div>Access Denied - Please Subscribe</div>;

  return (
    <div>
      <h3>Access Unlocked!</h3>
      <p>Your subscription expires in {Math.floor(remainingSeconds / 86400)} days.</p>
      
      {/* Dynamic Perks */}
      <ul>
        {perks?.map(tier => (
          <li key={tier.tierId}>
            <strong>{tier.tierName} Features:</strong>
            {tier.features.map(f => f.title).join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`
`;
  }, [data?.plan?.planId]);


  if (loading) {
    return (
      <div className="flex flex-col gap-10 p-8">
        <Skeleton className="h-20 w-1/3 rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <Skeleton className="h-[500px] rounded-3xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center gap-6">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight">{error ?? "Protocol Not Found"}</h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Unable to synchronize with indexing node</p>
        </div>
        <Button variant="outline" className="rounded-lg px-8 h-12 font-black uppercase tracking-widest text-[10px]" asChild>
          <Link href="/dashboard/my-plans">Back to my plans</Link>
        </Button>
      </div>
    );
  }

  const { plan, analytics, metrics } = data;
  const brand = plan.metadata?.brand;
  const title = plan.metadata?.name ?? brand?.name ?? `Protocol ${plan.planId.slice(0, 10)}`;
  const isV11 = plan.metadata?.version === "1.1";

  return (
    <div className="w-full py-10 px-6 lg:px-12 pb-28 max-w-[1400px] mx-auto space-y-0">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between py-8 border-b border-border/15">
        <div className="space-y-2.5">
          <Link
            href="/dashboard/my-plans"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={11} />
            My Plans
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            <span className={cn(
              "inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full",
              plan.active
                ? "bg-blue-500/10 text-blue-600"
                : "bg-muted text-muted-foreground"
            )}>
              {plan.active ? "● Live" : "○ Inactive"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
            <span className="font-mono">{truncateAddress(plan.planId)}</span>
            <span className="text-border">·</span>
            <span>ARC Testnet</span>
            <span className="text-border">·</span>
            <span>{humanDuration(plan.duration)} cycle</span>
            {brand?.website && (
              <>
                <span className="text-border">·</span>
                <a href={brand.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
                  {brand.website} <ExternalLink size={9} />
                </a>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <EditPlanDialog
            planId={plan.planId}
            durationSeconds={Number(plan.duration)}
            metadata={plan.metadata}
            onSuccess={() => window.location.reload()}
          />
          <Button
            asChild
            variant="ghost"
            className="h-9 px-4 text-xs font-medium text-muted-foreground hover:text-foreground gap-1.5"
          >
            <a href={`https://testnet.arcscan.app/address/${SUBSCRIPTION_GATEWAY_ADDRESS}`} target="_blank" rel="noreferrer">
              On-Chain Ledger <ArrowUpRight size={11} />
            </a>
          </Button>
          <Button
            onClick={() => void handleToggleStatus()}
            disabled={toggling || !wallet}
            size="sm"
            className={cn(
              "h-9 px-4 text-xs font-medium rounded-lg transition-all",
              plan.active
                ? "bg-red-500/8 text-red-600 hover:bg-red-500 hover:text-white border border-red-200/50 dark:border-red-900/50"
                : "bg-foreground text-background hover:opacity-90"
            )}
          >
            {toggling ? "Processing…" : plan.active ? "Deactivate" : "Restore"}
          </Button>
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border/15 border-b border-border/15">
        {[
          { label: "Gross Volume", value: `$${Number(formatUnits(plan.totalGrossVolume, 6)).toLocaleString()}`, sub: `${plan.subscriptionCount} subscriptions`, icon: Activity },
          { label: "Active Members", value: `${metrics.activeBuyerCount}`, sub: `${analytics.activeRate.toFixed(1)}% renewal rate`, icon: Users },
          { label: "Net Earnings", value: `$${Number(formatUnits(analytics.netEarnings, 6)).toLocaleString()}`, sub: `After ${effectiveFeePct.toFixed(1)}% protocol fee`, icon: Target },
          { label: "Avg. Ticket", value: `$${Number(formatUnits(analytics.avgRevenuePerSubscriber, 6)).toFixed(2)}`, sub: "Per active cycle", icon: TrendingUp },
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

      {/* ── Tier Architecture ──────────────────────────────── */}
      <div className="py-8 border-b border-border/15 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Tier Architecture</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Offering & entitlement matrix</p>
          </div>
          <Layers size={14} className="text-muted-foreground/30" />
        </div>

        {isV11 ? (
          <div className={cn(
            "grid gap-6 w-full",
            (plan.metadata?.tiers?.length ?? 0) === 1
              ? "grid-cols-1 max-w-md mx-auto"
              : (plan.metadata?.tiers?.length ?? 0) === 2
                ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
                : (plan.metadata?.tiers?.length ?? 0) === 3
                  ? "grid-cols-1 md:grid-cols-3"
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          )}>
            {plan.metadata?.tiers?.map((tier, i) => (
              <div key={i} className="relative flex flex-col justify-between bg-muted/20 text-card-foreground rounded-2xl p-6 hover:bg-muted/30 transition-all duration-300 group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md">
                      Tier {i + 1}
                    </span>
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                      USDC / cycle
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-bold tracking-tight text-foreground">{tier.label}</p>
                    <p className="text-4xl font-extrabold text-foreground mt-2 flex items-baseline gap-1">
                      ${tier.price}
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">/ cycle</span>
                    </p>
                  </div>
                </div>

                {tier.features?.length > 0 && (
                  <div className="mt-6 pt-1 space-y-3 flex-grow">
                    {tier.features.map((f, fi) => (
                      <div key={fi} className="flex gap-3 items-start p-2 rounded-xl hover:bg-muted/30 transition-all duration-200">
                        <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 size={12} className="text-blue-500" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-foreground leading-tight">{f.title}</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{f.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 py-6 text-muted-foreground/50">
            <Layers size={16} />
            <p className="text-sm">Legacy v1.0 — single-tier configuration</p>
          </div>
        )}
      </div>

      {/* ── Revenue Chart + Sidebar ─────────────────────────── */}
      <div className="grid gap-0 lg:grid-cols-3 lg:divide-x lg:divide-border/15">

        {/* Chart */}
        <div className="lg:col-span-2 py-8 lg:pr-8 space-y-5 border-b border-border/15 lg:border-b-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Revenue Scaling</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Historical settlement performance</p>
            </div>
            <TrendingUp size={14} className="text-muted-foreground/30" />
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" opacity={0.4} />
                <XAxis
                  dataKey="date"
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v.split("-").slice(1).join("/")}
                  dy={8}
                />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} dx={-8} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ fontWeight: '600', fontSize: '11px', marginBottom: '2px' }}
                  itemStyle={{ fontSize: '12px', color: 'var(--foreground)' }}
                />
                <Area type="monotone" dataKey="revenueNum" name="Revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar: Provider + Loyalty */}
        <div className="lg:pl-8 py-8 space-y-8">

          {/* Provider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Provider</p>
              <ShieldCheck size={13} className="text-muted-foreground/30" />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-base font-semibold">{brand?.name || "Independent Provider"}</p>
                {brand?.website && (
                  <a href={brand.website} target="_blank" rel="noreferrer" className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-0.5">
                    {brand.website} <ExternalLink size={9} />
                  </a>
                )}
              </div>
              <div className="pt-3 border-t border-border/10">
                <div>
                  <p className="text-[10px] text-muted-foreground/60 mb-0.5">Settlement Fee</p>
                  <p className="text-sm font-medium">{effectiveFeePct.toFixed(1)}% ({(effectiveFeePct * 100).toFixed(0)} BPS)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loyalty */}
          <div className="space-y-4 pt-6 border-t border-border/10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Loyalty</p>
              <UserCheck size={13} className="text-muted-foreground/30" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-semibold tracking-tight">{analytics.repeatBuyerCount}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Returning members</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold tracking-tight text-blue-500">{analytics.repeatBuyerRate.toFixed(1)}%</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Renewal rate</p>
              </div>
            </div>
            <div className="h-1 w-full bg-muted/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-1000"
                style={{ width: `${analytics.repeatBuyerRate}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
              A high renewal rate indicates strong member retention.
            </p>
          </div>
        </div>
      </div>

      {/* ── Member Registry ─────────────────────────────────── */}
      <div className="pt-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Member Registry</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Subscriber access & billing data</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
            <input
              type="text"
              placeholder="Search wallet or metadata…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-8 bg-transparent border border-border/30 rounded-md pl-8 pr-3 text-xs outline-none focus:border-border/60 transition-all placeholder:text-muted-foreground/40"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-border/10 hover:bg-transparent">
              <TableHead className="py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 pl-0">Subscriber</TableHead>
              <TableHead className="py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">Status</TableHead>
              <TableHead className="py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">Cycles</TableHead>
              <TableHead className="py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">Total Paid</TableHead>
              <TableHead className="py-3 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 pr-0">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBuyers.length === 0 ? (
              <TableRow className="border-border/10">
                <TableCell colSpan={5} className="text-center py-14 text-xs text-muted-foreground/40 pl-0">
                  No subscribers found
                </TableCell>
              </TableRow>
            ) : filteredBuyers.map((buyer) => (
              <TableRow key={buyer.id} className="group border-border/10 hover:bg-muted/[0.025] transition-colors">
                <TableCell className="py-4 pl-0">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-muted/60 flex items-center justify-center text-[9px] font-semibold text-muted-foreground shrink-0">
                      {buyer.subscriber.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{truncateAddress(buyer.subscriber)}</p>
                      <p className="text-[10px] text-muted-foreground/40 font-mono">{buyer.subscriber.slice(0, 16)}…</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <span className={cn(
                    "inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full",
                    buyer.status === "ACTIVE"
                      ? "bg-blue-500/8 text-blue-600"
                      : "bg-muted/60 text-muted-foreground"
                  )}>
                    {buyer.status === "ACTIVE" ? "● Active" : "○ Expired"}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground">{buyer.subscriptionCount}</TableCell>
                <TableCell className="py-4 text-sm font-medium">${Number(formatUnits(buyer.totalSpent, 6)).toLocaleString()}</TableCell>
                <TableCell className="py-4 text-right pr-0">
                  <span className="inline-block max-w-[140px] truncate font-mono text-[10px] text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                    {buyer.buyerData || "—"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── SDK Integration Code Section ─────────────────────────── */}
      <div className="py-12 border-t border-border/15 space-y-6">
        <div>
          <p className="text-sm font-semibold text-foreground">SDK Integration</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Embed pricing table and gate features with the React SDK</p>
        </div>

        <div className="space-y-4">
          <div className="flex border-b border-border/10 text-xs">
            <button
              onClick={() => setActiveTab("embed")}
              className={cn(
                "pb-2.5 px-4 font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer",
                activeTab === "embed"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              1. Embed Table
            </button>
            <button
              onClick={() => setActiveTab("hook")}
              className={cn(
                "pb-2.5 px-4 font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer",
                activeTab === "hook"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              2. Gate Features
            </button>
          </div>

          <div className="bg-card text-card-foreground rounded-xl overflow-hidden p-6 relative">
            <div className="absolute right-4 top-4 z-10">
              <span className="text-[9px] font-black bg-primary/10 border border-primary/20 text-primary uppercase tracking-widest px-2 py-0.5 rounded-lg">
                React SDK
              </span>
            </div>
            
            <div className="mt-2">
              <MarkdownRenderer content={activeTab === "embed" ? embedMarkdown : hookMarkdown} />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-20 text-center opacity-20">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">Mecha Pay Merchant OS v1.1.0 • Settlement Infrastructure</p>
      </div>

    </div>
  );
}
