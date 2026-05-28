"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useDashboardContext } from "../_components/DashboardShell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Webhook,
  Plus,
  Trash2,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Globe,
  Layers,
  CheckCircle2,
  Settings2,
  RefreshCw,
  ExternalLink,
  FileText,
  XCircle,
  Terminal,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PlanTier = {
  tierId: string;
  price: string;
  label: string;
  active: boolean;
};

type UserPlanInfo = {
  planId: string;
  duration: string;
  active: boolean;
  tiers: PlanTier[];
  metadata: {
    name?: string;
    brand?: { name?: string };
  } | null;
};

type WebhookEndpoint = {
  id: string;
  userId: string;
  planId: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function WebhooksPage() {
  const { sessionUserToken, wallet } = useDashboardContext();

  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [plans, setPlans] = useState<UserPlanInfo[]>([]);
  
  const [loadingWebhooks, setLoadingWebhooks] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Form states
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [isActiveToggle, setIsActiveToggle] = useState(true);

  const [editWebhookId, setEditWebhookId] = useState<string | null>(null);

  // UX states
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [webhookToDelete, setWebhookToDelete] = useState<WebhookEndpoint | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Webhook Delivery Logs states
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [refreshingLogs, setRefreshingLogs] = useState(false);
  const [selectedLogDetails, setSelectedLogDetails] = useState<any | null>(null);

  // Fetch all webhooks configured for this user
  const fetchWebhooks = async () => {
    if (!sessionUserToken) return;
    try {
      const res = await fetch(`/api/webhooks?userToken=${sessionUserToken}`);
      const data = await res.json();
      if (data.webhooks) {
        setWebhooks(data.webhooks);
      }
    } catch (err) {
      console.error("Failed to fetch webhooks", err);
    } finally {
      setLoadingWebhooks(false);
    }
  };

  // Fetch delivery logs
  const fetchLogs = async (silent = false) => {
    if (!sessionUserToken) return;
    if (!silent) setLoadingLogs(true);
    else setRefreshingLogs(true);
    try {
      const res = await fetch(`/api/webhooks/logs?userToken=${sessionUserToken}`);
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoadingLogs(false);
      setRefreshingLogs(false);
    }
  };

  // Fetch user's plans to associate
  const fetchPlans = async () => {
    if (!wallet?.address || !sessionUserToken) {
      setLoadingPlans(false);
      return;
    }
    try {
      const params = new URLSearchParams({
        seller: wallet.address,
        userToken: sessionUserToken,
      });
      const res = await fetch(`/api/subscription/my-plans?${params.toString()}`);
      const data = await res.json();
      if (data.plans) {
        setPlans(data.plans);
      }
    } catch (err) {
      console.error("Failed to fetch plans", err);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    if (sessionUserToken) {
      void fetchWebhooks();
      void fetchLogs();
    }
  }, [sessionUserToken]);

  useEffect(() => {
    if (wallet?.address && sessionUserToken) {
      void fetchPlans();
    }
  }, [wallet?.address, sessionUserToken]);

  // Map of Plan ID -> Plan Title
  const planTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    map.set("all", "All Deployed Plans (Legacy)");
    plans.forEach((p) => {
      const title =
        p.metadata?.name ?? p.metadata?.brand?.name ?? "Subscription Plan";
      map.set(p.planId.toLowerCase(), title);
    });
    return map;
  }, [plans]);

  // Set of plans that already have a configured webhook endpoint
  const configuredPlanIds = useMemo(() => {
    return new Set(webhooks.map((w) => w.planId.toLowerCase()));
  }, [webhooks]);

  // Available plans list that are not configured yet (for creation form)
  const availablePlanOptions = useMemo(() => {
    const list: { id: string; label: string }[] = [];
    plans.forEach((p) => {
      const planIdLower = p.planId.toLowerCase();
      if (!configuredPlanIds.has(planIdLower)) {
        const name = p.metadata?.name ?? p.metadata?.brand?.name ?? "Subscription Plan";
        list.push({ id: p.planId, label: name });
      }
    });
    return list;
  }, [plans, configuredPlanIds]);

  const handleCreateWebhook = async () => {
    if (!webhookUrl.trim() || !selectedPlanId) return;
    
    // Client-side URL validation
    try {
      const parsedUrl = new URL(webhookUrl.trim());
      if (parsedUrl.protocol !== "https:") {
        setErrorMsg("Destination URL must use the HTTPS protocol.");
        return;
      }
    } catch (e) {
      setErrorMsg("Please enter a valid absolute URL (e.g., https://api.yourdomain.com/webhooks).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userToken: sessionUserToken,
          url: webhookUrl.trim(),
          planId: selectedPlanId,
          isActive: isActiveToggle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to configure webhook");
      }

      setWebhookUrl("");
      setSelectedPlanId("");
      setIsActiveToggle(true);
      setCreateOpen(false);
      void fetchWebhooks();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to configure webhook");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (wh: WebhookEndpoint) => {
    setEditWebhookId(wh.id);
    setWebhookUrl(wh.url);
    setSelectedPlanId(wh.planId);
    setIsActiveToggle(wh.isActive);
    setErrorMsg(null);
    setEditOpen(true);
  };

  const handleUpdateWebhook = async () => {
    if (!editWebhookId || !webhookUrl.trim() || !selectedPlanId) return;
    
    // Client-side URL validation
    try {
      const parsedUrl = new URL(webhookUrl.trim());
      if (parsedUrl.protocol !== "https:") {
        setErrorMsg("Destination URL must use the HTTPS protocol.");
        return;
      }
    } catch (e) {
      setErrorMsg("Please enter a valid absolute URL (e.g., https://api.yourdomain.com/webhooks).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/webhooks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userToken: sessionUserToken,
          id: editWebhookId,
          url: webhookUrl.trim(),
          planId: selectedPlanId,
          isActive: isActiveToggle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to update webhook");
      }

      setEditWebhookId(null);
      setWebhookUrl("");
      setSelectedPlanId("");
      setEditOpen(false);
      void fetchWebhooks();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update webhook");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWebhook = async () => {
    if (!webhookToDelete) return;
    try {
      const res = await fetch(`/api/webhooks?userToken=${sessionUserToken}&id=${webhookToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setWebhookToDelete(null);
        void fetchWebhooks();
      }
    } catch (err) {
      console.error("Failed to delete webhook", err);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const toggleSecretReveal = (id: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isLoading = loadingWebhooks || loadingPlans;

  return (
    <div className="space-y-12">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-border pb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Mecha Pay · Developer
          </p>
          <h1 className="text-4xl font-bold tracking-tight">Webhooks</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl leading-relaxed">
            Configure secure event subscriptions. Receive real-time JSON HTTP POST alerts at your destination URL whenever customer payments succeed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/docs">
            <Button variant="outline" size="sm" className="font-bold gap-1.5 h-9">
              API Docs
              <ArrowUpRight size={13} />
            </Button>
          </Link>

          <Dialog
            open={createOpen}
            onOpenChange={(open) => {
              setCreateOpen(open);
              if (open) {
                setWebhookUrl("");
                setSelectedPlanId(availablePlanOptions[0]?.id ?? "");
                setIsActiveToggle(true);
                setErrorMsg(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="font-bold gap-2 h-9" disabled={plans.length === 0}>
                <Plus size={14} />
                Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold uppercase tracking-widest">
                  Configure Webhook Endpoint
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Provide an HTTPS URL to receive event notifications for a specific plan.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3">
                {errorMsg && (
                  <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 py-2">
                    <AlertTriangle className="size-4 shrink-0" />
                    <AlertDescription className="text-[10px] font-semibold">{errorMsg}</AlertDescription>
                  </Alert>
                )}

                {/* Plan Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Subscription Plan
                  </label>
                  {availablePlanOptions.length === 0 ? (
                    <p className="text-[11px] text-amber-500 italic">
                      All your deployed plans already have webhook endpoints.
                    </p>
                  ) : (
                    <Select
                      value={selectedPlanId}
                      onValueChange={(val) => setSelectedPlanId(val || "")}
                    >
                      <SelectTrigger className="w-full bg-background border border-input h-10 px-3 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-primary focus-visible:outline-none text-left flex items-center justify-between min-w-0 gap-2">
                        <span className="truncate pr-4 block max-w-[280px] sm:max-w-[360px]">
                          {availablePlanOptions.find((opt) => opt.id === selectedPlanId)?.label || "Select a subscription plan"}
                        </span>
                      </SelectTrigger>
                      <SelectContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
                        {availablePlanOptions.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id} className="text-xs font-semibold max-w-full">
                            <span className="truncate block max-w-[260px] sm:max-w-[340px]">
                              {opt.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* URL Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Destination URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://api.yourdomain.com/webhooks"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="text-xs font-mono"
                  />
                  <p className="text-[9px] text-muted-foreground/60 leading-none">
                    Must use HTTPS and accept POST requests with JSON payload.
                  </p>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/40">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground">Endpoint Status</p>
                    <p className="text-[9px] text-muted-foreground/60">Immediately enable or disable event deliveries.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsActiveToggle(!isActiveToggle)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isActiveToggle ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                          isActiveToggle ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-widest min-w-8">
                      {isActiveToggle ? "ON" : "OFF"}
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={handleCreateWebhook}
                  disabled={isSubmitting || availablePlanOptions.length === 0 || !webhookUrl.trim()}
                  className="w-full font-bold h-9"
                >
                  {isSubmitting ? "Configuring…" : "Deploy Webhook"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Meta Strip ──────────────────────────────────────────── */}
      <div className="flex items-center gap-8 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Webhook size={12} className="text-primary" />
          <span>
            <strong className="text-foreground font-bold">{webhooks.length}</strong>{" "}
            {webhooks.length === 1 ? "webhook" : "webhooks"} configured
          </span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-2">
          <ShieldCheck size={12} className="text-blue-500" />
          <span>Events:</span>
          <Badge variant="outline" className="font-mono text-[9px] h-4 px-1.5 bg-muted/50 border-primary/20 text-primary">
            payment.succeeded
          </Badge>
          <span>only</span>
        </div>
      </div>

      {/* ── Webhooks List ───────────────────────────────────────── */}
      <div>
        {isLoading ? (
          <div className="py-24 text-center">
            <p className="text-xs text-muted-foreground animate-pulse uppercase tracking-widest font-mono">
              Fetching Webhooks…
            </p>
          </div>
        ) : plans.length === 0 ? (
          <div className="py-20 text-center space-y-4 border border-dashed border-border/80 bg-muted/5 rounded-[2rem] p-8">
            <div className="inline-flex items-center justify-center size-12 rounded-full bg-muted/60 text-muted-foreground/30 mx-auto">
              <Layers size={20} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-tight text-foreground">No Plans Detected</p>
              <p className="text-xs text-muted-foreground/80 max-w-xs mx-auto leading-relaxed">
                You must deploy at least one subscription plan gateway before you can configure payment notification webhooks.
              </p>
            </div>
            <Link href="/dashboard/plans/create">
              <Button className="font-bold h-9 gap-2">
                <Plus size={14} /> Deploy Plan
              </Button>
            </Link>
          </div>
        ) : webhooks.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <div className="inline-flex items-center justify-center size-12 rounded-full bg-muted mx-auto">
              <Webhook size={18} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No webhooks configured yet
            </p>
            <p className="text-xs text-muted-foreground/70 max-w-xs mx-auto">
              Add a webhook to get instant alerts at your destination server when a customer subscribes.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {webhooks.map((wh) => {
              const planTitle = planTitleMap.get(wh.planId.toLowerCase()) ?? "Subscription Plan";
              const isRevealed = !!revealedSecrets[wh.id];
              const isCopied = copiedId === wh.id;

              return (
                <div
                  key={wh.id}
                  className="flex flex-col gap-6 py-6 border-b border-border/40 last:border-b-0"
                >
                  {/* Top info row */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-base truncate text-foreground">
                          {planTitle}
                        </span>
                        <Layers size={13} className="text-muted-foreground/50" />
                        <Badge
                          variant={wh.isActive ? "secondary" : "outline"}
                          className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-lg border-none ${
                            wh.isActive ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground/40"
                          }`}
                        >
                          {wh.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground break-all max-w-2xl select-all">
                        {wh.url}
                      </p>
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(wh)}
                        className="font-bold h-8 text-[10px] uppercase gap-1.5 border-border/80"
                      >
                        <Settings2 size={12} />
                        Configure
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setWebhookToDelete(wh)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  {/* Cryptosecrets details row */}
                  <div className="grid gap-4 sm:grid-cols-2 bg-muted/20 p-4 rounded-xl border border-border/20">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                        Signing Secret
                      </span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono font-bold bg-background border border-border px-2.5 py-1 rounded-lg w-full flex items-center justify-between text-foreground">
                          {isRevealed ? wh.secret : "whsec_••••••••••••••••••••••••••••••••"}
                          <button
                            onClick={() => toggleSecretReveal(wh.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors ml-2 shrink-0"
                          >
                            {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(wh.secret, wh.id)}
                          className="h-8 w-8 rounded-lg shrink-0 border border-border bg-background"
                        >
                          {isCopied ? (
                            <Check size={13} className="text-blue-500" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                          Subscribed Event
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <CheckCircle2 size={12} className="text-blue-500 shrink-0" />
                          <span className="text-xs font-bold text-foreground">payment.succeeded</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                          Created Date
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <Clock size={12} />
                          <span>
                            {new Date(wh.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Webhook Delivery Logs Panel ───────────────────────── */}
      <div className="border border-border/60 bg-muted/5 rounded-[2rem] p-6 lg:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Terminal size={18} className="text-primary" />
              Webhook Activity Logs
            </h2>
            <p className="text-xs text-muted-foreground">
              Real-time delivery attempts and status history of on-chain checkout events.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs(true)}
            disabled={refreshingLogs || loadingLogs}
            className="font-bold gap-1.5 h-8 border-border/80 shrink-0 self-start sm:self-auto"
          >
            <RefreshCw size={12} className={`${refreshingLogs ? "animate-spin" : ""}`} />
            {refreshingLogs ? "Refreshing…" : "Refresh logs"}
          </Button>
        </div>

        {loadingLogs ? (
          <div className="py-12 text-center">
            <p className="text-xs text-muted-foreground animate-pulse font-mono uppercase tracking-widest">
              Loading activity logs…
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border/40 rounded-2xl bg-muted/20">
            <Clock size={24} className="text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs font-semibold text-muted-foreground">No recent delivery logs found</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1 max-w-xs mx-auto">
              Logs will appear automatically once payments are made on your subscription plans.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto text-left">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-border/40 pb-2">
                  <th className="text-[9px] font-black uppercase tracking-widest text-muted-foreground pb-3 pl-2">Status</th>
                  <th className="text-[9px] font-black uppercase tracking-widest text-muted-foreground pb-3">Event / Method</th>
                  <th className="text-[9px] font-black uppercase tracking-widest text-muted-foreground pb-3">Destination URL</th>
                  <th className="text-[9px] font-black uppercase tracking-widest text-muted-foreground pb-3">Time</th>
                  <th className="text-[9px] font-black uppercase tracking-widest text-muted-foreground pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {logs.map((log) => {
                  const isSuccess = log.status >= 200 && log.status < 300;
                  const formattedTime = new Date(log.timestamp).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  });
                  const formattedDate = new Date(log.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <tr key={log.id} className="hover:bg-muted/10 transition-colors group">
                      {/* Status badge */}
                      <td className="py-3.5 pl-2">
                        <Badge
                          variant={isSuccess ? "secondary" : "destructive"}
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md border-none ${
                            isSuccess
                              ? "bg-blue-500/10 text-blue-500"
                              : log.status === 0
                              ? "bg-rose-500/10 text-rose-500"
                              : "bg-amber-500/10 text-amber-500"
                          }`}
                        >
                          {log.status === 0 ? "FAILED" : log.status}
                        </Badge>
                      </td>

                      {/* Event / Method */}
                      <td className="py-3.5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">{log.event}</span>
                          <span className="text-[9px] font-mono text-muted-foreground/60 uppercase">POST</span>
                        </div>
                      </td>

                      {/* Destination URL */}
                      <td className="py-3.5 max-w-[220px]">
                        <span className="text-xs font-mono text-muted-foreground/80 truncate block select-all group-hover:text-foreground transition-colors" title={log.url}>
                          {log.url}
                        </span>
                      </td>

                      {/* Time and Duration */}
                      <td className="py-3.5">
                        <div className="flex flex-col text-xs">
                          <span className="font-semibold text-foreground/80">{formattedDate}, {formattedTime}</span>
                          <span className="text-[10px] text-muted-foreground/50">{log.durationMs}ms</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 text-right pr-2">
                        <div className="flex items-center justify-end gap-2">
                          {log.txHash && (
                            <a
                              href={`https://testnet.arcscan.app/tx/${log.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-border/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                              title="View on ArcScan Explorer"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLogDetails(log)}
                            className="font-bold h-7 text-[10px] uppercase border-border/40 gap-1 pl-2.5 pr-2.5"
                          >
                            <FileText size={11} />
                            Inspect
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Log Inspection Dialog ───────────────────────────── */}
      <Dialog
        open={!!selectedLogDetails}
        onOpenChange={(open) => {
          if (!open) setSelectedLogDetails(null);
        }}
      >
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto flex flex-col p-6 text-left">
          <DialogHeader className="pb-3 border-b border-border/40 shrink-0">
            <DialogTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-left">
              <Terminal size={15} className="text-primary" />
              Delivery Inspection Detail
            </DialogTitle>
            <DialogDescription className="text-xs text-left">
              Cryptographic delivery details for event ID: <span className="font-mono text-foreground font-semibold">{selectedLogDetails?.payload?.id || "N/A"}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedLogDetails && (
            <div className="space-y-5 py-4 flex-1 text-left min-h-0 overflow-y-auto pr-1">
              {/* Delivery stats strip */}
              <div className="grid grid-cols-3 gap-3 bg-muted/30 p-3.5 rounded-xl border border-border/30 text-left">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">Response Status</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`inline-block size-2 rounded-full ${
                        selectedLogDetails.status >= 200 && selectedLogDetails.status < 300
                          ? "bg-blue-500"
                          : "bg-rose-500"
                      }`}
                    />
                    <span className="text-xs font-bold text-foreground">
                      {selectedLogDetails.status === 0 ? "Failed / Timeout" : `${selectedLogDetails.status} ${selectedLogDetails.statusText}`}
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">Latency</span>
                  <p className="text-xs font-bold text-foreground mt-0.5">{selectedLogDetails.durationMs}ms</p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">Timestamp</span>
                  <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                    {new Date(selectedLogDetails.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </p>
                </div>
              </div>

              {/* Endpoint target details */}
              <div className="space-y-1 bg-muted/10 p-3 rounded-xl border border-border/10 text-xs text-left">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground font-semibold">Destination URL</span>
                  <span className="font-mono text-foreground break-all select-all font-medium text-right max-w-[70%]">{selectedLogDetails.url}</span>
                </div>
                <Separator className="my-1.5 opacity-50" />
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground font-semibold">Signature Method</span>
                  <span className="text-foreground font-semibold">HMAC-SHA256 (t, v1)</span>
                </div>
                <Separator className="my-1.5 opacity-50" />
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground font-semibold">On-Chain Tx Hash</span>
                  {selectedLogDetails.txHash ? (
                    <a
                      href={`https://testnet.arcscan.app/tx/${selectedLogDetails.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-primary hover:underline flex items-center gap-1 font-semibold truncate max-w-[70%]"
                    >
                      {selectedLogDetails.txHash.slice(0, 16)}...
                      <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span className="text-muted-foreground font-mono">None</span>
                  )}
                </div>
              </div>

              {/* Request JSON payload */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Terminal size={10} />
                    Request Payload (Body JSON)
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedLogDetails.payload, null, 2))}
                    className="h-6 w-6 rounded-md hover:bg-muted border border-border/40"
                    title="Copy payload"
                  >
                    <Copy size={11} />
                  </Button>
                </div>
                <pre className="text-[10px] font-mono p-3 bg-background border border-border/60 rounded-xl overflow-x-auto max-h-56 leading-relaxed select-all">
                  {JSON.stringify(selectedLogDetails.payload, null, 2)}
                </pre>
              </div>

              {/* Response response text body */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <FileText size={10} />
                  Response Body (Merchant Server Output)
                </label>
                <div className="p-3 bg-background border border-border/60 rounded-xl max-h-36 overflow-y-auto select-all text-left">
                  {selectedLogDetails.responseBody ? (
                    <pre className="text-[10px] font-mono whitespace-pre-wrap break-all leading-normal text-muted-foreground text-left">
                      {selectedLogDetails.responseBody}
                    </pre>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No response body returned from target.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-3 pt-3 border-t border-border/40 shrink-0">
            <Button
              onClick={() => setSelectedLogDetails(null)}
              className="w-full font-bold h-9 rounded-lg"
            >
              Close details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Modal Dialog ───────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-widest">
              Modify Webhook Configuration
            </DialogTitle>
            <DialogDescription className="text-xs">
              Change the target destination URL or toggle delivery status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {errorMsg && (
              <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 py-2">
                <AlertTriangle className="size-4 shrink-0" />
                <AlertDescription className="text-[10px] font-semibold">{errorMsg}</AlertDescription>
              </Alert>
            )}

            {/* Read-only Plan mapping indicator */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Assigned Subscription Plan
              </label>
              <div className="h-10 bg-muted/40 border border-border/40 px-3 rounded-lg flex items-center justify-between">
                <span className="text-xs font-bold text-foreground/80">
                  {planTitleMap.get(selectedPlanId.toLowerCase()) ?? "Subscription Plan"}
                </span>
              </div>
            </div>

            {/* URL Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Destination URL
              </label>
              <Input
                type="url"
                placeholder="https://api.yourdomain.com/webhooks"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="text-xs font-mono"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/40">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground">Endpoint Status</p>
                <p className="text-[9px] text-muted-foreground/60">Immediately enable or disable event deliveries.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsActiveToggle(!isActiveToggle)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isActiveToggle ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                      isActiveToggle ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-[10px] font-bold uppercase tracking-widest min-w-8">
                  {isActiveToggle ? "ON" : "OFF"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleUpdateWebhook}
              disabled={isSubmitting || !webhookUrl.trim()}
              className="w-full font-bold h-9"
            >
              {isSubmitting ? "Saving…" : "Save Configurations"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ───────────────────────────── */}
      <Dialog
        open={!!webhookToDelete}
        onOpenChange={(open) => {
          if (!open) setWebhookToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="size-4 text-destructive" />
              Revoke Webhook Endpoint
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              This is permanent. Any subscribed notifications for{" "}
              <strong>
                {webhookToDelete
                  ? planTitleMap.get(webhookToDelete.planId.toLowerCase()) ?? "Subscription Plan"
                  : ""}
              </strong>{" "}
              will immediately stop delivering to your destination URL.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setWebhookToDelete(null)}
              className="font-bold text-xs h-9 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteWebhook}
              className="font-bold text-xs h-9 rounded-lg"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
