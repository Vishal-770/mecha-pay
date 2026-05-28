"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import {
  ArrowRight,
  ArrowUpRight,
  Activity,
  Monitor,
  Clock,
  CheckCircle2,
  XCircle,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
    tiers: { tierId: string; price: string; label: string }[];
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
  const { wallet, sessionUserToken } = useDashboardContext();
  const [items, setItems] = useState<SubscriptionRow[]>([]);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!wallet?.address || !sessionUserToken) { setLoading(false); return; }
      try {
        const [subRes, notifRes] = await Promise.all([
          fetch(`/api/subscription/my-subscriptions?subscriber=${wallet.address}&userToken=${sessionUserToken}`, { cache: "no-store" }),
          fetch(`/api/subscription/notifications?subscriber=${wallet.address}&userToken=${sessionUserToken}`, { cache: "no-store" }),
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

  const renderNotifications = () => (
    <div className="space-y-0">
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <Activity size={18} className="text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground/50">No notifications yet</p>
        </div>
      ) : notifications.map((notif) => {
        const isActive = notif.type === "STATUS_CHANGE" ? notif.active : true;
        let icon = <Settings className="h-3.5 w-3.5" />;
        let label = "Plan Update";
        let desc = "Plan rules or pricing updated.";

        if (notif.type === "STATUS_CHANGE") {
          if (isActive) {
            icon = <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />;
            label = "Activated";
            desc = "Your subscription is now active.";
          } else {
            icon = <XCircle className="h-3.5 w-3.5 text-muted-foreground/60" />;
            label = "Deactivated";
            desc = "Your subscription has ended.";
          }
        }

        const matchedPlan = items.find(i => i.plan.id.toLowerCase() === notif.planId.toLowerCase());
        const planName = matchedPlan?.metadata?.name ?? matchedPlan?.metadata?.brand?.name;

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
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40">
                <span className="font-mono truncate max-w-[120px]">{planName ? `${planName} (${notif.planId.slice(0, 6)})` : notif.planId.slice(0, 10)}</span>
                <span>·</span>
                <a href={`https://testnet.arcscan.app/tx/${notif.transactionHash}`} target="_blank" rel="noreferrer" className="font-mono hover:text-primary transition-colors flex items-center gap-0.5">
                  {notif.transactionHash.slice(0, 6)}…{notif.transactionHash.slice(-4)} <ArrowUpRight className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="w-full py-10 px-6 lg:px-12 max-w-[1400px] mx-auto space-y-0">
        <div className="py-8 border-b border-border/15 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-44" />
        </div>
        <div className="pt-6 space-y-0">
          {[1, 2, 3].map(i => (
            <div key={i} className="py-5 border-b border-border/10 flex items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-4 w-20 hidden md:block" />
              <Skeleton className="h-4 w-16 hidden lg:block" />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-10 px-6 lg:px-12 pb-28 max-w-[1400px] mx-auto space-y-0">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between py-8 border-b border-border/15">
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">Subscriptions</p>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">My Subscriptions</h1>
          <p className="text-[11px] text-muted-foreground">Track your active plans, billing cycles and remaining access time.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
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
                  Real-time updates about plan status and protocol changes.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6 py-2">
                {renderNotifications()}
              </div>
              <div className="px-6 py-4 border-t border-border/10">
                <a href={`https://testnet.arcscan.app`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                  <ShieldCheck className="h-3 w-3" /> Secured by Arc Network
                </a>
              </div>
            </SheetContent>
          </Sheet>

          <Button asChild size="sm" className="h-9 px-4 text-xs font-medium gap-1.5 rounded-lg">
            <Link href="/dashboard/marketplace">
              Marketplace <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Summary Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border/15 border-b border-border/15">
        {[
          { label: "Total Plans", value: `${items.length}`, sub: "Subscribed to" },
          { label: "Active Now", value: `${items.filter(i => i.status === "ACTIVE").length}`, sub: "Currently running" },
          { label: "Total Spent", value: `$${Number(formatUnits(items.reduce((s, i) => s + BigInt(i.totalSpent), BigInt(0)), 6)).toLocaleString()}`, sub: "USDC across all plans" },
          { label: "Billing Cycles", value: `${items.reduce((s, i) => s + i.subscriptionCount, 0)}`, sub: "Total renewals" },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col gap-1.5 px-6 py-6 first:pl-0 last:pr-0">
            <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground/60">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Subscriptions List ─────────────────────────────── */}
      {items.length === 0 ? (
        <div className="py-24 flex flex-col items-center gap-5 text-center">
          <div className="h-12 w-12 rounded-xl bg-muted/30 flex items-center justify-center">
            <Monitor size={20} className="text-muted-foreground/40" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold">No active subscriptions</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              You haven't subscribed to any services yet. Explore the marketplace to discover plans.
            </p>
          </div>
          <Button asChild size="sm" className="h-9 px-5 text-xs font-medium rounded-lg mt-2">
            <Link href="/dashboard/marketplace">Browse Marketplace</Link>
          </Button>
        </div>
      ) : (
        <div className="pt-6">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-6 pb-3 border-b border-border/10">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">Service</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 text-right w-28 hidden md:block">Time Left</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 text-right w-20 hidden md:block">Spent</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 text-right w-16 hidden lg:block">Cycles</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 text-right w-8"></p>
          </div>

          {items.map((item) => {
            const title = item.metadata?.name ?? item.metadata?.brand?.name ?? `Plan ${item.plan.id.slice(0, 8)}`;
            const progress = item.status === "ACTIVE"
              ? Math.min((item.remainingSeconds / Number(item.plan.duration)) * 100, 100)
              : 0;
            const activeTiers = item.plan.tiers?.filter(t => item.tierIds?.includes(t.tierId) || t.tierId === item.lastTierId) ?? [];
            const tierLabel = activeTiers.length > 0 ? activeTiers.map(t => t.label).join(", ") : "Standard";

            return (
              <Link
                key={item.id}
                href={`/dashboard/subscriptions/${item.plan.id}`}
                className="group grid grid-cols-[1fr_auto_auto_auto_auto] gap-6 py-5 border-b border-border/10 items-center hover:bg-muted/[0.025] transition-colors -mx-3 px-3 rounded-lg"
              >
                {/* Service info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{title}</p>
                    <span className={cn(
                      "inline-flex items-center text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0",
                      item.status === "ACTIVE" ? "bg-blue-500/10 text-blue-600" : "bg-muted text-muted-foreground/60"
                    )}>
                      {item.status === "ACTIVE" ? "● Active" : "○ Expired"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 mt-1 text-[11px] text-muted-foreground/60">
                    <span>{tierLabel}</span>
                    <span>·</span>
                    <span className="font-mono">{item.plan.id.slice(0, 8)}</span>
                    {item.metadata?.brand?.website && (
                      <>
                        <span>·</span>
                        <span>{item.metadata.brand.website}</span>
                      </>
                    )}
                  </div>
                  {/* Progress bar */}
                  {item.status === "ACTIVE" && (
                    <div className="mt-2 h-0.5 w-full max-w-xs bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-700" style={{ width: `${progress}%` }} />
                    </div>
                  )}
                </div>

                {/* Time left */}
                <div className="text-right w-28 hidden md:block">
                  <p className="text-sm font-medium text-foreground tabular-nums">
                    {item.status === "ACTIVE" ? formatCountdown(item.remainingSeconds) : "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">{Math.round(progress)}% left</p>
                </div>

                {/* Total spent */}
                <div className="text-right w-20 hidden md:block">
                  <p className="text-sm font-medium text-foreground">${Number(formatUnits(item.totalSpent, 6)).toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">USDC</p>
                </div>

                {/* Cycles */}
                <div className="text-right w-16 hidden lg:block">
                  <p className="text-sm font-medium text-foreground">{item.subscriptionCount}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">cycles</p>
                </div>

                {/* Arrow */}
                <div className="w-8 flex justify-end">
                  <ArrowUpRight size={13} className="text-muted-foreground/20 group-hover:text-muted-foreground transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
