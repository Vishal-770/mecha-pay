"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle2,
  Clock,
  ShieldCheck,
  Activity,
  AlertCircle,
  ChevronDown
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { SUBSCRIPTION_GATEWAY_ADDRESS } from "@/lib/subscription";

type NotificationEvent = {
  id: string;
  planId: string;
  blockTimestamp: string;
  transactionHash: string;
  type: "STATUS_CHANGE" | "PLAN_UPDATE";
  active?: boolean;
};

type SubscriptionDetail = {
  id: string;
  status: "ACTIVE" | "EXPIRED";
  subscriptionCount: number;
  totalSpent: string;
  totalFeesPaid: string;
  firstStartTime: string;
  remainingSeconds: number;
  lastStartTime: string;
  lastEndTime: string;
  lastBuyerData: string;
  lastTierId: string;
  tierIds?: string[];
  metadata: {
    name?: string;
    brand?: { name?: string; website?: string };
    features?: { title: string; description: string }[];
    version?: string;
    tiers?: { label: string; features: { title: string; description: string }[] }[];
  } | null;
  plan: {
    id: string;
    duration: string;
    active: boolean;
    subscriptionCount: number;
    tiers?: {
      tierId: string;
      price: string;
      label: string;
    }[];
  };
};

function formatCountdown(totalSeconds: number) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((totalSeconds % 3600) / 60);
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

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function SubscriptionDetailPage() {
  const params = useParams<{ id: string }>();
  const { wallet, sessionUserToken } = useDashboardContext();

  const [data, setData] = useState<SubscriptionDetail | null>(null);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!params.id || !wallet?.address || !sessionUserToken) return;
      try {
        setLoading(true);
        const [subRes, notifRes] = await Promise.all([
          fetch(`/api/subscription/my-subscriptions/${params.id}?subscriber=${wallet.address}&userToken=${sessionUserToken}`, { cache: "no-store" }),
          fetch(`/api/subscription/notifications?subscriber=${wallet.address}&userToken=${sessionUserToken}`, { cache: "no-store" })
        ]);

        const subJson = await subRes.json();
        const notifJson = await notifRes.json();

        if (!subRes.ok) throw new Error(subJson.error ?? "Failed to load subscription");

        if (mounted) {
          setData(subJson.subscription);
          const planNotifs = (notifJson.notifications ?? []).filter((n: NotificationEvent) => n.planId === params.id);
          setNotifications(planNotifs);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void run();
    return () => { mounted = false; };
  }, [params.id, wallet?.address, sessionUserToken]);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto py-12 px-6 space-y-10 lg:px-12">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-10 w-96 rounded-2xl" />
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <Skeleton className="h-32 w-full rounded-3xl opacity-60" />
          <Skeleton className="h-32 w-full rounded-3xl opacity-60" />
          <Skeleton className="h-32 w-full rounded-3xl opacity-60" />
        </div>
        <Skeleton className="h-96 w-full rounded-[3rem] opacity-40" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto py-32 px-6 text-center space-y-8">
        <div className="h-20 w-20 bg-destructive/10 text-destructive flex items-center justify-center rounded-[2rem] mx-auto border border-destructive/20 shadow-sm">
          <AlertCircle size={36} />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black tracking-tight">Subscription missing</h2>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            {error || "This subscription could not be located on the network or is still syncing."}
          </p>
        </div>
        <Button asChild variant="outline" className="h-12 px-8 rounded-2xl font-bold text-xs">
          <Link href="/dashboard/subscriptions">Return to Subscriptions</Link>
        </Button>
      </div>
    );
  }

  const title = data.metadata?.name ?? `Subscription ${data.plan.id.slice(0, 8)}`;
  const isActive = data.status === "ACTIVE";
  const brand = data.metadata?.brand;
  
  const activeTiers = data.plan.tiers?.filter(t => data.tierIds?.includes(t.tierId) || t.tierId === data.lastTierId) ?? [];
  const tierLabel = activeTiers.length > 0 ? activeTiers.map(t => t.label).join(", ") : "Standard";
  const progressPercent = Math.min((data.remainingSeconds / Number(data.plan.duration)) * 100, 100);

  const isV11 = data.metadata?.version === "1.1";
  let perks: { title: string; description: string }[] = [];
  if (isV11) {
    activeTiers.forEach(tier => {
      const tierMeta = data.metadata?.tiers?.find(t => t.label === tier.label);
      if (tierMeta?.features) {
        perks.push(...tierMeta.features);
      }
    });
    // Deduplicate perks by title
    const seen = new Set();
    perks = perks.filter(p => {
      if (seen.has(p.title)) return false;
      seen.add(p.title);
      return true;
    });
  } else {
    perks = data.metadata?.features ?? [];
  }

  const renderActivityFeed = () => (
    <div className="py-2">
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground/30">
            <Activity size={24} />
          </div>
          <p className="text-xs font-medium text-muted-foreground max-w-[180px]">No activity logs found for this plan.</p>
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-[1px] before:bg-border/60">
          {notifications.map((notif) => (
            <div key={notif.id} className="relative flex items-start gap-4 group">
              <div className="absolute left-0 mt-1.5 h-[22px] w-[22px] rounded-full border-4 border-background bg-muted group-hover:bg-primary transition-all duration-300" />
              <div className="pl-10 space-y-1.5">
                <p className="text-xs font-bold text-foreground leading-tight">
                  {notif.type === "STATUS_CHANGE" 
                    ? (notif.active ? "Service Enabled" : "Service Disabled")
                    : "Plan Configuration Update"}
                </p>
                <div className="flex items-center gap-4 text-[10px] font-medium text-muted-foreground/80">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 opacity-60" />
                    <span>{timeAgo(notif.blockTimestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-12 pt-6 border-t border-border/20 text-center">
        <a 
          href={`https://testnet.arcscan.app/address/${SUBSCRIPTION_GATEWAY_ADDRESS}`} 
          target="_blank" 
          rel="noreferrer"
          className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"
        >
          <ShieldCheck className="h-3 w-3" />
          Verified Protocol Gateway
        </a>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <div className="w-full pt-8 pb-20 px-6 lg:px-12 space-y-12 mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/subscriptions"
            className="group flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-all"
          >
            <div className="h-6 w-6 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <ArrowLeft size={12} className="stroke-[2.5px]" />
            </div>
            Back to All Subscriptions
          </Link>
        </div>

        {/* Dynamic Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground">{title}</h1>
              <Badge className={cn(
                "text-[10px] font-bold px-3 py-1 rounded-full border-none shadow-sm",
                isActive ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
              )}>
                {isActive ? "Active" : "Expired"}
              </Badge>
            </div>
            <p className="text-sm font-medium text-muted-foreground max-w-xl">
              Configuration and billing details for your active {tierLabel} access tier.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold text-xs border-border/60 hover:bg-muted/50 transition-all gap-2.5">
                  <Activity className="h-4 w-4 text-primary" />
                  Activity
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md md:max-w-lg border-l-border/40 p-0 overflow-hidden flex flex-col">
                <SheetHeader className="p-8 border-b border-border/20 bg-muted/5">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                       <Activity size={24} strokeWidth={2} />
                     </div>
                     <div className="text-left space-y-1">
                       <SheetTitle className="text-lg font-bold tracking-tight">Technical History</SheetTitle>
                       <SheetDescription className="text-xs font-medium">
                         On-chain logs and service state transitions.
                       </SheetDescription>
                     </div>
                  </div>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-8 py-4 no-scrollbar">
                  {renderActivityFeed()}
                </div>
                <div className="p-6 border-t border-border/20 bg-muted/5 text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Enterprise Security Layer</p>
                </div>
              </SheetContent>
            </Sheet>

            <Button asChild variant="outline" className="h-12 px-8 rounded-2xl font-bold text-xs border-border/60 hover:bg-muted/50 transition-all gap-2">
              <Link href={`/dashboard/marketplace/${data.plan.id}`}>
                View in Marketplace <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* High-Impact Stats Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="rounded-[2.5rem] border-border/60 shadow-sm p-8 space-y-6">
            <div className="flex items-center justify-between text-muted-foreground">
              <p className="text-[11px] font-bold uppercase tracking-wider">Remaining Time</p>
              <Clock className="h-4 w-4 opacity-40" />
            </div>
            <div className="space-y-4">
              <p className="text-4xl font-black text-foreground tabular-nums">
                {isActive ? formatCountdown(data.remainingSeconds) : "00h 00m"}
              </p>
              <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                 <div 
                   className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out" 
                   style={{ width: `${progressPercent}%` }} 
                 />
              </div>
            </div>
          </Card>

          <Card className="rounded-[2.5rem] border-border/60 shadow-sm p-8 space-y-6">
            <div className="flex items-center justify-between text-muted-foreground">
              <p className="text-[11px] font-bold uppercase tracking-wider">Total Investment</p>
              <p className="text-[10px] font-mono font-bold opacity-60">USDC</p>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-black text-foreground tabular-nums">${formatUnits(data.totalSpent, 6)}</p>
              <p className="text-xs font-medium text-muted-foreground">Across {data.subscriptionCount} billing cycles</p>
            </div>
          </Card>

          <Card className="rounded-[2.5rem] border-border/60 shadow-sm p-8 space-y-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <p className="text-[11px] font-bold uppercase tracking-wider">Service Provider</p>
              <ShieldCheck className="h-4 w-4 opacity-40" />
            </div>
            <div className="space-y-3">
              <p className="text-2xl font-bold text-foreground truncate">{brand?.name || "Independent Provider"}</p>
              {brand?.website && (
                <a 
                  href={brand.website} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 underline underline-offset-4 decoration-primary/20"
                >
                  Official Support <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </Card>
        </div>

        {/* Detail Breakdown */}
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="rounded-[3rem] border-border/60 shadow-sm overflow-hidden flex flex-col">
            <div className="p-10 border-b border-border/30 bg-muted/5 flex items-center justify-between">
               <div className="space-y-1">
                 <h3 className="text-xl font-bold">Active Privileges</h3>
                 <p className="text-xs font-medium text-muted-foreground">Features included in your {tierLabel} plan.</p>
               </div>
               <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                 <CheckCircle2 size={20} />
               </div>
            </div>
            <CardContent className="p-10 flex-1">
              {perks.length === 0 ? (
                <div className="text-center py-12 text-sm font-medium text-muted-foreground border border-dashed rounded-[2rem] bg-muted/5">
                  Standard access tier features apply.
                </div>
              ) : (
                <ul className="grid gap-6">
                  {perks.map((feature, i) => (
                    <li key={i} className="flex gap-4 group">
                      <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                        <CheckCircle2 size={12} strokeWidth={3} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-sm leading-tight text-foreground">{feature.title}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="rounded-[2.5rem] border-border/60 shadow-sm p-8 space-y-6">
               <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Metadata Context</h3>
               <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-1.5">
                   <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Duration</p>
                   <p className="text-sm font-bold">
                     {Number(data.plan.duration) >= 86400 * 30 
                       ? `${Math.round(Number(data.plan.duration) / (86400 * 30))} Months`
                       : Number(data.plan.duration) >= 86400 
                       ? `${Math.round(Number(data.plan.duration) / 86400)} Days`
                       : `${Math.round(Number(data.plan.duration) / 3600)} Hours`}
                   </p>
                 </div>
                 <div className="space-y-1.5 border-l border-border/40 pl-8">
                   <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Network Tax</p>
                   <p className="text-sm font-bold">${formatUnits(data.totalFeesPaid, 6)} <span className="text-[10px] opacity-40">USDC</span></p>
                 </div>
                 <div className="space-y-1.5">
                   <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">First Activated</p>
                   <p className="text-sm font-bold">
                     {new Date(Number(data.firstStartTime) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                   </p>
                 </div>
                 <div className="space-y-1.5 border-l border-border/40 pl-8">
                   <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Plan Adoption</p>
                   <p className="text-sm font-bold">{data.plan.subscriptionCount} active users</p>
                 </div>
               </div>
            </Card>

            {data.lastBuyerData && (
              <Card className="rounded-[2.5rem] border-border/60 shadow-sm p-8 space-y-4 bg-muted/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Transaction Payload</h3>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                </div>
                <div className="bg-background border border-border/60 p-5 rounded-2xl font-mono text-[11px] break-all leading-relaxed text-muted-foreground/80 shadow-inner">
                  {data.lastBuyerData}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="py-12 border-t border-border/20 bg-muted/5 text-center">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Mecha Pay Gateway • Enterprise Portal</p>
      </div>
    </div>
  );
}
