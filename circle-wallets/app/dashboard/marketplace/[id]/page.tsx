"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { SUBSCRIPTION_GATEWAY_ADDRESS, ARC_USDC_ADDRESS } from "@/lib/subscription";
import { encodeFunctionData } from "viem";

import { 
  ArrowLeft, 
  ExternalLink, 
  Globe, 
  Users, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck,
  Activity,
  CheckCircle2,
  BadgeCheck,
  Layers,
  ArrowRight,
  ArrowUpRight,
  Shield,
  Zap,
  Target,
  BarChart3,
  Clock
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Feature = { title: string; description: string };

type Tier = {
  id: string;
  tierId: string;
  price: string;
  label: string;
};

type PlanMetadata = {
  version?: string;
  name?: string;
  brand?: { name?: string; website?: string };
  features?: Feature[]; // v1.0
  tiers?: { label: string; price: string; features: Feature[] }[]; // v1.1
} | null;

type BuyerRow = {
  id: string;
  subscriber: string;
  status: "ACTIVE" | "EXPIRED";
  subscriptionCount: number;
  totalSpent: string;
  lastStartTime: string;
  lastEndTime: string;
  remainingSeconds: number;
};

type PlanResponse = {
  plan: {
    planId: string;
    price: string;
    duration: string;
    active: boolean;
    subscriptionCount: number;
    totalGrossVolume: string;
    totalFeesCollected: string;
    lastSubscriptionAt: string | null;
    seller: { id: string };
    metadata: PlanMetadata;
    tiers: Tier[];
  };
  isOwnerView: boolean;
  buyers: BuyerRow[];
  metrics: {
    activeBuyerCount: number;
    expiredBuyerCount: number;
    totalBuyers: number;
  };
  analytics?: {
    grossEarnings: string;
    feeCollected: string;
    netEarnings: string;
    avgRevenuePerSubscriber: string;
    repeatBuyerCount: number;
    repeatBuyerRate: number;
    activeRate: number;
    windows: {
      sevenDays: {
        subscriptionCount: number;
        grossVolume: string;
        totalFees: string;
        averageTicket: string;
      };
      thirtyDays: {
        subscriptionCount: number;
        grossVolume: string;
        totalFees: string;
        averageTicket: string;
      };
    };
  };
};

type EligibilityResponse = {
  eligible: boolean;
  reason: string;
  remainingSeconds: number;
};

function humanDuration(secondsValue: string) {
  const seconds = Number(secondsValue);
  const days = Math.floor(seconds / 86400);
  if (days >= 1) return `${days} day${days !== 1 ? "s" : ""}`;
  const hours = Math.floor(seconds / 3600);
  if (hours >= 1) return `${hours}h`;
  return `${Math.max(Math.floor(seconds / 60), 1)}m`;
}

function formatCountdown(totalSeconds: number) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h ${minutes}m`;
}

function truncateAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

const SectionHeader = ({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: LucideIcon }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <div>
      <h2 className="text-sm font-black uppercase tracking-widest text-foreground leading-none mb-1">
        {title}
      </h2>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
        {subtitle}
      </p>
    </div>
  </div>
);

export default function MarketplaceDetailPage() {
  const params = useParams<{ id: string }>();
  const { executeTransaction } = useCircleSDK();
  const { wallet, userCircleId } = useDashboardContext();

  const [data, setData] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

  const userAddress = wallet?.address ?? "";

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const viewer = wallet?.address ? `?viewer=${wallet.address}` : "";
        const response = await fetch(
          `/api/subscription/plan/${params.id}${viewer}`,
          { cache: "no-store" }
        );
        const json = (await response.json()) as PlanResponse & { error?: string };
        if (!response.ok) throw new Error(json.error ?? "Failed to load plan");
        if (mounted) {
          setData(json);
          if (json.plan.tiers?.length > 0) {
            setSelectedTierId(json.plan.tiers[0].tierId);
          }
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (params.id) void run();
    return () => { mounted = false; };
  }, [params.id, wallet?.address]);

  useEffect(() => {
    if (!data?.plan || !wallet?.address) return;
    let mounted = true;
    const run = async () => {
      try {
        const res = await fetch("/api/subscription/eligibility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscriber: wallet.address,
            planId: data.plan.planId,
            userToken: userCircleId,
          }),
        });
        const json = (await res.json()) as EligibilityResponse;
        if (mounted) setEligibility(json);
      } catch {
        if (mounted) {
          setEligibility({ eligible: true, reason: "UNKNOWN", remainingSeconds: 0 });
        }
      }
    };
    void run();
    return () => { mounted = false; };
  }, [data?.plan, wallet?.address, userCircleId]);

  const selectedTier = useMemo(() => {
    if (!data?.plan || !selectedTierId) return null;
    return data.plan.tiers.find((t) => t.tierId === selectedTierId);
  }, [data?.plan, selectedTierId]);

  const activeFeatures = useMemo(() => {
    if (!data?.plan?.metadata) return [];
    const meta = data.plan.metadata;
    if (meta.version === "1.1" && meta.tiers && selectedTier) {
       const tierMeta = meta.tiers.find(t => t.label === selectedTier.label);
       return tierMeta?.features ?? [];
    }
    return meta.features ?? [];
  }, [data?.plan?.metadata, selectedTier]);

  const handleBuy = async () => {
    if (!wallet?.address || !userCircleId || !userAddress) {
      setError("Wallet connection required before subscribing");
      return;
    }
    if (isOwnerView) {
      setError("You are the owner of this plan and cannot subscribe to it.");
      return;
    }
    if (!data?.plan || !selectedTier) {
      setError("Select a service tier");
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const eligRes = await fetch("/api/subscription/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriber: userAddress,
          planId: data.plan.planId,
          userToken: userCircleId,
        }),
      });
      const latestEligibility = (await eligRes.json()) as EligibilityResponse;
      if (!latestEligibility.eligible) {
        throw new Error(
          `Subscription active. Expiry: ${formatCountdown(latestEligibility.remainingSeconds)}.`
        );
      }

      const erc20Abi = [
        {
          name: "approve",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" }
          ],
          outputs: [{ name: "", type: "bool" }]
        }
      ] as const;

      const subscriptionGatewayAbi = [
        {
          name: "subscribe",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "planId", type: "bytes32" },
            { name: "tierId", type: "uint256" },
            { name: "buyerData", type: "string" }
          ],
          outputs: []
        }
      ] as const;

      const requiredAmount = BigInt(selectedTier.price);
      
      const approveData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`, requiredAmount],
      });

      const subscribeData = encodeFunctionData({
        abi: subscriptionGatewayAbi,
        functionName: "subscribe",
        args: [
          data.plan.planId as `0x${string}`,
          BigInt(selectedTier.tierId),
          userCircleId
        ],
      });

      const calls = [
        {
          to: ARC_USDC_ADDRESS as `0x${string}`,
          data: approveData,
        },
        {
          to: SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`,
          data: subscribeData,
        }
      ];

      await executeTransaction(calls, false, "Arc_Testnet");

      setSuccessMsg(`Successfully subscribed to ${selectedTier.label}`);
      setEligibility({ eligible: false, reason: "ACTIVE", remainingSeconds: Number(data.plan.duration) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-6 space-y-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-border/40 pb-10">
          <div className="space-y-4 w-full">
            <div className="h-4 w-32 bg-muted/40 rounded animate-pulse" />
            <div className="h-12 w-2/3 bg-muted/40 rounded-xl animate-pulse" />
            <div className="h-4 w-1/2 bg-muted/40 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-[400px] bg-muted/20 rounded-3xl animate-pulse" />
          </div>
          <div className="h-[600px] bg-muted/20 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { plan, metrics, buyers, isOwnerView, analytics } = data;
  const brand = plan.metadata?.brand;
  const blocked = eligibility ? !eligibility.eligible : false;
  const title = plan.metadata?.name ?? brand?.name ?? `Plan ${plan.planId.slice(0, 8)}`;

  return (
    <div className="w-full py-12 px-6 space-y-12 pb-32">
      
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-border/40 pb-10">
        <div className="space-y-3">
          <Link
            href="/dashboard/marketplace"
            className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-primary transition-colors"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform stroke-[3px]" />
            Back to Marketplace
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black uppercase tracking-tight text-foreground leading-none">
              {title}
            </h1>
            <Badge variant={plan.active ? "secondary" : "outline"} className={cn(
              "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-none shadow-sm",
              plan.active ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground/50"
            )}>
              {plan.active ? "Open" : "Closed"}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield size={12} className="text-primary" /> ID: <span className="font-mono text-foreground/80">{truncateAddress(plan.planId)}</span></span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="flex items-center gap-1.5"><Globe size={12} className="text-primary" /> Network: <span className="text-foreground/80 uppercase">Arc</span></span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="flex items-center gap-1.5"><Clock size={12} className="text-primary" /> Cycle: <span className="text-foreground/80">{humanDuration(plan.duration)}</span></span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            asChild
            variant="outline"
            className="h-11 px-6 rounded-xl border-border/80 font-black uppercase tracking-widest text-[10px] group hover:border-primary/50 transition-all"
          >
            <a href={`https://testnet.arcscan.app/address/${SUBSCRIPTION_GATEWAY_ADDRESS}`} target="_blank" rel="noreferrer">
              Verify On-Chain <ExternalLink size={14} className="ml-2 opacity-40 group-hover:opacity-100 transition-opacity" />
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        
        {/* Main Content Area (2/3) */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Business Metrics Grid - ONLY FOR OWNER */}
          {isOwnerView && (
            <div className="space-y-6">
              <SectionHeader title="Business Performance" subtitle="Merchant analytics and insights" icon={BarChart3} />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "Current Members", value: metrics.activeBuyerCount, sub: `${metrics.totalBuyers} Lifetime`, icon: Users, color: "text-sky-500" },
                  { label: "Total Sales", value: `$${Number(formatUnits(plan.totalGrossVolume, 6)).toLocaleString()}`, sub: "Settled USDC", icon: DollarSign, color: "text-primary" },
                  { label: "Repeat Business", value: `${analytics?.repeatBuyerRate.toFixed(1) ?? "0"}%`, sub: "Renewal Rate", icon: Target, color: "text-blue-500" },
                ].map((stat, i) => (
                  <Card key={i} className="bg-card border-border/80 shadow-none rounded-2xl group hover:bg-muted/5 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</CardTitle>
                      <stat.icon size={14} className={cn(stat.color, "stroke-[3px]")} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-black italic text-foreground leading-none">{stat.value}</div>
                      <p className="text-[9px] font-bold text-muted-foreground/60 mt-2 uppercase tracking-widest">{stat.sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Plans - Centerpiece */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <SectionHeader title="Pricing Plans" subtitle="Select your subscription level" icon={Layers} />
              {!isOwnerView && (
                 <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border-primary/20 bg-primary/5 text-primary">Secure USDC Payments</Badge>
              )}
            </div>
            
            <div className={cn(
              "grid gap-8 auto-rows-fr",
              plan.tiers.length === 1 ? "max-w-xl" : "grid-cols-1 xl:grid-cols-2"
            )}>
              {plan.tiers.map((tier) => (
                <Card 
                  key={tier.tierId}
                  onClick={() => setSelectedTierId(tier.tierId)}
                  className={cn(
                    "relative cursor-pointer bg-card border-border/80 rounded-3xl overflow-hidden shadow-none transition-all duration-300 hover:border-primary/40 group flex flex-col h-full",
                    selectedTierId === tier.tierId ? "border-primary ring-1 ring-primary ring-offset-4 ring-offset-background" : ""
                  )}
                >
                  <div className={cn(
                    "absolute top-0 right-0 h-32 w-32 rounded-full -mr-16 -mt-16 transition-all duration-300",
                    selectedTierId === tier.tierId ? "bg-primary/10" : "bg-muted/5 group-hover:bg-muted/10"
                  )} />
                  
                  <CardHeader className="p-8 pb-6 relative">
                    <div className="flex items-center justify-between mb-6">
                      <Badge variant="outline" className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1.5",
                        selectedTierId === tier.tierId ? "bg-primary text-primary-foreground border-none" : "bg-muted/40 text-muted-foreground border-border/40"
                      )}>
                        {tier.label}
                      </Badge>
                      {selectedTierId === tier.tierId && (
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                          <CheckCircle2 size={18} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black italic text-foreground tracking-tighter">${formatUnits(tier.price, 6)}</span>
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">USDC / {humanDuration(plan.duration)}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-8 pt-0 space-y-8 flex-grow">
                    <Separator className="bg-border/10" />
                    <div className="space-y-6">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                        <Zap size={12} className="text-primary" /> What you get
                      </p>
                      <div className="space-y-5">
                        {(() => {
                          const tierMeta = plan.metadata?.version === "1.1" 
                            ? plan.metadata.tiers?.find(t => t.label === tier.label)
                            : null;
                          const features = tierMeta?.features ?? plan.metadata?.features ?? [];
                          
                          if (features.length === 0) return <p className="text-[11px] text-muted-foreground italic opacity-50">No details listed for this plan.</p>;
                          
                          return features.map((f, fi) => (
                            <div key={fi} className="flex gap-4 items-start group/feature">
                              <div className={cn(
                                "h-5 w-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors duration-300",
                                selectedTierId === tier.tierId ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/30 group-hover/feature:bg-primary/5 group-hover/feature:text-primary/40"
                              )}>
                                <BadgeCheck size={14} strokeWidth={3} />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-xs font-black text-foreground uppercase tracking-tight">{f.title}</p>
                                <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{f.description}</p>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Trust Indicators for Buyers */}
          {!isOwnerView && (
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="bg-blue-500/5 border-blue-500/10 shadow-none rounded-3xl p-8 space-y-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <ShieldCheck size={20} strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-700">Protected Payments</h3>
                  <p className="text-[11px] text-blue-600/70 leading-relaxed uppercase font-bold tracking-tight">
                    Funds are held in a secure protocol vault. You only pay for what you use, and renewal is transparently managed on-chain.
                  </p>
                </div>
              </Card>
              <Card className="bg-primary/5 border-primary/10 shadow-none rounded-3xl p-8 space-y-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Activity size={20} strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary">Instant Fulfillment</h3>
                  <p className="text-[11px] text-primary/70 leading-relaxed uppercase font-bold tracking-tight">
                    Subscriptions are verified in seconds on the Arc network. Your entitlements are active immediately after confirmation.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Recent Activity - ONLY FOR OWNER */}
          {isOwnerView && (
            <section className="space-y-6">
              <SectionHeader title="Recent Activity" subtitle="On-chain enrollment verification" icon={Activity} />
              <Card className="bg-card border-border/80 shadow-none rounded-3xl overflow-hidden">
                 <Table>
                   <TableHeader className="bg-muted/10">
                     <TableRow className="border-border/40 hover:bg-transparent">
                       <TableHead className="pl-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subscriber</TableHead>
                       <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</TableHead>
                       <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right pr-8">Date</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {buyers.length === 0 ? (
                       <TableRow>
                         <TableCell colSpan={3} className="text-center py-16 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 italic">
                           No registrations yet
                         </TableCell>
                       </TableRow>
                     ) : buyers.slice(0, 5).map((buyer) => (
                       <TableRow key={buyer.id} className="border-border/20 group">
                         <TableCell className="pl-8 py-4">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary text-[10px] font-black">
                                ID
                              </div>
                              <span className="font-mono text-xs font-medium text-foreground/80">{truncateAddress(buyer.subscriber)}</span>
                           </div>
                         </TableCell>
                         <TableCell>
                           <Badge variant={buyer.status === "ACTIVE" ? "secondary" : "outline"} className={cn(
                             "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border-none shadow-sm",
                             buyer.status === "ACTIVE" ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground/50"
                           )}>
                             {buyer.status}
                           </Badge>
                         </TableCell>
                         <TableCell className="text-right pr-8">
                           <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(Number(buyer.lastStartTime) * 1000).toLocaleDateString()}</span>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
                 {buyers.length > 5 && (
                   <div className="p-4 border-t border-border/40 text-center">
                      <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">+ {buyers.length - 5} more records</p>
                   </div>
                 )}
              </Card>
            </section>
          )}
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-8">
          
          {/* Merchant Details */}
          <section className="space-y-6">
            <SectionHeader title="Merchant" subtitle="Verified Seller" icon={ShieldCheck} />
            <Card className="bg-card border-border/80 shadow-none rounded-3xl p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
              <div className="flex items-center gap-4 relative">
                 <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20">
                   <Globe size={28} strokeWidth={2.5} />
                 </div>
                 <div>
                   <p className="text-xl font-black uppercase tracking-tight leading-none mb-1">{brand?.name || "Verified Merchant"}</p>
                   <p className="text-[10px] font-bold text-primary uppercase tracking-widest italic">Certified Seller</p>
                 </div>
              </div>
              
              <div className="space-y-4 relative">
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Website</p>
                  <a href={brand?.website} target="_blank" rel="noreferrer" className="text-xs font-bold text-foreground flex items-center gap-1.5 hover:text-primary transition-all group">
                    {brand?.website || "Website Unavailable"} 
                    <ExternalLink size={12} className="opacity-40 group-hover:opacity-100 transition-all" />
                  </a>
                </div>
                <Separator className="bg-border/10" />
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                     <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Status</p>
                     <Badge variant="outline" className="text-[9px] font-bold uppercase border-blue-500/30 text-blue-500 bg-blue-500/5">Verified</Badge>
                   </div>
                   <div className="text-right space-y-1">
                     <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Currency</p>
                     <p className="text-xs font-black italic">USDC</p>
                   </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Checkout Terminal */}
          <section className="space-y-6">
            <SectionHeader title="Checkout" subtitle="Secure payment setup" icon={Shield} />
            <Card className="bg-card border-border/80 shadow-none rounded-3xl p-8 space-y-8 border-t-4 border-t-primary relative">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Selected Plan</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black italic text-foreground leading-none">${selectedTier ? formatUnits(selectedTier.price, 6) : "0.0"}</span>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">USDC</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border-none">{selectedTier?.label ?? "Pick a plan"}</Badge>
                </div>
              </div>

              <Separator className="bg-border/10" />

              <div className="space-y-4">
                <Button 
                  onClick={() => void handleBuy()}
                  disabled={submitting || blocked || !plan.active || !wallet || !selectedTierId || isOwnerView}
                  className="group w-full font-black uppercase tracking-[0.2em] text-[11px] h-16 rounded-2xl transition-all bg-primary text-primary-foreground border-none disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="flex items-center gap-3">
                       <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/20 border-t-primary-foreground" />
                       Processing...
                    </div>
                  ) : isOwnerView ? (
                    "Manage as Owner"
                  ) : blocked ? (
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} />
                      Already Subscribed
                    </div>
                  ) : !wallet ? (
                    "Connect Wallet"
                  ) : (
                    <>
                      Pay & Subscribe
                      <ArrowRight size={16} className="ml-2 transition-transform stroke-[3px]" />
                    </>
                  )}
                </Button>

                {blocked && (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-6 space-y-4 transition-all">
                    <div className="flex items-center justify-between">
                       <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Member</p>
                       <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-3xl font-black italic text-blue-700 leading-none">{formatCountdown(eligibility!.remainingSeconds)}</p>
                      <p className="text-[10px] font-bold text-blue-600/60 uppercase tracking-tighter">left in period</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-destructive/10 p-5 rounded-2xl border border-destructive/20 transition-all">
                    <p className="text-[10px] font-black text-destructive uppercase tracking-widest text-center leading-relaxed">
                      {error}
                    </p>
                  </div>
                )}

                {successMsg && (
                  <div className="bg-blue-500/10 p-5 rounded-2xl border border-blue-500/20 transition-all">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center leading-relaxed">
                      {successMsg}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 text-center">
                 <div className="flex items-center justify-center gap-2 opacity-30 grayscale cursor-default">
                   <div className="h-1 w-8 rounded-full bg-muted-foreground" />
                   <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest italic">
                     Powered by Circle
                   </p>
                   <div className="h-1 w-8 rounded-full bg-muted-foreground" />
                 </div>
              </div>
            </Card>
          </section>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="pt-20 text-center opacity-20">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">Merchant OS v1.1.0 • Verified Marketplace Node</p>
      </div>

    </div>
  );
}
