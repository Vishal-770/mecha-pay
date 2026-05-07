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
  const title = plan.metadata?.name ?? brand?.name ?? `Protocol ${plan.planId.slice(0, 8)}`;

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
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground truncate max-w-[180px]">
            {title}
          </h3>
          {brand?.name && plan.metadata?.name && (
            <p className="text-[10px] font-bold text-primary italic uppercase tracking-wider">
              {brand.name}
            </p>
          )}
          {brand?.name && !plan.metadata?.name && (
            <p className="text-[10px] font-bold text-primary italic uppercase tracking-wider">
              Merchant Gateway
            </p>
          )}
        </div>
        <Badge variant="secondary" className="bg-primary/5 hover:bg-primary/10 text-primary border-primary/10 text-[9px] font-black uppercase tracking-widest rounded-lg px-2.5 py-1">
          {humanDuration(plan.duration)}
        </Badge>
      </CardHeader>

      <CardContent className="p-6 flex flex-col gap-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 py-6 border-y border-border/10">
          <div className="space-y-1.5">
            <span className="text-[8px] font-black text-muted-foreground/90 uppercase tracking-[0.2em] flex items-center gap-1.5">
              <Users size={10} strokeWidth={3} />
              Retained
            </span>
            <p className="text-xs font-black italic">{plan.subscriptionCount ?? 0} Subs</p>
          </div>
          <div className="space-y-1.5 text-right">
            <span className="text-[8px] font-black text-muted-foreground/90 uppercase tracking-[0.2em] flex items-center gap-1.5 justify-end">
              Settled Vol
              <Activity size={10} strokeWidth={3} />
            </span>
            <p className="text-xs font-black italic">
              {Number(formatUnits(plan.totalGrossVolume ?? "0", 6)).toFixed(1)} USDC
            </p>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <span className="text-[8px] font-black text-muted-foreground/90 uppercase tracking-[0.2em] flex items-center gap-1.5">
              <DollarSign size={10} strokeWidth={3} />
              {plan.tiers?.length > 1 ? "Price Range" : "Tier Price"}
            </span>
            <p className="text-xl font-black italic text-foreground leading-none">
              {priceDisplay} <span className="text-[10px] uppercase font-black not-italic text-muted-foreground/50 ml-1">USDC</span>
            </p>
            {plan.tiers?.length > 1 && (
              <p className="text-[9px] font-bold text-primary uppercase tracking-widest">{plan.tiers.length} Tiers Available</p>
            )}
          </div>

          {isSubscribed ? (
            <Button disabled className="w-full h-12 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center opacity-100 cursor-default">
              <CheckCircle2 size={14} className="mr-2" />
              Already Subscribed
            </Button>
          ) : (
            <Button asChild className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center transition-all group/btn border-none">
              <Link href={`/dashboard/marketplace/${plan.planId}`}>
                Inspect Gateway
                <ArrowRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform stroke-[3px]" />
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
        const data = await res.json();
        setUserSubs(data.subscriptions?.filter((s:any) => s.active).map((s:any) => s.planId) || []);
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
    <section className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CompactHeader title="Marketplace" subtitle="Protocol Discovery Engine" />

      {/* Filters (Library Based) */}
      <div className="mb-12 flex flex-col gap-6 lg:items-end lg:flex-row lg:justify-between pb-8 border-b border-border/10">
        <div className="flex-1 max-w-2xl">
          <Field className="space-y-2">
            <Label className="pl-1">Search Directory</Label>
            <div className="relative group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 size-4 stroke-[3px] group-focus-within/search:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="Search by name, brand, or plan id"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 bg-muted/20 border-border/80"
              />
            </div>
          </Field>
        </div>

        <div className="flex flex-col gap-2">
          <Field>
            <Label className="pl-1">Sort Indices</Label>
          </Field>
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
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
        <div className="rounded-2xl border border-border/10 bg-muted/5 p-20 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
            {search ? "No matches found in directory" : "No active protocols synced"}
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
