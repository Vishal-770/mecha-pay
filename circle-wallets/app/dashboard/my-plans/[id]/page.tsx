"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
  Clock, 
  Activity, 
  ArrowLeft, 
  ExternalLink, 
  AlertCircle,
  FileText,
  UserCheck,
  Target,
  CheckCircle2,
  Globe,
  Tag,
  ShieldCheck,
  ArrowUpRight,
  Layers,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EditPlanDialog } from "./EditPlanDialog";

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

const SectionHeader = ({ title, subtitle, icon: Icon }: any) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <div>
      <h2 className="text-sm font-black uppercase tracking-widest text-foreground leading-none mb-1">
        {title}
      </h2>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
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
  
  const { executeChallenge } = useCircleSDK();
  const { sessionUserToken } = useDashboardContext();

  const handleToggleStatus = async () => {
    if (!data?.plan || !wallet?.id || !sessionUserToken) return;
    setToggling(true);
    setError(null);

    try {
      const active = !data.plan.active;
      const res = await fetch("/api/subscription/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userToken: sessionUserToken,
          walletId: wallet.id,
          planId: data.plan.planId,
          active,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to update status");

      await executeChallenge(json.challengeId);
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
        <Button variant="outline" className="rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px]" asChild>
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
    <div className="w-full py-12 px-6 space-y-12 pb-32">
      
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-border/40 pb-10">
        <div className="space-y-3">
          <Link
            href="/dashboard/my-plans"
            className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-primary transition-colors"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform stroke-[3px]" />
            Back to Registry
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black uppercase tracking-tight text-foreground">
              {title}
            </h1>
            <Badge variant={plan.active ? "secondary" : "outline"} className={cn(
              "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-none shadow-sm",
              plan.active ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground/50"
            )}>
              {plan.active ? "Live" : "Inactive"}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <span className="flex items-center gap-1.5"><Tag size={12} className="text-primary" /> PID: <span className="font-mono text-foreground/80">{truncateAddress(plan.planId)}</span></span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="flex items-center gap-1.5"><Globe size={12} className="text-primary" /> Network: <span className="text-foreground/80">ARC Testnet</span></span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="flex items-center gap-1.5"><Clock size={12} className="text-primary" /> Cycle: <span className="text-foreground/80">{humanDuration(plan.duration)}</span></span>
          </div>
        </div>

        <div className="flex gap-3">
          <EditPlanDialog 
            planId={plan.planId} 
            durationSeconds={Number(plan.duration)} 
            metadata={plan.metadata} 
            onSuccess={() => window.location.reload()} 
          />
          <Button 
            asChild
            variant="outline"
            className="h-11 px-6 rounded-xl border-border/80 font-black uppercase tracking-widest text-[10px]"
          >
            <a href={`https://testnet.arcscan.app/address/${SUBSCRIPTION_GATEWAY_ADDRESS}`} target="_blank" rel="noreferrer">
              On-Chain Ledger <ArrowUpRight size={14} className="ml-2 opacity-40" />
            </a>
          </Button>
          <Button 
            onClick={() => void handleToggleStatus()}
            disabled={toggling || !wallet}
            variant={plan.active ? "destructive" : "default"}
            className={cn(
              "h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] border-none shadow-lg transition-all",
              plan.active ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" : "bg-primary text-primary-foreground shadow-primary/20"
            )}
          >
            {toggling ? "Processing..." : plan.active ? "Deactivate Protocol" : "Restore Protocol"}
          </Button>
        </div>
      </div>

      {/* Analytics Matrix */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Gross Volume", value: `$${Number(formatUnits(plan.totalGrossVolume, 6)).toLocaleString()}`, sub: `${plan.subscriptionCount} Total Subs`, icon: Activity, color: "text-primary" },
          { label: "Active Members", value: metrics.activeBuyerCount, sub: `Renewals: ${analytics.activeRate.toFixed(1)}%`, icon: Users, color: "text-sky-500" },
          { label: "Net Earnings", value: `$${Number(formatUnits(analytics.netEarnings, 6)).toLocaleString()}`, sub: `After 5% Fee`, icon: Target, color: "text-emerald-500" },
          { label: "Avg. Ticket", value: `$${Number(formatUnits(analytics.avgRevenuePerSubscriber, 6)).toFixed(2)}`, sub: "Per Active Cycle", icon: TrendingUp, color: "text-amber-500" },
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

      {/* Tier Architecture section (Full Width) */}
      <section className="space-y-6">
        <SectionHeader title="Tier Architecture" subtitle="Offering & Entitlement Matrix" icon={Layers} />
        <div className="grid gap-6 md:grid-cols-3">
          {isV11 ? (
            plan.metadata?.tiers?.map((tier: any, i: number) => (
              <Card key={i} className="relative bg-card border-border/80 rounded-2xl overflow-hidden shadow-none group hover:border-primary/30 transition-all">
                <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-all group-hover:bg-primary/10" />
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[9px] font-black uppercase tracking-widest px-2.5 py-1">
                      Tier 0{i + 1}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight mb-1">{tier.label}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black italic">${tier.price}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">USDC / Cycle</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-6">
                  <div className="h-[1px] w-full bg-border/10" />
                  <div className="space-y-4">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Tier Entitlements</p>
                    <div className="space-y-3">
                      {tier.features?.map((f: any, fi: number) => (
                        <div key={fi} className="flex gap-3">
                          <CheckCircle2 size={12} className="text-emerald-500 mt-1 flex-shrink-0 stroke-[3px]" />
                          <div>
                            <p className="text-[11px] font-bold text-foreground leading-tight">{f.title}</p>
                            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">{f.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="md:col-span-3 bg-muted/5 border-dashed border-border border-2 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
               <Layers size={24} className="text-muted-foreground/30" />
               <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Legacy v1.0 Plan</p>
                 <p className="text-sm font-bold text-foreground/60">This protocol was deployed using a single-tier configuration.</p>
               </div>
            </Card>
          )}
        </div>
      </section>

      {/* Middle Grid: Revenue vs Brand Info */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Chart Column (2/3) */}
        <div className="lg:col-span-2">
          <section className="space-y-6">
            <SectionHeader title="Revenue Scaling" subtitle="Historical Settlement Performance" icon={TrendingUp} />
            <Card className="bg-card border-border/80 shadow-none rounded-3xl overflow-hidden h-full">
              <CardContent className="p-8 pl-2">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="var(--border)" opacity={0.5} />
                      <XAxis 
                        dataKey="date" 
                        stroke="var(--muted-foreground)" 
                        fontSize={10} 
                        fontWeight="bold"
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(v) => v.split("-").slice(1).join("/")}
                        dy={10}
                      />
                      <YAxis stroke="var(--muted-foreground)" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', border: '1px solid var(--border)' }}
                        labelStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px', marginBottom: '4px' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--foreground)' }}
                      />
                      <Area type="monotone" dataKey="revenueNum" name="Revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Sidebar Column (1/3) */}
        <div className="space-y-8">
           {/* Brand Identity Card */}
           <section className="space-y-6">
            <SectionHeader title="Provider" subtitle="Identity Verification Hub" icon={ShieldCheck} />
            <Card className="bg-card border-border/80 shadow-none rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                   <Globe size={24} strokeWidth={2.5} />
                 </div>
                 <div>
                   <p className="text-xl font-black uppercase tracking-tight leading-none mb-1">{brand?.name || "Verified Merchant"}</p>
                   <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Global Provider</p>
                 </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Gateway Resolution</p>
                  <a href={brand?.website} target="_blank" rel="noreferrer" className="text-xs font-bold text-foreground flex items-center gap-1.5 hover:text-primary transition-colors truncate">
                    {brand?.website || "N/A"} <ExternalLink size={10} />
                  </a>
                </div>
                <div className="h-[1px] w-full bg-border/10" />
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                     <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Settlement Fee</p>
                     <p className="text-xs font-black italic">500 BPS (5%)</p>
                   </div>
                   <div className="text-right space-y-1">
                     <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Protocol Version</p>
                     <p className="text-xs font-black italic">v1.1.0 Multi-Tier</p>
                   </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Loyalty Metrics Card */}
          <section className="space-y-6">
            <SectionHeader title="Loyalty" subtitle="Returning Member Performance" icon={UserCheck} />
            <Card className="bg-card border-border/80 shadow-none rounded-3xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-2xl font-black italic leading-none">{analytics.repeatBuyerCount}</p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Returning Members</p>
                 </div>
                 <div className="text-right space-y-1">
                    <p className="text-2xl font-black italic text-emerald-500 leading-none">{analytics.repeatBuyerRate.toFixed(1)}%</p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Renewal Rate</p>
                 </div>
              </div>
              <div className="h-2.5 w-full bg-muted/20 rounded-full overflow-hidden border border-border/10">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]" 
                  style={{ width: `${analytics.repeatBuyerRate}%` }} 
                />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground leading-relaxed uppercase tracking-wide opacity-60 italic">
                A high renewal rate means your members are staying subscribed over multiple cycles.
              </p>
            </Card>
          </section>
        </div>
      </div>

      {/* Member Registry (Full Width Bottom) */}
      <section className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <SectionHeader title="Member Registry" subtitle="Participant Access Hub" icon={Users} />
            <div className="relative w-full sm:w-80 mb-6">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 stroke-[3px]" />
              <input 
                type="text" 
                placeholder="Search Identity or Metadata..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-12 bg-muted/20 border border-border/80 rounded-2xl pl-10 pr-4 text-[11px] font-bold outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30 uppercase tracking-widest"
              />
            </div>
         </div>
         <Card className="bg-card border-border/80 shadow-none rounded-3xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="pl-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subscriber Wallet</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cycles</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Paid</TableHead>
                  <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User Info</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBuyers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 italic">
                      No protocol participants discovered in ledger
                    </TableCell>
                  </TableRow>
                ) : filteredBuyers.map((buyer) => (
                  <TableRow key={buyer.id} className="group border-border/20 hover:bg-muted/5 transition-colors">
                    <TableCell className="pl-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-black text-primary border border-primary/20">
                          {buyer.subscriber.slice(2, 4).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black italic text-sm">{truncateAddress(buyer.subscriber)}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest break-all opacity-40">{buyer.subscriber}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border-none shadow-sm",
                        buyer.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground/50"
                      )}>
                        {buyer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-muted-foreground">
                      {buyer.subscriptionCount} Cycles
                    </TableCell>
                    <TableCell className="text-sm font-black italic">
                      ${Number(formatUnits(buyer.totalSpent, 6)).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right pr-8">
                       <span className="inline-block max-w-[180px] truncate bg-muted/40 px-4 py-2 rounded-xl text-[10px] font-bold text-muted-foreground font-mono group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        {buyer.buyerData || "NULL_DATA"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
         </Card>
      </section>

      <div className="pt-20 text-center opacity-20">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">Mecha Pay Merchant OS v1.1.0 • Settlement Infrastructure</p>
      </div>

    </div>
  );
}
