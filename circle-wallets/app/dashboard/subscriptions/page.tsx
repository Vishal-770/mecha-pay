"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { 
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Activity,
  Monitor,
  ChevronRight,
  ChevronDown,
  Clock
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SubscriptionRow = {
  id: string;
  status: "ACTIVE" | "EXPIRED";
  subscriptionCount: number;
  totalSpent: string;
  remainingSeconds: number;
  canRenew: boolean;
  lastTierId?: string;
  tierIds?: string[];
  plan: {
    id: string;
    duration: string;
    tiers: {
      tierId: string;
      price: string;
      label: string;
    }[];
  };
  metadata: { 
    name?: string;
    brand?: { name?: string; website?: string };
  } | null;
};

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

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function MySubscriptionsPage() {
  const { wallet, sessionUserToken } = useDashboardContext();
  const [items, setItems] = useState<SubscriptionRow[]>([]);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
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
        const [subRes, notifRes] = await Promise.all([
          fetch(`/api/subscription/my-subscriptions?subscriber=${wallet.address}&userToken=${sessionUserToken}`, { cache: "no-store" }),
          fetch(`/api/subscription/notifications?subscriber=${wallet.address}&userToken=${sessionUserToken}`, { cache: "no-store" })
        ]);

        const subJson = await subRes.json();
        const notifJson = await notifRes.json();

        if (!subRes.ok) throw new Error(subJson.error ?? "Failed to load subscriptions");
        
        if (mounted) {
          setItems(subJson.subscriptions ?? []);
          setNotifications(notifJson.notifications ?? []);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void run();
    return () => { mounted = false; };
  }, [wallet?.address, sessionUserToken]);

  const renderActivityFeed = () => (
    <div className="py-2">
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground/30">
            <Activity size={24} />
          </div>
          <p className="text-xs font-medium text-muted-foreground max-w-[180px]">No recent activity has been recorded on the network.</p>
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-[1px] before:bg-border/60">
          {notifications.map((notif) => (
            <div key={notif.id} className="relative flex items-start gap-4 group">
              <div className="absolute left-0 mt-1.5 h-[22px] w-[22px] rounded-full border-4 border-background bg-muted group-hover:bg-primary transition-all duration-300" />
              <div className="pl-10 space-y-1.5">
                <p className="text-xs font-bold text-foreground leading-tight">
                  {notif.type === "STATUS_CHANGE" 
                    ? `Plan ${notif.planId.slice(0, 8)} updated to ${notif.active ? "Active" : "Inactive"}`
                    : `Plan ${notif.planId.slice(0, 8)} technical update`}
                </p>
                <div className="flex items-center gap-4 text-[10px] font-medium text-muted-foreground/80">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 opacity-60" />
                    <span>{timeAgo(notif.blockTimestamp)}</span>
                  </div>
                  <a 
                    href={`https://testnet.arcscan.app/tx/${notif.transactionHash}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="hover:text-primary transition-colors flex items-center gap-1 font-bold"
                  >
                    View Receipt <ArrowUpRight className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="w-full pt-10 pb-10 px-6 space-y-10 lg:px-12 max-w-[1600px] mx-auto">
        <div className="space-y-6">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-10 w-80 rounded-2xl" />
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="h-[300px] rounded-[2.5rem] opacity-50" />
          <Skeleton className="h-[300px] rounded-[2.5rem] opacity-50" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="w-full pt-8 pb-20 px-6 lg:px-12 space-y-12 mx-auto">
        
        {/* Modern Nav Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-all"
          >
            <div className="h-6 w-6 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <ArrowLeft size={12} className="stroke-[2.5px]" />
            </div>
            Back to Dashboard
          </Link>
        </div>

        {/* Enhanced Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground">
              My Subscriptions
            </h1>
            <p className="text-sm font-medium text-muted-foreground max-w-xl">
              Manage your active service subscriptions, track remaining time, and view historical transaction receipts.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold text-xs border-border/60 hover:bg-muted/50 transition-all gap-2.5">
                  <Activity className="h-4 w-4 text-primary" />
                  History
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md md:max-w-lg border-l-border/40 p-0 overflow-hidden flex flex-col">
                <SheetHeader className="p-8 border-b border-border/20 bg-muted/5">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                       <Activity size={24} strokeWidth={2} />
                     </div>
                     <div className="text-left space-y-1">
                       <SheetTitle className="text-lg font-bold tracking-tight">Recent Activity</SheetTitle>
                       <SheetDescription className="text-xs font-medium">
                         Blockchain transaction logs and status changes.
                       </SheetDescription>
                     </div>
                  </div>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-8 py-2 no-scrollbar">
                  {renderActivityFeed()}
                </div>
                <div className="p-6 border-t border-border/20 bg-muted/5 text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Secured by Arc Settlement Layer</p>
                </div>
              </SheetContent>
            </Sheet>

            <Button asChild className="h-12 px-8 rounded-2xl font-bold text-xs shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all gap-2">
              <Link href="/dashboard/marketplace">
                Marketplace <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="border border-border/50 bg-muted/5 flex flex-col items-center justify-center py-40 text-center gap-8 rounded-[3rem]">
            <div className="h-24 w-24 rounded-[2rem] bg-muted/50 flex items-center justify-center text-muted-foreground/20 border border-border/40">
              <Monitor size={48} strokeWidth={1.5} />
            </div>
            <div className="space-y-3 px-6">
              <h3 className="text-3xl font-bold tracking-tight">No active subscriptions</h3>
              <p className="text-sm font-medium text-muted-foreground max-w-sm mx-auto leading-relaxed">
                You haven't subscribed to any services yet. Explore the marketplace to find tools and plans for your business.
              </p>
            </div>
            <Button asChild className="h-12 px-8 rounded-2xl font-bold text-xs">
              <Link href="/dashboard/marketplace">Browse Marketplace</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            {items.map((item) => {
              const title = item.metadata?.name ?? item.metadata?.brand?.name ?? `Subscription ${item.plan.id.slice(0, 8)}`;
              const progress = item.status === "ACTIVE" 
                ? Math.min((item.remainingSeconds / Number(item.plan.duration)) * 100, 100) 
                : 0;

              const activeTiers = item.plan.tiers?.filter(t => item.tierIds?.includes(t.tierId) || t.tierId === item.lastTierId) ?? [];
              const tierLabel = activeTiers.length > 0 ? activeTiers.map(t => t.label).join(", ") : "Standard";

              return (
                <Card key={item.id} className="group flex flex-col bg-card border-border/60 rounded-[2.5rem] hover:border-primary/30 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5">
                  <CardHeader className="p-8 pb-6 border-b border-border/30 relative bg-muted/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <Badge className={cn(
                          "text-[10px] font-bold px-3 py-1 rounded-full border-none shadow-sm",
                          item.status === "ACTIVE" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                        )}>
                          {item.status === "ACTIVE" ? "Active" : "Expired"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-bold px-3 py-1 rounded-full border-primary/20 text-primary bg-primary/5">
                          {tierLabel}
                        </Badge>
                      </div>
                      <span className="text-[10px] font-mono font-medium text-muted-foreground/60">
                        ID: {item.plan.id.slice(0, 8)}
                      </span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{title}</CardTitle>
                    <div className="mt-3">
                      {item.metadata?.brand?.website ? (
                        <a href={item.metadata.brand.website} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 underline decoration-border group-hover:decoration-primary/40 underline-offset-4">
                          Official Website <ArrowUpRight size={12} />
                        </a>
                      ) : (
                        <span className="text-[10px] font-medium text-muted-foreground/40 italic">Website not verified</span>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 p-8 pt-10 space-y-10 relative">
                    <div className="space-y-5">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Remaining Time</p>
                          <p className="text-3xl font-black text-foreground tabular-nums">
                            {item.status === "ACTIVE" ? formatCountdown(item.remainingSeconds) : "00h 00m"}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                           <p className="text-[11px] font-bold text-primary uppercase tracking-wider">{Math.round(progress)}% Usage</p>
                        </div>
                      </div>
                      <div className="relative h-2.5 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                         <div 
                           className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out" 
                           style={{ width: `${progress}%` }} 
                         />
                      </div>
                    </div>
 
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Investment</p>
                        <p className="text-2xl font-bold text-foreground leading-none">${formatUnits(item.totalSpent, 6)} <span className="text-xs font-medium text-muted-foreground">USDC</span></p>
                      </div>
                      <div className="space-y-2 border-l border-border/40 pl-8">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Billing Cycles</p>
                        <p className="text-2xl font-bold text-foreground leading-none">{item.subscriptionCount}</p>
                      </div>
                    </div>
 
                    <div className="pt-2">
                      <Button asChild className="w-full h-14 rounded-[1.25rem] font-bold text-xs transition-all border-border/60 hover:bg-primary hover:text-white hover:border-primary" variant="outline">
                        <Link href={`/dashboard/subscriptions/${item.plan.id}`} className="flex items-center justify-center gap-2">
                          Manage Subscription <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="py-12 border-t border-border/20 bg-muted/5 text-center">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Mecha Pay Gateway • Enterprise Portal</p>
      </div>
    </div>
  );
}
