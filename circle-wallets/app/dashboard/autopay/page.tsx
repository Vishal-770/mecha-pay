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
          <Skeleton className="h-4 w-32 bg-muted rounded-none" />
          <Skeleton className="h-10 w-72 bg-muted rounded-none" />
          <Skeleton className="h-4 w-full max-w-2xl bg-muted rounded-none" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-none bg-muted/10 border-b border-border/20" />
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
          <h2 className="text-sm font-bold tracking-wider uppercase text-foreground">Unable to connect to AutoPay</h2>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()} size="sm" variant="outline" className="rounded-none font-bold text-xs h-9 px-4 border-foreground transition-colors">
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
            <span className="text-[10px] font-mono tracking-widest uppercase font-extrabold">EIP-712 Cryptographic Protocol</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground uppercase">
            AutoPay Gateway
          </h1>
          <p className="text-xs text-muted-foreground max-w-4xl leading-relaxed font-medium">
            Configure decentralized pre-authorized subscription billing. Cryptographically sign an off-chain renewal intent using your biometric passkey. Registered sponsor relayers execute renewals on-chain with <span className="font-semibold text-foreground">zero gas fees</span>, requiring no manual actions when cycles expire.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="link" size="sm" className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground p-0">
            <Link href="/dashboard/subscriptions">
              Subscriptions [→]
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Metric Stats (Pure Typography, No Box Containers) ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-2">
        <div className="space-y-1">
          <p className="text-[9px] font-mono uppercase font-bold tracking-widest text-muted-foreground">Subscribed Products</p>
          <p className="text-xl font-bold tracking-tight text-foreground font-mono">{subscriptions.length}</p>
          <p className="text-[10px] text-muted-foreground font-semibold">Eligible plan configurations</p>
        </div>

        <div className="space-y-1">
          <p className="text-[9px] font-mono uppercase font-bold tracking-widest text-muted-foreground">AutoPay Secured</p>
          <p className="text-xl font-bold tracking-tight text-primary font-mono">
            {Object.values(autopaySettings).filter(s => s.enabled).length}
          </p>
          <p className="text-[10px] text-muted-foreground font-semibold">Active pre-authorizations</p>
        </div>

        <div className="space-y-1">
          <p className="text-[9px] font-mono uppercase font-bold tracking-widest text-muted-foreground">Gas Coverage</p>
          <p className="text-xl font-bold tracking-tight text-foreground font-mono">Sponsored</p>
          <p className="text-[10px] text-muted-foreground font-semibold">100% sponsored by Protocol</p>
        </div>
      </div>

      {/* ── Subscriptions Master Grid View (List Rows, No Box Containers) ────────────────── */}
      {subscriptions.length === 0 ? (
        <div className="py-24 flex flex-col items-center gap-6 text-center">
          <div className="h-12 w-12 flex items-center justify-center text-muted-foreground">
            <HelpCircle size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">No Subscriptions Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed font-medium">
              AutoPay setups require a corresponding active subscription. Visit the marketplace to subscribe to merchant plans.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-none font-bold text-xs shadow-none border-foreground">
            <Link href="/dashboard/marketplace">Explore Marketplace</Link>
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border/20 pt-4">
          {subscriptions.map((sub) => {
            const planIdLower = sub.plan.id.toLowerCase();
            const setting = autopaySettings[planIdLower];
            const isEnabled = !!setting?.enabled;

            const planName = sub.metadata?.name ?? sub.metadata?.brand?.name ?? `Product ${sub.plan.id.slice(0, 8)}`;

            return (
              <div
                key={sub.id}
                className="py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition-colors duration-150"
              >
                {/* Meta details */}
                <div className="space-y-1 md:max-w-xs">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">
                      {planName}
                    </h3>
                    <span
                      className={cn(
                        "inline-flex items-center text-[9px] font-mono font-bold uppercase px-2 py-0.5 border tracking-wider rounded-none",
                        isEnabled
                          ? "bg-muted text-primary border-primary/20"
                          : "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {isEnabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground truncate">
                    PLAN ID: {sub.plan.id}
                  </p>
                </div>

                {/* Expiration Details */}
                <div className="grid grid-cols-2 gap-8 md:gap-12 text-xs font-mono">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">Next Cycle</span>
                    <span className="font-bold text-foreground inline-flex items-center gap-1.5">
                      <Clock size={12} className="text-muted-foreground" />
                      {new Date(Number(sub.lastEndTime) * 1000).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                  <div className="space-y-1 text-right md:text-left">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">Cycle Status</span>
                    <span className={cn(
                      "text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5",
                      sub.status === "ACTIVE" ? "text-primary" : "text-muted-foreground"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-none", sub.status === "ACTIVE" ? "bg-primary" : "bg-muted-foreground")} />
                      {sub.status}
                    </span>
                  </div>
                </div>

                {/* Bounds metadata */}
                <div className="space-y-1 font-mono text-xs max-w-xs">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">Bound User ID</span>
                  <span className="font-bold text-foreground block truncate max-w-[200px]" title={sub.lastBuyerData}>
                    {sub.lastBuyerData || "No registered parameters"}
                  </span>
                  {isEnabled && (
                    <span className="text-[10px] text-muted-foreground font-mono block">
                      Cycles: {setting?.executedCycles ?? 0} / {setting?.maxCycles ?? 10}
                    </span>
                  )}
                </div>

                {/* Action button */}
                <div className="shrink-0">
                  <Button
                    onClick={() => router.push(`/dashboard/autopay/${sub.id}`)}
                    variant="outline"
                    className="h-10 px-5 text-xs font-bold uppercase tracking-wider rounded-none border border-foreground bg-transparent hover:bg-foreground hover:text-background transition-colors"
                  >
                    Configure AutoPay
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── EIP-712 Cryptographic Pipeline (Swiss Typography Flow) ── */}
      <div className="pt-16 border-t border-border/20 space-y-8">
        <div className="space-y-2">
          <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-foreground">
            EIP-712 Cryptographic Pipeline
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl font-medium">
            Your cryptographic signatures are off-chain consents, allowing sponsored instant contract execution.
          </p>
        </div>

        {/* Responsive pipeline nodes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-4">
          {/* Step 1 */}
          <div className="space-y-2.5 relative">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-bold text-primary bg-muted px-2 py-0.5 border border-primary/20">01</span>
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">Biometric Consent</span>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground font-semibold">EIP-712 Secure Sign</p>
          </div>

          {/* Step 2 */}
          <div className="space-y-2.5 relative">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-bold text-primary bg-muted px-2 py-0.5 border border-primary/20">02</span>
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">Off-Chain Storage</span>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground font-semibold">MongoDB Secure Vault</p>
          </div>

          {/* Step 3 */}
          <div className="space-y-2.5 relative">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-bold text-primary bg-muted px-2 py-0.5 border border-primary/20">03</span>
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">Sponsored Relayer</span>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground font-semibold">Zero-gas Auto Trigger</p>
          </div>

          {/* Step 4 */}
          <div className="space-y-2.5 relative">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-bold text-primary bg-muted px-2 py-0.5 border border-primary/20">04</span>
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">Arc Testnet Chain</span>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground font-semibold">Smart Gateway Verify</p>
          </div>
        </div>

        {/* Bottom Assurances */}
        <div className="flex flex-wrap gap-x-12 gap-y-3 pt-6 border-t border-border/10">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="text-primary h-4 w-4 shrink-0" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
              Zero Gas Cost Sponsorships
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="text-primary h-4 w-4 shrink-0" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
              Instantly Revocable off-chain
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
