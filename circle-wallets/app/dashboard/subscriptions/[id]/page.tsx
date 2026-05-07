"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { 
  ArrowLeft, 
  Bell, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  ShieldCheck,
  Globe,
  Settings,
  AlertTriangle,
  Activity,
  ChevronRight,
  RefreshCcw
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { SUBSCRIPTION_GATEWAY_ADDRESS } from "@/lib/subscription";

type NotificationEvent = {
  id: string;
  planId: string;
  blockTimestamp: string;
  transactionHash: string;
  type: "STATUS_CHANGE" | "PLAN_UPDATE";
  active?: boolean;
  price?: string;
  duration?: string;
  ipfsHash?: string;
};

type SubscriptionDetail = {
  id: string;
  status: "ACTIVE" | "EXPIRED";
  subscriptionCount: number;
  totalSpent: string;
  remainingSeconds: number;
  lastStartTime: string;
  lastEndTime: string;
  lastBuyerData: string;
  metadata: {
    name?: string;
    brand?: { name?: string; website?: string };
    features?: { title: string; description: string }[];
  } | null;
  plan: {
    id: string;
    price: string;
    duration: string;
    active: boolean;
    tiers?: {
      tierId: string;
      price: string;
      label: string;
    }[];
  };
  seller: { id: string };
};

