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

export default function SubscriptionDetailPage() {
  const params = useParams<{ id: string }>();
  const { wallet } = useDashboardContext();

  const [data, setData] = useState<SubscriptionDetail | null>(null);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActivityOpen, setIsActivityOpen] = useState(false);

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
  }, [params.id, wallet?.address]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto py-20 px-4 text-center space-y-6">
        <div className="h-16 w-16 bg-destructive/10 text-destructive flex items-center justify-center rounded-full mx-auto">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Subscription Not Found</h2>
          <p className="text-muted-foreground">{error || "This subscription could not be found or is still syncing."}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/subscriptions">Return to Subscriptions</Link>
        </Button>
      </div>
    );
  }

  const title = data.metadata?.name ?? `Plan ${data.plan.id.slice(0, 8)}`;
  const isActive = data.status === "ACTIVE";
  const brand = data.metadata?.brand;
  
  const activeTier = data.plan.tiers?.find(t => t.tierId === data.lastTierId);
  const tierLabel = activeTier?.label ?? "Base";
  const progressPercent = Math.min((data.remainingSeconds / Number(data.plan.duration)) * 100, 100);

  // Filter perks based on tier
  const isV11 = data.metadata?.version === "1.1";
  let perks: { title: string; description: string }[] = [];
  if (isV11) {
    const tierMeta = data.metadata?.tiers?.find(t => t.label === tierLabel);
    perks = tierMeta?.features ?? [];
  } else {
    perks = data.metadata?.features ?? [];
  }

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
                    ? (notif.active ? "Plan Activated" : "Plan Paused")
                    : "Plan Updated"}
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
      
      <div className="mt-8 pt-4 border-t border-border/40 text-center">
        <a 
          href={`https://testnet.arcscan.app/address/${SUBSCRIPTION_GATEWAY_ADDRESS}`} 
          target="_blank" 
          rel="noreferrer"
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
        >
          <ShieldCheck className="h-3 w-3" />
          Verified on Arc Protocol
        </a>
      </div>
    </>
  );

  return (
    <div className="relative min-h-screen">
      {/* Main Content (Left) */}
      <div className="w-full pt-6 pb-10 px-6 space-y-8 lg:pr-[360px] lg:pl-10">
        {/* Header section */}
        <div className="space-y-4 mb-8">
          <Button variant="ghost" size="sm" className="pl-0 text-muted-foreground hover:text-foreground" asChild>
            <Link href="/dashboard/subscriptions">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subscriptions
            </Link>
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
              <div className="flex items-center gap-2">
                <Badge variant={isActive ? "default" : "secondary"}>
                  {data.status}
                </Badge>
                <Badge variant="outline" className="text-primary border-primary/30">
                  Tier: {tierLabel}
                </Badge>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href={`/dashboard/marketplace/${data.plan.id}`}>
                View in Marketplace <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Remaining</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                {isActive ? formatCountdown(data.remainingSeconds) : "Expired"}
              </div>
              <Progress value={progressPercent} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <p className="text-sm text-muted-foreground">USDC</p>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${formatUnits(data.totalSpent, 6)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.subscriptionCount} successful renewal{data.subscriptionCount !== 1 && "s"}
              </p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Provider</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold truncate">{brand?.name || "Unknown Provider"}</div>
              {brand?.website && (
                <a 
                  href={brand.website} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-sm text-primary hover:underline flex items-center mt-1"
                >
                  Visit Website <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-muted/20 shadow-none border-dashed">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Plan Duration</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="font-semibold text-sm">
                {Number(data.plan.duration) >= 86400 * 30 
                  ? `${Math.round(Number(data.plan.duration) / (86400 * 30))} Months`
                  : Number(data.plan.duration) >= 86400 
                  ? `${Math.round(Number(data.plan.duration) / 86400)} Days`
                  : `${Math.round(Number(data.plan.duration) / 3600)} Hours`}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/20 shadow-none border-dashed">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Network Fees Paid</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="font-semibold text-sm">${formatUnits(data.totalFeesPaid, 6)}</div>
            </CardContent>
          </Card>
          <Card className="bg-muted/20 shadow-none border-dashed">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">First Subscribed</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="font-semibold text-sm">
                {new Date(Number(data.firstStartTime) * 1000).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/20 shadow-none border-dashed">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Subscribers</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="font-semibold text-sm">{data.plan.subscriptionCount} Users</div>
            </CardContent>
          </Card>
        </div>

        {/* Features & Data */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Privileges</CardTitle>
              <CardDescription>Features included in your {tierLabel} tier</CardDescription>
            </CardHeader>
            <CardContent>
              {perks.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground border rounded-lg bg-muted/20">
                  No features declared for this tier.
                </div>
              ) : (
                <ul className="space-y-4">
                  {perks.map((feature, i) => (
                    <li key={i} className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm leading-none mb-1">{feature.title}</p>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {data.lastBuyerData && (
            <Card>
              <CardHeader>
                <CardTitle>Subscription Data</CardTitle>
                <CardDescription>Encrypted payload provided during subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm break-all">
                  {data.lastBuyerData}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Fixed Activity Sidebar (Desktop Only) */}
      <div className="hidden lg:block fixed right-0 top-20 bottom-0 w-[320px] border-l bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-y-auto z-30">
        <div className="p-6 space-y-6">
          <h3 className="font-semibold text-sm flex items-center gap-2 pb-4 border-b">
            <Activity className="h-4 w-4 text-primary" />
            Activity History
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
            <CardTitle className="flex items-center gap-2 m-0">
              <Activity className="h-5 w-5" />
              Activity History
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
