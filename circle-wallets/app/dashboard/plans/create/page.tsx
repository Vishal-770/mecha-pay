"use client";

import { useMemo, useState } from "react";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import {
  type SubscriptionFeature,
  type SubscriptionUiMetadata,
  validateSubscriptionMetadata,
} from "@/lib/subscription";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Plus, 
  Trash2, 
  Globe, 
  Tag, 
  Clock, 
  DollarSign, 
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight
} from "lucide-react";

// --- Simple Professional Components ---

const CompactHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-12 border-b border-border/40 pb-6">
    <h1 className="text-3xl font-black uppercase tracking-tight mb-1 text-foreground">
      {title}
    </h1>
    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      {subtitle}
    </p>
  </div>
);

const ProInput = ({ label, icon: Icon, ...props }: any) => (
  <div className="group relative flex flex-col gap-1.5 w-full">
    <div className="flex items-center gap-2 px-1 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/90 group-focus-within:text-primary transition-colors">
      {Icon && <Icon size={10} className="stroke-[3px]" />}
      {label}
    </div>
    <div className="relative">
      <input
        {...props}
        className={cn(
          "w-full bg-muted/20 border border-border/80 rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all placeholder:text-muted-foreground/90 focus:border-primary/50 focus:bg-background",
          props.className
        )}
      />
    </div>
  </div>
);

