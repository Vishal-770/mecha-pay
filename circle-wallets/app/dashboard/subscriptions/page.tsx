"use client";

import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Button, 
  buttonVariants 
} from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  Bell, 
  Settings, 
  Activity, 
  Clock, 
  ChevronRight,
  Monitor,
  ShieldCheck,
  Zap
} from "lucide-react";

type SubscriptionRow = {
  id: string;
  status: "ACTIVE" | "EXPIRED";
  subscriptionCount: number;
  totalSpent: string;
  remainingSeconds: number;
  canRenew: boolean;
  plan: {
    id: string;
    duration: string;
    tiers: {
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

export default function MySubscriptionsPage() {
  const { wallet } = useDashboardContext();
  const [items, setItems] = useState<SubscriptionRow[]>([]);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
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
        const [subRes, notifRes] = await Promise.all([
          fetch(`/api/subscription/my-subscriptions?subscriber=${wallet.address}`, { cache: "no-store" }),
          fetch(`/api/subscription/notifications?subscriber=${wallet.address}`, { cache: "no-store" })
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
  }, [wallet?.address]);

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-6 sm:grid-cols-2">
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
          <Skeleton className="h-[400px] rounded-[2rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Active Memberships</h2>
        <p className="text-muted-foreground mt-1">Track your recurring subscriptions and access benefits across the ecosystem.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main Content: Plans */}
        <div className="space-y-6">
          {items.length === 0 ? (
            <Card className="border-dashed flex flex-col items-center justify-center p-20 text-center gap-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Monitor className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>No Active Subscriptions</CardTitle>
                <CardDescription className="mt-2 max-w-sm">
                  You haven't joined any plans yet. Explore the marketplace to find exclusive content and services.
                </CardDescription>
              </div>
              <Link 
                href="/dashboard/marketplace" 
                className={cn(buttonVariants({ variant: "outline" }), "mt-2")}
              >
                Browse Marketplace <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {items.map((item) => {
                const title = item.metadata?.name ?? item.metadata?.brand?.name ?? `Plan ${item.plan.id.slice(0, 10)}`;
                const planNotifs = notifications.filter(n => n.planId === item.plan.id);
                const latestNotif = planNotifs[0];
                const prices = item.plan.tiers?.map(t => BigInt(t.price)) ?? [];
                const minPrice = prices.length > 0 ? prices.reduce((a, b) => a < b ? a : b) : 0n;
                const maxPrice = prices.length > 0 ? prices.reduce((a, b) => a > b ? a : b) : 0n;
                const priceDisplay = minPrice === maxPrice 
                  ? `${formatUnits(minPrice, 6)} USDC`
                  : `${formatUnits(minPrice, 6)} - ${formatUnits(maxPrice, 6)} USDC`;

                const progress = item.status === "ACTIVE" 
                  ? Math.min((item.remainingSeconds / Number(item.plan.duration)) * 100, 100) 
                  : 0;

                return (
                  <Card key={item.id} className="group relative overflow-hidden transition-all hover:shadow-md border-border bg-card">
                    {latestNotif && (
                      <div className="absolute top-3 right-3">
                         <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg animate-pulse">
                          <Bell size={12} />
                        </div>
                      </div>
                    )}
                    
                    <CardHeader className="pb-4">
                      <div className="flex flex-col gap-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">{title}</CardTitle>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {priceDisplay} &middot; {Math.floor(Number(item.plan.duration) / 86400)} Day Cycle
                        </p>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                            <Clock size={12} className="text-sky-500" /> Time Remaining
                          </span>
                          <span className="font-bold">
                            {item.status === "ACTIVE" ? formatCountdown(item.remainingSeconds) : "Expired"}
                          </span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>

                      {latestNotif && (
                        <div className="rounded-xl bg-primary/5 p-3 border border-primary/10">
                          <div className="flex gap-2.5">
                            <div className="mt-0.5 rounded-full bg-primary/10 p-1 text-primary">
                              <Zap size={10} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-foreground leading-tight">
                                {latestNotif.type === "STATUS_CHANGE" 
                                  ? `Seller status: ${latestNotif.active ? "Active" : "Paused"}`
                                  : "Pricing/Metadata update"}
                              </p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">{timeAgo(latestNotif.blockTimestamp)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Total Spent</span>
                          <span className="text-sm font-bold">${formatUnits(item.totalSpent, 6)}</span>
                        </div>
                        <Link 
                          href={`/dashboard/subscriptions/${item.plan.id}`} 
                          className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "h-8")}
                        >
                          View Details
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications Sidebar */}
        <aside className="space-y-6">
          <Card className="rounded-[2rem] border-border bg-card shadow-sm">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Activity size={18} />
                </div>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-foreground">Activity Feed</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-2">
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar focus-visible:outline-none">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                    <Monitor size={32} />
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">No recent activity</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="flex gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${notif.type === "STATUS_CHANGE" ? "bg-amber-500" : "bg-sky-500"}`} />
                      <div className="space-y-1 min-w-0">
                        <p className="text-[11px] font-bold leading-tight">
                          {notif.type === "STATUS_CHANGE" 
                            ? `Plan ${notif.planId.slice(0, 8)} status: ${notif.active ? "Enabled" : "Disabled"}`
                            : `Plan ${notif.planId.slice(0, 8)} details updated`}
                        </p>
                        <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                          <Clock size={8} /> {timeAgo(notif.blockTimestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <Button variant="ghost" className="mt-4 w-full h-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Mark all read
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground overflow-hidden shadow-xl shadow-primary/20">
            <CardHeader className="p-5 pb-0 flex flex-row items-center justify-between space-y-0">
               <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-80">Trust Score</CardTitle>
               <ShieldCheck className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent className="p-5">
              <p className="text-[11px] leading-relaxed font-medium opacity-90">
                You are currently subscribed to verified providers on the ARC network. All payments are secured by smart contracts.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
