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
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
    map.set("all", "All Deployed Plans");
    plans.forEach((p) => {
      const title =
        p.metadata?.name ?? p.metadata?.brand?.name ?? `Plan ${p.planId.slice(0, 10)}`;
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
    const list = [];
    if (!configuredPlanIds.has("all")) {
      list.push({ id: "all", label: "All Deployed Plans" });
    }
    plans.forEach((p) => {
      const planIdLower = p.planId.toLowerCase();
      if (!configuredPlanIds.has(planIdLower)) {
        const name = p.metadata?.name ?? p.metadata?.brand?.name ?? `Plan ${p.planId.slice(0, 10)}`;
        list.push({ id: p.planId, label: name });
      }
    });
    return list;
  }, [plans, configuredPlanIds]);

  const handleCreateWebhook = async () => {
    if (!webhookUrl.trim() || !selectedPlanId) return;
    if (!webhookUrl.startsWith("https://")) {
      setErrorMsg("Destination URL must use HTTPS.");
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
    if (!webhookUrl.startsWith("https://")) {
      setErrorMsg("Destination URL must use HTTPS.");
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
                    <select
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      className="w-full bg-background border border-input h-10 px-3 rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary focus-visible:outline-none"
                    >
                      {availablePlanOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
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
          <ShieldCheck size={12} className="text-emerald-500" />
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
              const planTitle = planTitleMap.get(wh.planId.toLowerCase()) ?? `Plan ${wh.planId.slice(0, 10)}`;
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
                        {wh.planId === "all" ? (
                          <Globe size={13} className="text-muted-foreground/50" />
                        ) : (
                          <Layers size={13} className="text-muted-foreground/50" />
                        )}
                        <Badge
                          variant={wh.isActive ? "secondary" : "outline"}
                          className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-lg border-none ${
                            wh.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground/40"
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
                            <Check size={13} className="text-emerald-500" />
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
                          <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
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
                  {planTitleMap.get(selectedPlanId.toLowerCase()) ?? `Plan ${selectedPlanId.slice(0, 10)}`}
                </span>
                <span className="text-[9px] font-mono opacity-50 bg-muted px-1.5 py-0.5 rounded border border-border">
                  {selectedPlanId === "all" ? "GLOBAL" : selectedPlanId.slice(0, 8)}
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
                  ? planTitleMap.get(webhookToDelete.planId.toLowerCase()) ?? webhookToDelete.planId
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
