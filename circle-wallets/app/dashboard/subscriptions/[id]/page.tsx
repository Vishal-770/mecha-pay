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
  XCircle,
  Settings,
  ArrowUpRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
      <div className="w-full py-10 px-6 lg:px-12 max-w-[1400px] mx-auto space-y-0">
        <div className="py-8 border-b border-border/15 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 divide-x divide-border/15 border-b border-border/15">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-6 py-6 first:pl-0 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
        <div className="py-10 space-y-4">
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full py-10 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="py-16 flex flex-col items-center gap-4 text-center border-b border-border/15">
          <AlertCircle size={24} className="text-destructive/50" />
          <div>
            <p className="text-sm font-semibold text-foreground">Subscription missing</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {error || "This subscription could not be located on the network or is still syncing."}
            </p>
          </div>
          <Button asChild variant="outline" className="h-9 px-4 text-xs font-medium rounded-lg">
            <Link href="/dashboard/subscriptions">Return to Subscriptions</Link>
          </Button>
        </div>
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

  const renderNotifications = () => (
    <div className="space-y-0">
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <Activity size={18} className="text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground/50">No updates found for this subscription</p>
        </div>
      ) : notifications.map((notif) => {
        const isActiveNotif = notif.type === "STATUS_CHANGE" ? notif.active : true;
        let icon = <Settings className="h-3.5 w-3.5" />;
        let label = "Plan Update";
        let desc = "Plan rules or pricing updated.";

        if (notif.type === "STATUS_CHANGE") {
          if (isActiveNotif) {
            icon = <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />;
            label = "Activated";
            desc = "Subscription is now active.";
          } else {
            icon = <XCircle className="h-3.5 w-3.5 text-muted-foreground/60" />;
            label = "Deactivated";
            desc = "Subscription has ended.";
          }
        }

        return (
          <div key={notif.id} className="flex items-start gap-3 py-4 border-b border-border/10 last:border-0">
            <div className="h-6 w-6 rounded-full bg-muted/40 flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground/60">
              {icon}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold text-foreground">{label}</span>
                <span className="text-[10px] text-muted-foreground/50">{timeAgo(notif.blockTimestamp)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{desc}</p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40 mt-1">
                <a href={`https://testnet.arcscan.app/tx/${notif.transactionHash}`} target="_blank" rel="noreferrer" className="font-mono hover:text-primary transition-colors flex items-center gap-0.5">
                  Tx: {notif.transactionHash.slice(0, 6)}…{notif.transactionHash.slice(-4)} <ArrowUpRight className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full py-10 px-6 lg:px-12 pb-28 max-w-[1400px] mx-auto space-y-0">
      
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between py-8 border-b border-border/15">
        <div className="space-y-2">
          <Link
            href="/dashboard/subscriptions"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={11} />
            Subscriptions
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            <span className={cn(
              "inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full",
              isActive
                ? "bg-blue-500/10 text-blue-600"
                : "bg-muted text-muted-foreground"
            )}>
              {isActive ? "● Active" : "○ Expired"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Configuration and billing details for your {tierLabel} tier
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 px-4 text-xs font-medium gap-1.5 text-muted-foreground hover:text-foreground">
                <Activity className="h-3.5 w-3.5" />
                Updates
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-sm border-l border-border/20 p-0 flex flex-col">
              <SheetHeader className="px-6 py-5 border-b border-border/10">
                <SheetTitle className="text-sm font-semibold">Notifications & Updates</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Updates and status history for this plan.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6 py-2">
                {renderNotifications()}
              </div>
              <div className="px-6 py-4 border-t border-border/10">
                <a 
                  href={`https://testnet.arcscan.app/address/${SUBSCRIPTION_GATEWAY_ADDRESS}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  <ShieldCheck className="h-3 w-3" /> Secured by Arc Network
                </a>
              </div>
            </SheetContent>
          </Sheet>

          <Button asChild size="sm" variant="outline" className="h-9 px-4 text-xs font-medium gap-1.5 rounded-lg border-border/60 hover:bg-muted/50">
            <Link href={`/dashboard/marketplace/${data.plan.id}`}>
              Marketplace <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Summary Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 divide-x divide-border/15 border-b border-border/15">
        <div className="flex flex-col gap-1.5 px-6 py-6 first:pl-0 last:pr-0">
          <p className="text-[11px] text-muted-foreground">Remaining Time</p>
          <div className="space-y-2">
            <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
              {isActive ? formatCountdown(data.remainingSeconds) : "00h 00m"}
            </p>
            {isActive && (
              <div className="h-0.5 w-full max-w-[200px] bg-muted/40 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-700" style={{ width: `${progressPercent}%` }} />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 px-6 py-6 first:pl-0 last:pr-0">
          <p className="text-[11px] text-muted-foreground">Total Spent</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            ${Number(formatUnits(data.totalSpent, 6)).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">USDC</span>
          </p>
          <p className="text-[11px] text-muted-foreground/60">Across {data.subscriptionCount} cycle{data.subscriptionCount !== 1 ? "s" : ""}</p>
        </div>

        <div className="flex flex-col gap-1.5 px-6 py-6 first:pl-0 last:pr-0 col-span-2 lg:col-span-1">
          <p className="text-[11px] text-muted-foreground">Service Provider</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground truncate">
            {brand?.name || "Independent Provider"}
          </p>
          {brand?.website ? (
            <a 
              href={brand.website} 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
            >
              Support website <ExternalLink size={10} />
            </a>
          ) : (
            <p className="text-[11px] text-muted-foreground/60">No support link registered</p>
          )}
        </div>
      </div>

      {/* ── Content Breakdown ──────────────────────────────── */}
      <div className="grid gap-12 lg:grid-cols-2 pt-10">
        
        {/* Left Side: Features list */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Plan Features</h3>
            <p className="text-xs text-muted-foreground">Features included in your current tier.</p>
          </div>

          <div className="border-t border-border/10 pt-4">
            {perks.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Standard access tier features apply.</p>
            ) : (
              <div className="space-y-5">
                {perks.map((feature, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-5 w-5 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={11} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">{feature.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Metadata / Technical parameters */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Plan Details</h3>
            
            <div className="grid grid-cols-2 gap-y-5 gap-x-6 border-t border-border/10 pt-4">
              <div className="space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">Billing Cycle</p>
                <p className="text-xs font-semibold text-foreground">
                  {Number(data.plan.duration) >= 86400 * 30 
                    ? `${Math.round(Number(data.plan.duration) / (86400 * 30))} Months`
                    : Number(data.plan.duration) >= 86400 
                    ? `${Math.round(Number(data.plan.duration) / 86400)} Days`
                    : `${Math.round(Number(data.plan.duration) / 3600)} Hours`}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">Network Fees</p>
                <p className="text-xs font-semibold text-foreground">${formatUnits(data.totalFeesPaid, 6)} USDC</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">First Activated</p>
                <p className="text-xs font-semibold text-foreground">
                  {new Date(Number(data.firstStartTime) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">Adoption</p>
                <p className="text-xs font-semibold text-foreground">{data.plan.subscriptionCount} total subscribers</p>
              </div>
            </div>
          </div>

          {data.lastBuyerData && (
            <div className="space-y-2 pt-4 border-t border-border/10">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">Transaction Payload</p>
              <div className="p-3 bg-muted/30 border border-border/10 rounded-lg font-mono text-[10px] break-all leading-normal text-muted-foreground/80">
                {data.lastBuyerData}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
