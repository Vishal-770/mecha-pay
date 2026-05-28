"use client";

import Link from "next/link";
import { formatUnits } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Search, ArrowRight, Activity, Users, DollarSign, CheckCircle2 } from "lucide-react";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Tier = {
  tierId: string;
  price: string;
  label: string;
  active: boolean;
};

type PlanRecord = {
  id: string;
  planId: string;
  seller: { id: string };
  duration: string;
  active: boolean;
  subscriptionCount: number;
  totalGrossVolume: string;
  lastSubscriptionAt: string | null;
  tiers: Tier[];
  metadata: {
    name?: string;
    brand?: { name?: string; website?: string };
    features?: { title: string; description: string }[];
  } | null;
};

type SortKey = "latest" | "priceLow" | "priceHigh" | "subscribers";

type UserSubscription = {
  active: boolean;
  planId: string;
};

function isSortKey(value: string | null): value is SortKey {
  return value === "latest" || value === "priceLow" || value === "priceHigh" || value === "subscribers";
}

function humanDuration(secondsValue: string) {
  const seconds = Number(secondsValue);
  const days = Math.floor(seconds / 86400);
  if (days >= 1) return `${days} day${days !== 1 ? "s" : ""}`;
  const hours = Math.floor(seconds / 3600);
  if (hours >= 1) return `${hours}h`;
  return `${Math.max(Math.floor(seconds / 60), 1)}m`;
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

// --- Project Branding Components ---

const CompactHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-12 border-b border-border/40 pb-6">
    <h1 className="text-3xl font-black uppercase tracking-tight mb-1 text-foreground">
      {title}
    </h1>
    <p className="text-[10px] text-muted-foreground/90 font-black uppercase tracking-[0.3em] flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      {subtitle}
    </p>
  </div>
);