function formatCountdown(totalSeconds: number) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h ${minutes}m`;
}

function timeAgo(timestamp: string) {
  const seconds = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (seconds < 60) return "Just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function SubscriptionDetailPage() {
  const params = useParams<{ id: string }>();
  const { wallet } = useDashboardContext();

  const [data, setData] = useState<SubscriptionDetail | null>(null);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!params.id || !wallet?.address) return;
      try {
        setLoading(true);
        const [subRes, notifRes] = await Promise.all([
          fetch(`/api/subscription/my-subscriptions/${params.id}?subscriber=${wallet.address}`, { cache: "no-store" }),
          fetch(`/api/subscription/notifications?subscriber=${wallet.address}`, { cache: "no-store" })
        ]);

        const subJson = await subRes.json();
        const notifJson = await notifRes.json();

        if (!subRes.ok) throw new Error(subJson.error ?? "Failed to load subscription");

        if (mounted) {
          setData(subJson.subscription);
          // Filter notifications for this specific plan
          const planNotifs = (notifJson.notifications ?? []).filter((n: NotificationEvent) => n.planId === params.id);
          setNotifications(planNotifs);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void run();
    return () => { mounted = false; };
  }, [params.id, wallet?.address]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-3xl border border-slate-100 bg-white p-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-100 border-t-sky-600" />
        <p className="animate-pulse text-sm font-medium text-slate-500">Syncing subscription details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-3xl border border-rose-100 bg-rose-50 p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <Activity size={24} />
        </div>
        <h3 className="mt-4 text-lg font-bold text-rose-900">Load Error</h3>
        <p className="mt-2 text-sm text-rose-600">{error ?? "Subscription data is unavailable"}</p>
        <Link href="/dashboard/subscriptions" className="mt-6 inline-flex text-sm font-semibold text-rose-700 hover:underline">
          <ArrowLeft size={16} className="mr-1" /> Back to My Subscriptions
        </Link>
      </div>
    );
  }

  const title = data.metadata?.name ?? `Plan ${data.plan.id.slice(0, 10)}`;
  const isActive = data.status === "ACTIVE";

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-3 h-8 text-muted-foreground hover:text-foreground">
            <Link href="/dashboard/subscriptions" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Subscriptions
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <Badge variant={isActive ? "secondary" : "outline"} className={isActive ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10" : ""}>
              {data.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-widest">
            <span>Provider:</span>
            <span className="font-mono">{truncateAddress(data.seller.id)}</span>
          </div>
        </div>

        <div className="flex gap-2">
           <Button variant="outline" size="sm" asChild>
             <Link href={`/dashboard/marketplace/${data.plan.id}`} className="flex items-center gap-2">
               Marketplace Listing
               <ExternalLink size={14} />
             </Link>
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Card */}
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Access State</span>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted border border-border">
                        <Clock size={28} className={isActive ? "text-primary" : "text-muted-foreground"} />
                      </div>
                      <div>
                        <p className="text-3xl font-bold tracking-tight">
                          {isActive ? formatCountdown(data.remainingSeconds) : "EXPIRED"}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground">Remaining access time</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                      <span className="text-muted-foreground">Usage Period</span>
                      <span>{Math.round((data.remainingSeconds / Number(data.plan.duration)) * 100)}%</span>
                    </div>
                    <Progress 
                      value={Math.min((data.remainingSeconds / Number(data.plan.duration)) * 100, 100)} 
                      className="h-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-muted/50 p-4 border border-border/50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Settled</span>
                    <p className="mt-1 text-xl font-bold tracking-tight">{formatUnits(data.totalSpent, 6)}</p>
                    <p className="text-[10px] font-medium text-primary uppercase">USDC</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-4 border border-border/50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Renewals</span>
                    <p className="mt-1 text-xl font-bold tracking-tight">{data.subscriptionCount}</p>
                    <p className="text-[10px] font-medium text-muted-foreground">Total Cycles</p>
                  </div>
                  <div className="col-span-2 rounded-xl bg-muted p-4 border border-border">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vault Manifest Payload</span>
                    <div className="mt-2 truncate font-mono text-[11px] font-medium text-foreground bg-background border px-3 py-2 rounded-lg">
                      {data.lastBuyerData || "No data provided"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Metadata Content */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border shadow-none">
              <CardHeader className="p-6">
                 <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Globe size={18} />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold">Brand Hub</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Seller Identity</CardDescription>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Provider</label>
                    <p className="text-sm font-semibold mt-0.5">{data.metadata?.brand?.name || "Verified Merchant"}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Checkout Origin</label>
                    <a 
                      href={data.metadata?.brand?.website} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline text-sm font-medium mt-0.5"
                    >
                      {data.metadata?.brand?.website || "N/A"}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground italic">Settling on Arc Testnet</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-none">
              <CardHeader className="p-6">
                 <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Settings size={18} />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold">Service Perks</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Included Benefits</CardDescription>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-3">
                  {(() => {
                    const isV11 = (data.metadata as any)?.version === "1.1";
                    const features = isV11 
                      ? (data.metadata as any)?.tiers?.flatMap((t: any) => t.features ?? []) ?? []
                      : data.metadata?.features ?? [];

                    return features.map((f: any, i: number) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
                        <CheckCircle2 size={12} className="text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-foreground leading-tight">{f.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{f.description}</p>
                        </div>
                      </div>
                    ));
                  })()}
                  {(!data.metadata?.features || data.metadata.features.length === 0) && (
                    <p className="text-xs text-muted-foreground italic py-8 text-center">No features declared by seller.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar: Activity & Logs */}
        <aside className="space-y-6">
          <Card className="border-border shadow-none">
            <CardHeader className="p-6">
               <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Bell size={18} />
                  </div>
                  <CardTitle className="text-base font-bold">Registry Audit</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-6">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">No recent registry updates.</div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="relative pl-5 border-l-2 border-border last:border-l-transparent">
                      <div className={`absolute -left-1.5 top-0 h-2.5 w-2.5 rounded-full ${notif.type === "STATUS_CHANGE" ? "bg-amber-500" : "bg-primary"}`} />
                      <div className="space-y-1">
                         <span className="text-[10px] font-medium text-muted-foreground leading-none">
                          {timeAgo(notif.blockTimestamp)}
                        </span>
                        <p className="text-xs font-semibold leading-relaxed">
                          {notif.type === "STATUS_CHANGE" 
                            ? `Status flipped to ${notif.active ? "ACTIVE" : "INACTIVE"}`
                            : "Registry metadata synchronized"}
                        </p>
                        <Badge variant="outline" className="text-[9px] h-4 py-0 font-normal px-1.5 opacity-60">
                          {notif.type === "STATUS_CHANGE" ? "Protocol State" : "Metadata Sync"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-muted/10">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Protocol Support</span>
                <p className="text-xs font-medium leading-relaxed">
                  Verify transaction logs on-chain for precise settlement records.
                </p>
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-between h-9 text-xs font-bold" size="sm">
                  Provider Support
                  <ChevronRight size={14} className="opacity-40" />
                </Button>
                <Button 
                  asChild
                  variant="outline" 
                  className="w-full justify-between h-9 text-xs font-bold group" 
                  size="sm"
                >
                  <a href={`https://testnet.arcscan.app/address/${SUBSCRIPTION_GATEWAY_ADDRESS}`} target="_blank" rel="noreferrer">
                    On-chain Explorer
                    <ExternalLink size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}