const CompactFeature = ({ 
  feature, 
  index, 
  onUpdate, 
  onRemove, 
  isCanRemove 
}: { 
  feature: SubscriptionFeature; 
  index: number; 
  onUpdate: (key: keyof SubscriptionFeature, value: string) => void;
  onRemove: () => void;
  isCanRemove: boolean;
}) => (
  <div className="group relative py-8 border-b border-border/10 last:border-none">
    <div className="flex items-start gap-6">
      <span className="text-[10px] font-black italic text-primary/30 mt-3.5">
        0{index + 1}
      </span>
      <div className="flex-1 space-y-4">
        <div className="space-y-1">
          <label className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/90 px-1">Heading</label>
          <input
            value={feature.title}
            onChange={(e) => onUpdate("title", e.target.value)}
            placeholder="Feature Headline"
            className="w-full bg-muted/10 border border-border/80 rounded-xl px-4 py-2.5 text-xs font-black outline-none transition-all placeholder:text-muted-foreground/90 uppercase tracking-widest focus:border-primary/20 focus:bg-background"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/90 px-1">Description</label>
          <textarea
            value={feature.description}
            onChange={(e) => onUpdate("description", e.target.value)}
            placeholder="Manifesto description..."
            className="w-full bg-muted/10 border border-border/80 rounded-xl px-4 py-2.5 text-[10px] font-medium outline-none transition-all placeholder:text-muted-foreground/90 resize-none min-h-[60px] leading-relaxed focus:border-primary/20 focus:bg-background"
          />
        </div>
      </div>
      {isCanRemove && (
        <button
          onClick={onRemove}
          className="mt-6 p-2 rounded-xl text-muted-foreground/10 hover:text-red-500 hover:bg-red-500/5 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  </div>
);

// --- Main Page ---

export default function CreatePlanPage() {
  const { executeChallenge } = useCircleSDK();
  const { sessionUserToken, wallet } = useDashboardContext();

  const [planName, setPlanName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandWebsite, setBrandWebsite] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planDurationDays, setPlanDurationDays] = useState("30");
  const [features, setFeatures] = useState<SubscriptionFeature[]>([
    { title: "", description: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const preview = useMemo<SubscriptionUiMetadata>(
    () => ({
      type: "subscription-ui",
      version: "1.0",
      name: planName,
      brand: { name: brandName, website: brandWebsite },
      features,
    }),
    [planName, brandName, brandWebsite, features],
  );

  const updateFeature = (
    index: number,
    key: keyof SubscriptionFeature,
    value: string,
  ) => {
    setFeatures((prev) =>
      prev.map((entry, idx) =>
        idx === index ? { ...entry, [key]: value } : entry,
      ),
    );
  };

  const handleSubmit = async () => {
    if (!wallet?.id) {
      setError("ARC wallet not found");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const metadataValidation = validateSubscriptionMetadata(preview);
      if (!metadataValidation.valid) {
        throw new Error(metadataValidation.errors.join("; "));
      }

      const durationNum = Number(planDurationDays);
      if (!Number.isFinite(durationNum) || durationNum <= 0) {
        throw new Error("Duration must be a positive number of days");
      }

      const uploadResponse = await fetch("/api/subscription/upload-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: preview }),
      });
      const uploadJson = (await uploadResponse.json()) as {
        ipfsHash?: string;
        error?: string;
      };

      if (!uploadResponse.ok || !uploadJson.ipfsHash) {
        throw new Error(uploadJson.error ?? "Failed to upload metadata");
      }

      const createResponse = await fetch("/api/subscription/create-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userToken: sessionUserToken,
          walletId: wallet.id,
          price: planPrice,
          durationSeconds: durationNum * 24 * 60 * 60,
          ipfsHash: uploadJson.ipfsHash,
        }),
      });

      const createJson = (await createResponse.json()) as {
        challengeId?: string;
        error?: string;
      };

      if (!createResponse.ok || !createJson.challengeId) {
        throw new Error(createJson.error ?? "Failed to create plan challenge");
      }

      await executeChallenge(createJson.challengeId);
      setSuccess("Plan creation transaction submitted.");
      setPlanName("");
      setBrandName("");
      setBrandWebsite("");
      setPlanPrice("");
      setPlanDurationDays("30");
      setFeatures([{ title: "", description: "" }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CompactHeader title="Create Plan" subtitle="Merchant Subscription Factory" />

      {error && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-[10px] font-black uppercase tracking-widest text-red-500">
          <AlertCircle size={14} className="stroke-[3px]" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-[10px] font-black uppercase tracking-widest text-emerald-500">
          <CheckCircle2 size={14} className="stroke-[3px]" />
          {success}
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        {/* Left: Plan Details */}
        <div className="space-y-10">
          <div className="flex items-center gap-2 mb-4">
            <Tag size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Plan Configuration</span>
          </div>
          
          <div className="grid gap-6">
            <ProInput
              label="Plan Designation"
              icon={Tag}
              value={planName}
              onChange={(e: any) => setPlanName(e.target.value)}
              placeholder="e.g. Pro Membership"
            />
            <div className="grid gap-6 md:grid-cols-2">
              <ProInput
                label="Brand Name"
                icon={Globe}
                value={brandName}
                onChange={(e: any) => setBrandName(e.target.value)}
                placeholder="The Collective"
              />
              <ProInput
                label="Official URL"
                icon={Globe}
                value={brandWebsite}
                onChange={(e: any) => setBrandWebsite(e.target.value)}
                placeholder="https://yourapp.link"
              />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <ProInput
                label="Price (USDC)"
                icon={DollarSign}
                value={planPrice}
                onChange={(e: any) => setPlanPrice(e.target.value)}
                placeholder="0.00"
              />
              <ProInput
                label="Duration (Days)"
                icon={Clock}
                value={planDurationDays}
                onChange={(e: any) => setPlanDurationDays(e.target.value)}
                placeholder="30"
                type="number"
              />
            </div>
          </div>

          {/* New Integrated Action Area */}
          <div className="mt-4 pt-10 border-t border-border/10 space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="flex items-center gap-6 px-1">
               <div className="flex flex-col gap-1">
                  <span className="text-[7px] font-black text-muted-foreground/60 uppercase tracking-widest">Target Network</span>
                  <span className="text-[10px] font-bold text-primary italic uppercase flex items-center gap-1.5">
                    <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                    ARC Testnet
                  </span>
               </div>
               <div className="h-6 w-[1px] bg-border/20" />
               <div className="flex flex-col gap-1">
                  <span className="text-[7px] font-black text-muted-foreground/60 uppercase tracking-widest">Protocol Asset</span>
                  <span className="text-[10px] font-bold text-foreground italic uppercase">USDC (Stable)</span>
               </div>
            </div>

            <Button
              onClick={() => void handleSubmit()}
              disabled={loading || !planName || !planPrice}
              className="group w-full h-14 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-[0.15em] text-[10px] transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-30 shadow-xl shadow-primary/10"
            >
              {loading ? "Initializing Deployment..." : "Launch Subscription Plan"}
              {!loading && <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform stroke-[3px]" />}
            </Button>
            
            <p className="text-center text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest italic leading-relaxed">
              Upon launch, metadata is registered on IPFS and the specialized escrow factory initializes on the ARC Settlement Layer.
            </p>
          </div>
        </div>

        {/* Right: Features */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Value Manifesto</span>
            </div>
            <Button 
              onClick={() => setFeatures((prev) => [...prev, { title: "", description: "" }])}
              variant="outline" 
              className="h-8 rounded-full px-4 border-primary/20 bg-primary/5 text-primary hover:bg-primary/20 text-[9px] font-black uppercase tracking-widest transition-all"
            >
              <Plus size={10} className="mr-2 stroke-[3px]" /> Add Offering
            </Button>
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {features.map((feature, index) => (
              <CompactFeature
                key={index}
                feature={feature}
                index={index}
                isCanRemove={features.length > 1}
                onUpdate={(key, val) => updateFeature(index, key, val)}
                onRemove={() => setFeatures((prev) => prev.filter((_, idx) => idx !== index))}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="mt-20 text-center">
        <p className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.3em]">Mecha Pay merchant OS v1.0.4</p>
      </div>
    </section>
  );
}
