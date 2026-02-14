"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { 
  normalizeIpfsUri,
  type SubscriptionUiMetadata 
} from "@/lib/subscription";
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
  CreditCard,
  Target,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
    metadata: {
      name?: string;
      brand?: { name?: string; website?: string };
      features?: { title: string; description: string }[];
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
      
      setData({
        ...data,
        plan: { ...data.plan, active }
      });
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

    void run();
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
      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">{error ?? "Plan not found"}</h2>
        <Button  variant="outline">
          <Link href="/dashboard/my-plans">Back to my plans</Link>
        </Button>
      </div>
    );
  }

  const { plan, analytics, buyers, metrics } = data;
  const title = plan.metadata?.name ?? `Plan ${plan.planId.slice(0, 10)}`;

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <Link
            href="/dashboard/my-plans"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to my plans
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              plan.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
            }`}>
              {plan.active ? "Active" : "Disabled"}
            </span>
          </div>
          <p className="text-sm font-mono text-muted-foreground">{plan.planId}</p>
        </div>

        <div className="flex gap-2">
           <Button 
            onClick={() => void handleToggleStatus()}
            disabled={toggling || !wallet}
            variant={plan.active ? "destructive" : "default"}
            size="sm"
            className="font-bold"
          >
            {toggling ? "Processing..." : plan.active ? "Deactivate Plan" : "Reactivate Plan"}
          </Button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Pricing</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(formatUnits(plan.price, 6)).toFixed(2)}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase">Cycle: {humanDuration(plan.duration)}</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeBuyerCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase">Total: {metrics.totalBuyers}</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Growth (30d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.windows.thirtyDays.subscriptionCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase">New Subscriptions</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Net Earnings</CardTitle>
            <Target className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(formatUnits(analytics.netEarnings, 6)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase">After protocol fees</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Revenue Visualization */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Revenue Scaling</CardTitle>
              <CardDescription>Visualizing your plan's growth through subscription cycles</CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis 
                       dataKey="date" 
                       stroke="var(--muted-foreground)" 
                       fontSize={11} 
                       tickLine={false} 
                       axisLine={false} 
                       tickFormatter={(v) => v.split("-").slice(1).join("/")}
                    />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                       contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                       labelStyle={{ fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="revenueNum" name="Revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Members Table */}
          <Card className="border-border bg-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Member Directory</CardTitle>
                <CardDescription>Full history of active and past subscribers</CardDescription>
              </div>
              <div className="relative w-full max-w-xs">
                <input 
                  type="text" 
                  placeholder="Filter members..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Subscriber</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Lifetime Spent</TableHead>
                    <TableHead className="text-right pr-6">Metadata</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBuyers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                        No subscribers found matching filters
                      </TableCell>
                    </TableRow>
                  ) : filteredBuyers.map((buyer) => (
                    <TableRow key={buyer.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {buyer.subscriber.slice(2, 4).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{truncateAddress(buyer.subscriber)}</p>
                            <p className="text-[10px] text-muted-foreground">{buyer.subscriptionCount} cycles</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
                          buyer.status === "ACTIVE" 
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" 
                            : "bg-muted text-muted-foreground ring-border"
                        }`}>
                          {buyer.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-bold">
                        ${Number(formatUnits(buyer.totalSpent, 6)).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                         <span className="text-[10px] bg-muted px-2 py-1 rounded-md text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors cursor-default max-w-[120px] truncate block ml-auto">
                          {buyer.buyerData || "No Data"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Plan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Settlement Target</p>
                <p className="font-mono text-xs text-foreground uppercase break-all">{truncateAddress(plan.seller.id)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">BPS Fee</p>
                  <p className="text-xs font-bold text-foreground">500 (5%)</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Last Sub</p>
                  <p className="text-[10px] font-semibold text-foreground">
                    {plan.lastSubscriptionAt ? new Date(Number(plan.lastSubscriptionAt) * 1000).toLocaleDateString() : "Never"}
                  </p>
                </div>
              </div>
              {plan.metadata?.brand?.website && (
                 <div className="pt-2">
                   <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Brand Website</p>
                   <a 
                    href={plan.metadata.brand.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-sky-500 hover:underline flex items-center gap-1"
                   >
                     {plan.metadata.brand.website.replace(/^https?:\/\//, "")} <ExternalLink className="h-2 w-2" />
                   </a>
                 </div>
              )}
            </CardContent>
          </Card>

          {plan.metadata?.features && plan.metadata.features.length > 0 && (
             <Card className="border-border bg-card bg-primary/5 border-primary/10">
               <CardHeader className="pb-2">
                 <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary">Key Features</CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                 {plan.metadata.features.map((feature: any, i: number) => (
                    <div key={i} className="space-y-0.5">
                      <p className="text-[11px] font-bold text-foreground">{feature.title}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">{feature.description}</p>
                    </div>
                 ))}
               </CardContent>
             </Card>
          )}

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Retention Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Repeat Buyer Base</p>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold">{analytics.repeatBuyerCount} Users</span>
                  <span className="text-[10px] text-emerald-600">+{analytics.repeatBuyerRate.toFixed(1)}% Rate</span>
                </div>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000" 
                  style={{ width: `${analytics.repeatBuyerRate}%` }} 
                />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                Users with at least one renewal cycle. High repeat rates correlate with high long-term LTV.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Registry Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">On-Chain Active</span>
                <span className={plan.active ? "text-emerald-500" : "text-muted-foreground"}>{plan.active ? "YES" : "NO"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Indexed History</span>
                <span className="text-sky-500">COMPLETE</span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2" >
                <a href={`https://explorer.circle.com/address/${plan.planId}`} target="_blank" rel="noreferrer">
                  View on Explorer <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
