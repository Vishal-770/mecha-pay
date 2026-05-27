"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Monitor,
  Lock,
  Cpu
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Tier = {
  tierId: string;
  price: string;
  label: string;
  active: boolean;
};

type SubscriptionRow = {
  id: string;
  status: "ACTIVE" | "EXPIRED";
  subscriptionCount: number;
  totalSpent: string;
  remainingSeconds: number;
  canRenew: boolean;
  lastTierId?: string;
  lastBuyerData?: string;
  tierIds?: string[];
  lastEndTime: string;
  plan: {
    id: string;
    duration: string;
    ipfsHash: string;
    tiers: Tier[];
  };
  metadata: {
    name?: string;
    brand?: { name?: string; website?: string };
  } | null;
};

type AutoPaySetting = {
  id: string;
  subscriberAddress: string;
  planId: string;
  enabled: boolean;
  tierId: string;
  buyerData: string;
  signature: string;
  nonce: number;
  deadline: number;
  currentExpiresAt: number;
  sessionPublicKey?: string;
  sessionPrivateKey?: string;
  maxCycles?: number;
  executedCycles?: number;
};

export default function AutoPayPage() {
  const router = useRouter();
  const { wallet, sessionUserToken } = useDashboardContext();

  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [autopaySettings, setAutopaySettings] = useState<Record<string, AutoPaySetting>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscriptions and saved AutoPay settings
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (!wallet?.address || !sessionUserToken) {
        setLoading(false);
        return;
      }
      try {
        const [subRes, autoRes] = await Promise.all([
          fetch(`/api/subscription/my-subscriptions?subscriber=${wallet.address}&userToken=${sessionUserToken}`, { cache: "no-store" }),
          fetch(`/api/autopay?subscriberAddress=${wallet.address}&userToken=${sessionUserToken}`, { cache: "no-store" }),
        ]);

        if (!subRes.ok) {
          const subJson = await subRes.json();
          throw new Error(subJson.error ?? "Failed to load subscriptions");
        }

        const subData = await subRes.json();
        const autoData = await autoRes.json();

        if (mounted) {
          const allSubs = subData.subscriptions ?? [];
          setSubscriptions(allSubs);

          // Map AutoPay settings by planId for easy lookup
          const mappedSettings: Record<string, AutoPaySetting> = {};
          (autoData.settings ?? []).forEach((s: AutoPaySetting) => {
            mappedSettings[s.planId.toLowerCase()] = s;
          });
          setAutopaySettings(mappedSettings);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadData();
    return () => {
      mounted = false;
    };
  }, [wallet?.address, sessionUserToken]);

  if (loading) {
    return (
      <div className="w-full py-16 px-6 md:px-12 lg:px-16 space-y-12 animate-pulse">
        <div className="py-6 border-b border-border/20 space-y-3">
          <Skeleton className="h-4 w-32 bg-muted rounded-lg" />
          <Skeleton className="h-10 w-72 bg-muted rounded-lg" />
          <Skeleton className="h-4 w-full max-w-2xl bg-muted rounded-lg" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-lg bg-muted/10 border border-border/20" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-32 px-6 text-center space-y-6">
        <div className="mx-auto h-12 w-12 flex items-center justify-center text-foreground">
          <AlertCircle size={28} />
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Unable to connect to Auto-Pay</h2>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()} size="sm" variant="outline" className="rounded-lg font-semibold text-xs h-9 px-4 border-foreground transition-colors">
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full py-12 px-6 md:px-12 lg:px-16 space-y-12 text-foreground font-sans">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between py-6 border-b border-border/20 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-primary">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold tracking-wider uppercase">Secure Auto-Renewal</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Auto-Pay
          </h1>
          <p className="text-sm text-muted-foreground max-w-4xl leading-relaxed">
            Automatically renew your subscriptions without manual payments.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="link" size="sm" className="text-sm font-semibold text-muted-foreground hover:text-foreground p-0">
            <Link href="/dashboard/subscriptions">
              Subscriptions →
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Visual Metrics Console ── */}
      <div className="flex flex-wrap gap-x-16 gap-y-6 py-6 border-b border-border/10 text-xs animate-in fade-in duration-300">
        <div className="space-y-1">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground block uppercase">
            Subscribed
          </span>
          <span className="text-xl font-bold tracking-tight text-foreground block">
            {subscriptions.length} <span className="text-xs text-muted-foreground font-normal">Plans</span>
          </span>
        </div>

        <div className="space-y-1 border-l border-border/15 pl-12 md:pl-16">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground block uppercase">
            Auto-Pay Active
          </span>
          <span className="text-xl font-bold tracking-tight text-primary block">
            {Object.values(autopaySettings).filter(s => s.enabled).length} <span className="text-xs text-muted-foreground font-normal">Active</span>
          </span>
        </div>

        <div className="space-y-1 border-l border-border/15 pl-12 md:pl-16">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground block uppercase">
            Auto-Pay Inactive
          </span>
          <span className="text-xl font-bold tracking-tight text-muted-foreground block">
            {subscriptions.length - Object.values(autopaySettings).filter(s => s.enabled).length} <span className="text-xs text-muted-foreground font-normal">Not set up</span>
          </span>
        </div>

        <div className="space-y-1 border-l border-border/15 pl-12 md:pl-16">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground block uppercase">
            Transaction Fees
          </span>
          <span className="text-xl font-bold tracking-tight text-foreground block">
            Free <span className="text-xs text-muted-foreground font-normal">Sponsored</span>
          </span>
        </div>
      </div>

      {/* ── Subscriptions Master Grid View ────────────────── */}
      {subscriptions.length === 0 ? (
        <div className="py-24 flex flex-col items-center gap-6 text-center">
          <div className="h-12 w-12 flex items-center justify-center text-muted-foreground">
            <HelpCircle size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">No Subscriptions Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Auto-Pay setups require a corresponding active subscription. Visit the marketplace to subscribe to plans.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-lg font-semibold text-sm shadow-none border-foreground">
            <Link href="/dashboard/marketplace">Explore Marketplace</Link>
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border/20 pt-4">
          {subscriptions.map((sub) => {
            const planIdLower = sub.plan.id.toLowerCase();
            const setting = autopaySettings[planIdLower];
            const isEnabled = !!setting?.enabled;

            const planName = sub.metadata?.name ?? sub.metadata?.brand?.name ?? `Plan ${sub.plan.id.slice(0, 8)}`;

            return (
              <div
                key={sub.id}
                className="py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition-colors duration-150 border-b border-border/10"
              >
                {/* Meta details */}
                <div className="space-y-1 md:max-w-xs">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">
                      {planName}
                    </h3>
                    <span
                      className={cn(
                        "inline-flex items-center text-[10px] font-medium px-2 py-0.5 border rounded-full shrink-0",
                        isEnabled
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {isEnabled ? "Active" : "Not set up"}
                    </span>
                  </div>
                </div>

                {/* Expiration Details */}
                <div className="text-xs">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block mb-1">Next Renewal</span>
                  <span className="font-semibold text-foreground inline-flex items-center gap-1.5">
                    <Clock size={13} className="text-muted-foreground" />
                    {new Date(Number(sub.lastEndTime) * 1000).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                </div>

                {/* Action button */}
                <div className="shrink-0">
                  <Button
                    onClick={() => router.push(`/dashboard/autopay/${sub.id}`)}
                    className="h-10 px-5 text-sm font-semibold rounded-lg border border-border bg-transparent text-foreground hover:border-primary hover:text-primary transition-all duration-150 cursor-pointer"
                  >
                    Configure
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
