"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { 
  ArrowRight,
  ArrowLeft,
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

type SubscriptionRow = {
  id: string;
  status: "ACTIVE" | "EXPIRED";
  subscriptionCount: number;
  totalSpent: string;
  remainingSeconds: number;
  canRenew: boolean;
  lastTierId?: string;
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

export default function MySubscriptionsPage() {
  const { wallet } = useDashboardContext();
  const [items, setItems] = useState<SubscriptionRow[]>([]);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActivityOpen, setIsActivityOpen] = useState(false);

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

  const renderActivityFeed = () => (
    <>
      {notifications.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {notifications.map((notif) => (
            <div key={notif.id} className="relative flex items-start gap-4">
              <div className="absolute left-0 h-4 w-4 rounded-full border-2 border-background bg-primary" />
              <div className="pl-6 space-y-1">
                <p className="text-sm font-medium">
                  {notif.type === "STATUS_CHANGE" 
                    ? `Plan ${notif.planId.slice(0, 8)}: ${notif.active ? "Activated" : "Paused"}`
                    : `Plan ${notif.planId.slice(0, 8)}: Updated`}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{timeAgo(notif.blockTimestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  if (loading) {
    return (
      <div className="w-full pt-6 pb-10 px-6 space-y-8 lg:pr-[360px] lg:pl-10">
        <div className="space-y-4 mb-8">
          <div className="h-4 w-32 bg-muted/40 rounded animate-pulse" />
          <div className="h-10 w-64 bg-muted/40 rounded animate-pulse" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Skeleton className="h-[200px] rounded-xl animate-pulse" />
          <Skeleton className="h-[200px] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Main Content (Left) */}
      <div className="w-full pt-6 pb-10 px-6 space-y-8 lg:pr-[360px] lg:pl-10">
        
        {/* Header Section */}
        <div className="space-y-4 mb-8">
          <Button variant="ghost" size="sm" className="pl-0 text-muted-foreground hover:text-foreground" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">My Subscriptions</h1>
              <p className="text-muted-foreground text-sm">
                Manage your recurring payments and active access tiers.
              </p>
            </div>
            <Button asChild variant="default" className="shrink-0">
              <Link href="/dashboard/marketplace">
                Explore Marketplace <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="border-dashed bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Monitor className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Subscriptions Found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                You haven't joined any plans yet. Visit the marketplace to find services and start subscribing.
              </p>
              <Button asChild>
                <Link href="/dashboard/marketplace">Browse Marketplace</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            {items.map((item) => {
              const title = item.metadata?.name ?? item.metadata?.brand?.name ?? `Plan ${item.plan.id.slice(0, 8)}`;
              const progress = item.status === "ACTIVE" 
                ? Math.min((item.remainingSeconds / Number(item.plan.duration)) * 100, 100) 
                : 0;

              const activeTier = item.plan.tiers?.find(t => t.tierId === item.lastTierId);
              const tierLabel = activeTier?.label || "Standard Tier";

              return (
                <Card key={item.id} className="flex flex-col hover:border-primary/50 transition-colors shadow-sm">
                  <CardHeader className="pb-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={item.status === "ACTIVE" ? "default" : "secondary"}>
                          {item.status}
                        </Badge>
                        <Badge variant="outline" className="text-primary border-primary/30">
                          {tierLabel}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {item.plan.id.slice(0, 8)}...
                      </span>
                    </div>
                    <CardTitle className="text-lg line-clamp-1">{title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1 min-h-[40px]">
                      {item.metadata?.brand?.website ? (
                        <a href={item.metadata.brand.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                          {item.metadata.brand.website}
                        </a>
                      ) : "No description provided."}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 py-4 space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Time Remaining</span>
                        <span className="font-medium">
                          {item.status === "ACTIVE" ? formatCountdown(item.remainingSeconds) : "0s"}
                        </span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Spent</p>
                        <p className="font-semibold text-sm">${formatUnits(item.totalSpent, 6)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Renewals</p>
                        <p className="font-semibold text-sm">{item.subscriptionCount}</p>
                      </div>
                    </div>
                  </CardContent>

                  <div className="p-4 pt-0 mt-auto">
                    <Button asChild className="w-full" variant="outline">
                      <Link href={`/dashboard/subscriptions/${item.plan.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Fixed Activity Sidebar (Desktop Only) */}
      <div className="hidden lg:block fixed right-0 top-20 bottom-0 w-[320px] border-l bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-y-auto z-30">
        <div className="p-6 space-y-6">
          <h3 className="font-semibold text-sm flex items-center gap-2 pb-4 border-b">
            <Activity className="h-4 w-4 text-primary" />
            Global Activity Feed
          </h3>
          {renderActivityFeed()}
        </div>
      </div>

      {/* Mobile Activity Sidebar */}
      <div className="lg:hidden px-4 pb-10">
        <Card>
          <div 
            className="p-6 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setIsActivityOpen(!isActivityOpen)}
          >
            <CardTitle className="flex items-center gap-2 m-0 text-base">
              <Activity className="h-5 w-5 text-primary" />
              Global Activity Feed
            </CardTitle>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isActivityOpen ? "rotate-180" : ""}`} />
          </div>
          {isActivityOpen && (
            <CardContent className="pt-0">
              {renderActivityFeed()}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