function ProtocolCard({ plan, isSubscribed }: { plan: PlanRecord; isSubscribed?: boolean }) {
  const brand = plan.metadata?.brand;
  const title = plan.metadata?.name ?? brand?.name ?? `Plan ${plan.planId.slice(0, 8)}`;

  const minPrice = useMemo(() => {
    if (!plan.tiers || plan.tiers.length === 0) return "0";
    return plan.tiers.reduce((min, t) => (BigInt(t.price) < BigInt(min) ? t.price : min), plan.tiers[0].price);
  }, [plan.tiers]);

  const maxPrice = useMemo(() => {
    if (!plan.tiers || plan.tiers.length === 0) return "0";
    return plan.tiers.reduce((max, t) => (BigInt(t.price) > BigInt(max) ? t.price : max), plan.tiers[0].price);
  }, [plan.tiers]);

  const priceDisplay = minPrice === maxPrice 
    ? `${formatUnits(minPrice, 6)}` 
    : `${formatUnits(minPrice, 6)} - ${formatUnits(maxPrice, 6)}`;

  return (
    <Card className="group relative bg-background border-border/80 rounded-2xl p-0 overflow-hidden transition-all hover:bg-muted/5 hover:border-primary/30 flex flex-col gap-0 shadow-none">
      <CardHeader className="p-6 pb-0 flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground truncate max-w-[180px]">
            {title}
          </h3>
          {brand?.name && plan.metadata?.name && (
            <p className="text-xs text-muted-foreground">
              by {brand.name}
            </p>
          )}
          {brand?.name && !plan.metadata?.name && (
            <p className="text-xs text-muted-foreground">
              by {brand.name}
            </p>
          )}
        </div>
        <Badge variant="secondary" className="text-[10px] font-medium rounded-md px-2 py-0.5 shrink-0">
          {humanDuration(plan.duration)}
        </Badge>
      </CardHeader>

      <CardContent className="p-6 flex flex-col gap-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/10">
          <div className="space-y-1">
            <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
              <Users size={11} />
              Subscribers
            </span>
            <p className="text-sm font-semibold">{plan.subscriptionCount ?? 0}</p>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 justify-end">
              Volume
              <Activity size={11} />
            </span>
            <p className="text-sm font-semibold">
              {Number(formatUnits(plan.totalGrossVolume ?? "0", 6)).toFixed(1)} USDC
            </p>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
              <DollarSign size={11} />
              {plan.tiers?.length > 1 ? "Price Range" : "Price"}
            </span>
            <p className="text-lg font-bold text-foreground leading-none">
              {priceDisplay} <span className="text-xs font-normal text-muted-foreground">USDC</span>
            </p>
            {plan.tiers?.length > 1 && (
              <p className="text-[10px] text-muted-foreground">{plan.tiers.length} plans to choose from</p>
            )}
          </div>

          {isSubscribed ? (
            <Button disabled className="w-full rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20 font-semibold text-sm flex items-center justify-center opacity-100 cursor-default">
              <CheckCircle2 size={14} className="mr-2" />
              Subscribed
            </Button>
          ) : (
            <Button asChild className="w-full rounded-lg font-semibold text-sm">
              <Link href={`/dashboard/marketplace/${plan.planId}`}>
                View Plan
                <ArrowRight size={14} className="ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MarketplacePage() {
  const { wallet } = useDashboardContext();
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [userSubs, setUserSubs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("latest");

  // Fetch subscriptions
  useEffect(() => {
    const fetchUserSubs = async () => {
      if (!wallet?.address) return;
      try {
        const res = await fetch(`/api/subscription/list?subscriber=${wallet.address}`);
        if (!res.ok) return;
        const data = (await res.json()) as { subscriptions?: UserSubscription[] };
        const active = data.subscriptions?.filter((s) => s.active).map((s) => s.planId) ?? [];
        setUserSubs(active);
      } catch (err) {
        console.error("Failed to load user subscriptions", err);
      }
    };
    fetchUserSubs();
  }, [wallet?.address]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/subscription/list-plans?first=120", {
          cache: "no-store",
        });
        const json = (await response.json()) as {
          plans?: PlanRecord[];
          error?: string;
        };
        if (!response.ok) throw new Error(json.error ?? "Failed to load plans");
        if (mounted) setPlans(json.plans ?? []);
      } catch (err) {
        if (mounted)
          setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, []);

  const visiblePlans = useMemo(() => {
    const q = search.trim().toLowerCase();
    const active = plans.filter((p) => p.active);
    const filtered =
      q.length === 0
        ? active
        : active.filter((p) => {
            const name = (p.metadata?.name ?? "").toLowerCase();
            const brand = (p.metadata?.brand?.name ?? "").toLowerCase();
            return (
              name.includes(q) ||
              brand.includes(q) ||
              p.planId.toLowerCase().includes(q)
            );
          });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      const getMinPrice = (p: PlanRecord) => {
        if (!p.tiers || p.tiers.length === 0) return 0n;
        return p.tiers.reduce((min, t) => (BigInt(t.price) < min ? BigInt(t.price) : min), BigInt(p.tiers[0].price));
      };
      
      if (sortBy === "priceLow") return Number(getMinPrice(a) - getMinPrice(b));
      if (sortBy === "priceHigh") return Number(getMinPrice(b) - getMinPrice(a));
      if (sortBy === "subscribers")
        return b.subscriptionCount - a.subscriptionCount;
      return (
        Number(b.lastSubscriptionAt ?? b.id) -
        Number(a.lastSubscriptionAt ?? a.id)
      );
    });
    return sorted;
  }, [plans, search, sortBy]);

  return (
    <section className="w-full py-8 px-6">
      <div className="mb-8 border-b border-border/40 pb-6">
        <h1 className="text-xl font-semibold text-foreground mb-1">Marketplace</h1>
        <p className="text-sm text-muted-foreground">Browse and subscribe to services from other creators.</p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 lg:items-end lg:flex-row lg:justify-between pb-6 border-b border-border/20">
        <div className="flex-1">
          <Field className="space-y-1.5">
            <Label className="pl-1 text-xs font-medium">Search</Label>
            <div className="relative group/search">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 size-4" />
              <Input
                type="search"
                placeholder="Search by name or brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-muted/20 border-border/80"
              />
            </div>
          </Field>
        </div>

        <div className="flex flex-col gap-1.5">
          <Field>
            <Label className="pl-1 text-xs font-medium">Sort by</Label>
          </Field>
          <Select value={sortBy} onValueChange={(value) => { if (isSortKey(value)) setSortBy(value); }}>
            <SelectTrigger className="w-[200px] h-11 bg-muted/20 border-border/80 rounded-xl font-bold text-sm">
              <SelectValue placeholder="Sort Indices" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border/80 rounded-xl shadow-xl">
              <SelectItem value="latest" className="font-bold text-xs">Latest Activity</SelectItem>
              <SelectItem value="subscribers" className="font-bold text-xs">Most Subscribers</SelectItem>
              <SelectItem value="priceLow" className="font-bold text-xs">Price: Low to High</SelectItem>
              <SelectItem value="priceHigh" className="font-bold text-xs">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/20 bg-destructive/5 mb-8">
          <CardContent className="p-4 text-sm font-bold text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-[400px] rounded-2xl border-border/10 bg-muted/5 animate-pulse shadow-none" />
          ))}
        </div>
      ) : visiblePlans.length === 0 ? (
        <div className="rounded-xl border border-border/10 bg-muted/5 p-20 text-center">
          <p className="text-sm text-muted-foreground">
            {search ? "No plans match your search" : "No plans available yet"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePlans.map((plan) => (
            <ProtocolCard 
              key={plan.planId} 
              plan={plan} 
              isSubscribed={userSubs.includes(plan.planId)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
