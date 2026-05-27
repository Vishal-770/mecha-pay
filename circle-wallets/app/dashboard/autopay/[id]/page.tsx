"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatUnits, Wallet } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { useCircleSDK } from "@/context/CircleSDKContext";
import {
  ArrowLeft,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Play,
  XCircle,
  Cpu,
  Lock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toCircleSmartAccount } from "@circle-fin/modular-wallets-core";
import { toWebAuthnAccount } from "viem/account-abstraction";
import { createPublicClient, http, type Client } from "viem";
import { arcTestnet } from "@/lib/bridge_config";
import { SUBSCRIPTION_GATEWAY_ADDRESS } from "@/lib/subscription";

// Import proper Shadcn Select
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

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

export default function AutoPayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { wallet, sessionUserToken } = useDashboardContext();
  const { session } = useCircleSDK();

  const [sub, setSub] = useState<SubscriptionRow | null>(null);
  const [setting, setSetting] = useState<AutoPaySetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [selectedTierId, setSelectedTierId] = useState<string>("");
  const [selectedCycles, setSelectedCycles] = useState<number>(10);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  // Load data for single subscription
  useEffect(() => {
    let mounted = true;
    const loadSubData = async () => {
      if (!wallet?.address || !sessionUserToken || !id) {
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
          throw new Error(subJson.error ?? "Failed to load subscription details");
        }

        const subData = await subRes.json();
        const autoData = await autoRes.json();

        if (mounted) {
          const allSubs: SubscriptionRow[] = subData.subscriptions ?? [];
          const foundSub = allSubs.find(s => s.id.toLowerCase() === id.toLowerCase());
          
          if (!foundSub) {
            throw new Error("Subscription not found");
          }
          
          setSub(foundSub);

          // Find setting matching this plan ID
          const planIdLower = foundSub.plan.id.toLowerCase();
          const foundSetting = (autoData.settings ?? []).find((s: AutoPaySetting) => s.planId.toLowerCase() === planIdLower);
          
          if (foundSetting) {
            setSetting(foundSetting);
            setSelectedTierId(foundSetting.tierId);
            setSelectedCycles(foundSetting.maxCycles ?? 10);
          } else {
            // Default select first active tier or last tier ID
            const activeTiers = foundSub.plan.tiers.filter(t => t.active);
            setSelectedTierId(foundSub.lastTierId ?? activeTiers[0]?.tierId ?? "0");
            setSelectedCycles(10);
          }
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadSubData();
    return () => {
      mounted = false;
    };
  }, [wallet?.address, sessionUserToken, id]);

  // Handle Save / EIP-712 Sign Authorization
  const handleAuthorizeAutoPay = async () => {
    if (!sub || !wallet?.address || !sessionUserToken || !session) {
      alert("Active session is required.");
      return;
    }

    setActionLoading(true);
    setStatusMessage(null);

    try {
      const planIdLower = sub.plan.id.toLowerCase();
      const customBuyerData = sub.lastBuyerData ?? "";
      const currentExpiresAt = Number(sub.lastEndTime || Math.floor(Date.now() / 1000) + 30 * 86400);

      // Generate secure unique sequential timestamp nonce and 5-year expiration deadline
      const nonce = Math.floor(Date.now() / 1000);
      const deadline = Math.floor(Date.now() / 1000) + 5 * 365 * 24 * 3600;

      // 1. Re-initialize modular smart account using local WebAuthn session
      const publicClient = createPublicClient({
        chain: arcTestnet,
        transport: http(arcTestnet.rpcUrls.default.http[0]),
      });

      const smartAccount = await toCircleSmartAccount({
        client: publicClient as Client,
        owner: toWebAuthnAccount({ credential: session.credential }),
        name: session.username,
      });

      // 2. Generate a local Session Key and sign the EIP-712 single authorization intent
      const sessionWallet = Wallet.createRandom();
      const sessionPublicKey = sessionWallet.address;
      const sessionPrivateKey = sessionWallet.privateKey;

      const signature = await smartAccount.signTypedData({
        domain: {
          name: "MechaPay Subscription Gateway",
          version: "1",
          chainId: 5042002, // Arc Testnet
          verifyingContract: SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`,
        },
        types: {
          AuthorizeSessionKey: [
            { name: "subscriber", type: "address" },
            { name: "sessionPublicKey", type: "address" },
            { name: "planId", type: "bytes32" },
            { name: "tierId", type: "uint256" },
            { name: "maxCycles", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        },
        primaryType: "AuthorizeSessionKey",
        message: {
          subscriber: wallet.address as `0x${string}`,
          sessionPublicKey: sessionPublicKey as `0x${string}`,
          planId: sub.plan.id as `0x${string}`,
          tierId: BigInt(selectedTierId),
          maxCycles: BigInt(selectedCycles),
          deadline: BigInt(deadline),
        },
      });

      // 3. POST options, session key, & EIP-712 signature to MongoDB
      const res = await fetch("/api/autopay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriberAddress: wallet.address,
          planId: sub.plan.id,
          enabled: true,
          tierId: selectedTierId,
          buyerData: customBuyerData,
          signature,
          nonce,
          deadline,
          currentExpiresAt,
          sessionPublicKey,
          sessionPrivateKey,
          maxCycles: selectedCycles,
          userToken: sessionUserToken,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save configuration");

      // Update state
      const updatedSetting: AutoPaySetting = {
        id: json.upsertedId ?? "generated",
        subscriberAddress: wallet.address,
        planId: sub.plan.id,
        enabled: true,
        tierId: selectedTierId,
        buyerData: customBuyerData,
        signature,
        nonce,
        deadline,
        currentExpiresAt,
        sessionPublicKey,
        sessionPrivateKey,
        maxCycles: selectedCycles,
        executedCycles: 0,
      };

      setSetting(updatedSetting);
      setStatusMessage({ type: "success", text: "AutoPay configuration secured successfully." });
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: err instanceof Error ? err.message : "Signing failed." });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Disable AutoPay (Delete from DB)
  const handleDisableAutoPay = async () => {
    if (!sub || !wallet?.address || !sessionUserToken) return;

    setActionLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch(
        `/api/autopay?subscriberAddress=${wallet.address}&planId=${sub.plan.id}&userToken=${sessionUserToken}`,
        { method: "DELETE" }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to disable AutoPay");

      setSetting(null);
      setStatusMessage({ type: "success", text: "AutoPay pre-authorization revoked." });
      setShowRevokeModal(false);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to disable." });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen py-16 px-6 md:px-12 lg:px-20 space-y-12">
        <div className="py-6 border-b border-border/10 space-y-3">
          <Skeleton className="h-4 w-32 bg-muted rounded-full" />
          <Skeleton className="h-10 w-72 bg-muted rounded-full" />
          <Skeleton className="h-4 w-full max-w-2xl bg-muted rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7">
            <Skeleton className="h-96 w-full rounded-full bg-muted/10 border-0" />
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="h-80 w-full rounded-full bg-muted/10 border-0" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !sub) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-20 px-6 text-center space-y-6">
        <div className="h-12 w-12 flex items-center justify-center text-foreground">
          <AlertCircle size={28} />
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-foreground">Configuration Error</h2>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed font-semibold">{error ?? "Subscription not found"}</p>
        </div>
        <div className="flex items-center justify-center gap-6">
          <Button asChild size="sm" variant="link" className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground p-0">
            <Link href="/dashboard/autopay">Back to Autopay</Link>
          </Button>
          <Button onClick={() => window.location.reload()} size="sm" variant="outline" className="rounded-full font-bold text-xs h-9 px-4 border-foreground">
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  const isEnabled = !!setting?.enabled;
  const isModified = isEnabled && setting && (
    selectedTierId !== setting.tierId || 
    selectedCycles !== (setting.maxCycles ?? 10)
  );
  const planName = sub.metadata?.name ?? sub.metadata?.brand?.name ?? `Plan ${sub.plan.id.slice(0, 8)}`;
  const durationDays = Math.round(Number(sub.plan.duration) / 86400);

  // Active Tiers
  const activeTiers = sub.plan.tiers.filter(t => t.active);

  const baseEndTime = Number(sub.lastEndTime || Math.floor(Date.now() / 1000));
  const duration = Number(sub.plan.duration || 30 * 86400);
  const maxCycles = isEnabled && setting?.maxCycles ? setting.maxCycles : selectedCycles;
  const scheduleItems = Array.from({ length: maxCycles }, (_, i) => ({
    index: i + 1,
    startTime: baseEndTime + (i * duration),
    endTime: baseEndTime + ((i + 1) * duration)
  }));

  return (
    <div className="relative min-h-screen w-full py-12 px-6 md:px-12 lg:px-20 space-y-12 text-foreground font-sans animate-in fade-in duration-300">
      
      {/* Back Link */}
      <div className="max-w-7xl mx-auto w-full">
        <button
          onClick={() => router.push("/dashboard/autopay")}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} className="stroke-[2.5px]" /> Back to Auto-Pay
        </button>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        
        {/* Left Column - Configuration console */}
        <div className="lg:col-span-7 space-y-10">
          
          <div className="space-y-8">
          
          {/* Header Details */}
          <div className="flex flex-col md:flex-row md:items-start justify-between border-b border-border/20 pb-8 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground uppercase leading-none">{planName}</h1>
                <span className={cn(
                  "text-[10px] font-medium uppercase px-2.5 py-0.5 border tracking-wider rounded-full shrink-0",
                  sub.status === "ACTIVE"
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-muted text-muted-foreground border-border"
                )}>
                  {sub.status === "ACTIVE" ? "Active" : "Expired"}
                </span>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground flex items-center gap-2">
                <span>Plan ID:</span>
                <span className="font-bold select-all text-foreground truncate max-w-[200px] md:max-w-none">{sub.plan.id}</span>
              </p>
            </div>

            <span
              className={cn(
                "inline-flex items-center text-[10px] font-medium uppercase px-3 py-1 border tracking-wider md:self-start rounded-full shrink-0",
                isEnabled
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-muted text-muted-foreground border-border"
              )}
            >
              {isEnabled ? "Auto-Pay Active" : "Auto-Pay Inactive"}
            </span>
          </div>

          {/* Cycle details */}
          <div className="grid grid-cols-2 py-6 border-b border-border/20 gap-x-8 gap-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">Current Cycle Ends</span>
              <p className="text-xs font-mono font-bold text-foreground flex items-center gap-2">
                <Clock size={13} className="text-muted-foreground shrink-0" />
                {new Date(Number(sub.lastEndTime) * 1000).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">Renewal Period</span>
              <p className="text-xs font-mono font-bold text-foreground uppercase tracking-widest">Every {durationDays} Days</p>
            </div>
          </div>

          {/* Form Panel */}
          <div className="space-y-8 font-sans">
            
            {/* Active Switch Toggle */}
            <div className="flex items-center justify-between border-b border-border/10 pb-6">
              <div className="space-y-1.5 pr-4">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground block">Enable Recurring Auto-Pay</span>
                <p className="text-[10px] text-muted-foreground leading-normal font-semibold max-w-md">Allow automatic renewal payments of your subscriptions using safe passkey approvals.</p>
              </div>
              <button
                onClick={() => {
                  if (isEnabled) {
                    setShowRevokeModal(true);
                  } else {
                    void handleAuthorizeAutoPay();
                  }
                }}
                disabled={actionLoading}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shrink-0",
                  isEnabled ? "bg-primary" : "bg-muted hover:bg-muted/80"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background ring-0 transition duration-150 ease-in-out",
                    isEnabled ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Tier Selection - Underlined dropdown */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">
                Renewal Price Tier
              </label>
              <Select
                disabled={actionLoading}
                value={selectedTierId}
                onValueChange={(val) => setSelectedTierId(val ?? "")}
                items={activeTiers.map((t) => ({ value: t.tierId, label: t.label }))}
              >
                <SelectTrigger className="w-full flex w-full justify-between items-center h-11 px-3 border-b border-border bg-transparent text-xs font-bold font-sans rounded-lg border border-border px-3 transition-colors focus:border-foreground cursor-pointer">
                  <SelectValue placeholder="Select a pricing tier" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border border-border">
                  {activeTiers.map((t) => (
                    <SelectItem key={t.tierId} value={t.tierId} label={t.label} className="font-sans text-xs rounded-lg">
                      {t.label} — {Number(formatUnits(t.price, 6)).toLocaleString()} USDC
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* AutoPay Cycle Limit - Underlined Input */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-baseline">
                <label htmlFor="cycle-limit" className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Renewal Cycle Limit (1 - 10)
                </label>
                <span className="font-mono text-[10px] text-primary font-bold">{maxCycles} Cycles</span>
              </div>
              <input
                id="cycle-limit"
                type="number"
                min={1}
                max={10}
                disabled={actionLoading}
                value={selectedCycles}
                onChange={(e) => {
                  let val = Number(e.target.value);
                  if (val < 1) val = 1;
                  if (val > 10) val = 10;
                  setSelectedCycles(val);
                }}
                className="w-full h-11 bg-muted/20 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground font-sans font-semibold"
              />
            </div>

            {/* Locked Metadata - Text-Based Clean View */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">
                  Saved Details / Custom Data
                </label>
              </div>
              <p className="text-xs font-mono text-foreground font-bold select-all py-3 border-b border-border/10">
                {sub.lastBuyerData || "No parameters registered"}
              </p>
              <p className="text-[10px] text-muted-foreground leading-normal font-semibold">
                These options are permanently bound to align with your original subscription parameters.
              </p>
            </div>

            {/* Visual Execution Timeline Preview */}
            <div className="space-y-4 pt-6 border-t border-border/10">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Renewal Schedule
                </label>
                <button
                  onClick={() => setShowTimeline(!showTimeline)}
                  className="text-[9px] font-mono font-bold uppercase text-primary hover:underline transition-all"
                >
                  {showTimeline ? "[ Hide Timeline - ]" : `[ Show Timeline (${maxCycles} Cycles) + ]`}
                </button>
              </div>
              
              {showTimeline && (
                <div className="max-h-60 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="py-2.5 px-0 font-mono">Cycle</th>
                        <th className="py-2.5 px-0">Execution Date</th>
                        <th className="py-2.5 px-0 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 text-xs">
                      {scheduleItems.map((item) => {
                        const dateStr = new Date(item.startTime * 1000).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        });
                        const isExecuted = setting && setting.executedCycles ? item.index <= setting.executedCycles : false;

                        return (
                          <tr key={item.index}>
                            <td className="py-3 px-0 font-semibold text-foreground">
                              #{String(item.index).padStart(2, '0')}
                            </td>
                            <td className="py-3 px-0 text-muted-foreground font-medium">
                              {dateStr}
                            </td>
                            <td className="py-3 px-0 text-right">
                              <span className={cn(
                                "inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider",
                                isExecuted 
                                  ? "text-muted-foreground"
                                  : isEnabled
                                    ? "text-primary"
                                    : "text-muted-foreground/80"
                              )}>
                                <span className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  isExecuted ? "bg-muted-foreground" : isEnabled ? "bg-primary animate-pulse" : "bg-muted-foreground"
                                )} />
                                {isExecuted ? "Executed" : isEnabled ? "Authorized" : "Needs Signature"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground leading-normal font-semibold">
                Renewal transactions will trigger automatically on each date shown above, up to the defined cycle limit, using the authorized local session key.
              </p>
            </div>

            {/* Signature details status info */}
            {isEnabled && setting && !isModified && (
              <div className="border-l-2 border-primary pl-4 py-1 space-y-1.5">
                <p className="text-[10px] font-mono font-bold uppercase text-primary tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="shrink-0" /> Auto-Pay is Securely Set Up
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                  Your device signature is saved securely in the vault. Client Sequence Nonce: <span className="font-mono font-bold text-foreground">{setting.nonce}</span>. Validation deadline set for 5 years.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setShowRevokeModal(true)}
                    className="h-9 px-4 text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all duration-150 rounded-lg w-full md:w-auto cursor-pointer"
                  >
                    Turn Off Auto-Pay
                  </button>
                </div>
              </div>
            )}

            {/* Action triggers */}
            {(!isEnabled || isModified) && (
              <div className="pt-4 flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <Button
                  onClick={handleAuthorizeAutoPay}
                  disabled={actionLoading}
                  variant="outline"
                  className="flex-1 h-11 text-xs font-bold uppercase tracking-wider gap-2 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin shrink-0" /> Securing Intent...
                    </>
                  ) : isModified ? (
                    <>
                      <Play size={11} className="fill-current text-current shrink-0" /> Save & Re-Sign Setup
                    </>
                  ) : (
                    <>
                      <Play size={11} className="fill-current text-current shrink-0" /> Set Up Auto-Pay
                    </>
                  )}
                </Button>

                {isModified && (
                  <Button
                    onClick={() => {
                      if (setting) {
                        setSelectedTierId(setting.tierId);
                        setSelectedCycles(setting.maxCycles ?? 10);
                      }
                    }}
                    disabled={actionLoading}
                    variant="ghost"
                    className="h-11 px-6 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-muted border border-border/30 transition-colors cursor-pointer"
                  >
                    Reset Changes
                  </Button>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Messages */}
        {statusMessage && (
          <div
            className={cn(
              "py-3 border-t border-border/20 text-[11px] font-mono font-bold",
              statusMessage.type === "success" ? "text-primary" : "text-destructive"
            )}
          >
            <span>{statusMessage.type === "success" ? "✓" : "✗"} {statusMessage.text}</span>
          </div>
        )}

        </div>

        {/* Right Column - Cryptographic Pipeline Console */}
        <div className="lg:col-span-5 space-y-10 lg:border-l lg:border-border/10 lg:pl-16">
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest uppercase font-extrabold text-primary">
                Security & Status
              </span>
              <h2 className="text-xl font-extrabold tracking-tight uppercase">
                Auto-Pay Security Setup
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                Your device passkey creates secure, instant automatic payments without exposing your private keys.
              </p>
            </div>

            <div className="relative border-l border-border/20 pl-6 space-y-8">
              {/* Step 1: Biometric Consent */}
              <div className="relative">
                {/* Node Dot */}
                <span className={cn(
                  "absolute -left-7 top-1 w-2 h-2 border bg-background transition-colors duration-300 rounded-full",
                  isEnabled ? "bg-primary border-primary" : "border-muted-foreground"
                )} />
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      01. Biometric Consent
                    </span>
                    <span className={cn(
                      "text-[9px] font-mono font-bold uppercase px-2 py-0.5 border rounded-full transition-colors duration-300 shrink-0",
                      isEnabled ? "bg-muted text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"
                    )}>
                      {isEnabled ? "Signed" : "Pending Sign"}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground font-semibold">
                    Device login key approval
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-normal font-semibold">
                    Biometrically approve the setup using your device's saved login key or Face ID.
                  </p>
                </div>
              </div>

              {/* Step 2: Off-Chain Storage */}
              <div className="relative">
                <span className={cn(
                  "absolute -left-7 top-1 w-2 h-2 border bg-background transition-colors duration-300 rounded-full",
                  isEnabled ? "bg-primary border-primary" : "border-muted-foreground"
                )} />
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      02. Vault Storage
                    </span>
                    <span className={cn(
                      "text-[9px] font-mono font-bold uppercase px-2 py-0.5 border rounded-full transition-colors duration-300 shrink-0",
                      isEnabled ? "bg-muted text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"
                    )}>
                      {isEnabled ? "Secured" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground font-semibold">
                    Secure Vault
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-normal font-semibold">
                    Your secure auto-renewal settings are stored in the server vault.
                  </p>
                </div>
              </div>

              {/* Step 3: Sponsored Relayer */}
              <div className="relative">
                <span className={cn(
                  "absolute -left-7 top-1 w-2 h-2 border bg-background transition-colors duration-300 rounded-full",
                  isEnabled ? "bg-primary border-primary animate-pulse" : "border-muted-foreground"
                )} />
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      03. Transaction Fee Sponsor
                    </span>
                    <span className={cn(
                      "text-[9px] font-mono font-bold uppercase px-2 py-0.5 border rounded-full transition-colors duration-300 shrink-0",
                      isEnabled ? "bg-muted text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"
                    )}>
                      {isEnabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground font-semibold">
                    Free automatic triggers
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-normal font-semibold">
                    Transaction fees are fully covered. Auto-Pay handles renewals on schedule.
                  </p>
                </div>
              </div>

              {/* Step 4: Arc Testnet Chain */}
              <div className="relative">
                <span className={cn(
                  "absolute -left-7 top-1 w-2 h-2 border bg-background transition-colors duration-300 rounded-full",
                  isEnabled ? "bg-primary border-primary" : "border-muted-foreground"
                )} />
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      04. Network Verification
                    </span>
                    <span className={cn(
                      "text-[9px] font-mono font-bold uppercase px-2 py-0.5 border rounded-full transition-colors duration-300 shrink-0",
                      isEnabled ? "bg-muted text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"
                    )}>
                      {isEnabled ? "Verified" : "Ready"}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground font-semibold">
                    On-Chain Verification
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-normal font-semibold">
                    The smart payment gateway verifies and executes the transfer on schedule.
                  </p>
                </div>
              </div>
            </div>

            {/* Flat Assurances */}
            <div className="pt-6 border-t border-border/10 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={14} className="text-primary shrink-0" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  Zero transaction fees (Fully sponsored)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={14} className="text-primary shrink-0" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  Instantly revocable anytime
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cryptographic Revocation Confirmation Dialog ── */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-background border border-border p-8 space-y-6 rounded-full shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Warning Icon and Header */}
            <div className="space-y-3 font-sans">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Confirm</span>
              </div>
              <h2 className="text-lg font-bold uppercase tracking-tight text-foreground">
                Turn off Auto-Pay?
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                This will immediately turn off automatic renewals for this plan. You can set it up again anytime.
              </p>
            </div>

            {/* Structured details block */}
            <div className="border border-border/40 p-5 space-y-3 text-[10px] font-mono rounded-full">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground uppercase font-bold">Plan ID:</span>
                <span className="font-bold text-foreground truncate max-w-[200px] select-all font-mono">
                  {sub.plan.id}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground uppercase font-bold">Authorized Cycles:</span>
                <span className="font-bold text-foreground font-mono">
                  {maxCycles} Cycles
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground uppercase font-bold">Executed Cycles:</span>
                <span className="font-bold text-foreground font-mono">
                  {setting?.executedCycles ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground uppercase font-bold">Next Renewal:</span>
                <span className="font-bold text-foreground font-mono font-mono">
                  {new Date(Number(sub.lastEndTime) * 1000).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                disabled={actionLoading}
                onClick={() => setShowRevokeModal(false)}
                className="flex-1 h-10 border border-border bg-transparent text-xs font-mono font-bold uppercase tracking-wider hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleDisableAutoPay}
                className="flex-1 h-10 bg-destructive text-destructive-foreground text-xs font-mono font-bold uppercase tracking-wider hover:opacity-90 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" /> Revoking...
                  </>
                ) : (
                  "Turn Off"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
