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
  ArrowRight,
  ArrowLeft,
  Layers,
  LayoutGrid
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

interface Tier {
  price: string;
  label: string;
  features: SubscriptionFeature[];
}

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
  <div className="group relative py-4 border-b border-border/10 last:border-none">
    <div className="flex items-start gap-4">
      <span className="text-[10px] font-black italic text-primary/30 mt-3.5">
        0{index + 1}
      </span>
      <div className="flex-1 space-y-3">
        <input
          value={feature.title}
          onChange={(e) => onUpdate("title", e.target.value)}
          placeholder="Feature Headline"
          className="w-full bg-muted/5 border border-border/80 rounded-lg px-3 py-2 text-[11px] font-black outline-none transition-all placeholder:text-muted-foreground/90 uppercase tracking-widest focus:border-primary/20"
        />
        <textarea
          value={feature.description}
          onChange={(e) => onUpdate("description", e.target.value)}
          placeholder="Manifesto description..."
          className="w-full bg-muted/5 border border-border/80 rounded-lg px-3 py-2 text-[10px] font-medium outline-none transition-all placeholder:text-muted-foreground/90 resize-none min-h-[50px] leading-relaxed focus:border-primary/20"
        />
      </div>
      {isCanRemove && (
        <button
          onClick={onRemove}
          className="mt-4 p-2 rounded-lg text-muted-foreground/10 hover:text-red-500 hover:bg-red-500/5 transition-all"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  </div>
);

const TierConfig = ({ 
  tier, 
  index, 
  onUpdate, 
  onRemove, 
  isCanRemove 
}: { 
  tier: Tier; 
  index: number; 
  onUpdate: (updatedTier: Tier) => void;
  onRemove: () => void;
  isCanRemove: boolean;
}) => (
  <Card className="bg-card border-border/80 overflow-hidden rounded-2xl shadow-none">
    <div className="p-6 border-b border-border/10 bg-muted/5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
          {index + 1}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Configuration Matrix</span>
      </div>
      {isCanRemove && (
        <Button variant="ghost" size="icon" onClick={onRemove} className="text-muted-foreground/40 hover:text-red-500">
          <Trash2 size={14} />
        </Button>
      )}
    </div>
    <div className="p-6 space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <ProInput
          label="Tier Label"
          icon={Tag}
          value={tier.label}
          onChange={(e: any) => onUpdate({ ...tier, label: e.target.value })}
          placeholder="e.g. Basic, Pro, Enterprise"
        />
        <ProInput
          label="Price (USDC)"
          icon={DollarSign}
          value={tier.price}
          onChange={(e: any) => onUpdate({ ...tier, price: e.target.value })}
          placeholder="0.00"
          type="number"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/90">Tier Features</span>
          <Button 
            onClick={() => onUpdate({ ...tier, features: [...tier.features, { title: "", description: "" }] })}
            variant="outline" 
            className="h-6 rounded-lg px-3 border-primary/20 bg-primary/5 text-primary text-[8px] font-black uppercase tracking-widest"
          >
            <Plus size={8} className="mr-1.5" /> Add Benefit
          </Button>
        </div>
        <div className="space-y-2">
          {tier.features.map((f, i) => (
            <CompactFeature
              key={i}
              index={i}
              feature={f}
              isCanRemove={tier.features.length > 1}
              onUpdate={(k, v) => {
                const newFeatures = [...tier.features];
                newFeatures[i] = { ...newFeatures[i], [k]: v };
                onUpdate({ ...tier, features: newFeatures });
              }}
              onRemove={() => {
                onUpdate({ ...tier, features: tier.features.filter((_, idx) => idx !== i) });
              }}
            />
          ))}
        </div>
      </div>
    </div>
  </Card>
);

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-card border border-border rounded-xl", className)}>{children}</div>
);

// --- Main Page ---

export default function CreatePlanPage() {
  const { executeChallenge } = useCircleSDK();
  const { sessionUserToken, wallet } = useDashboardContext();

  const [step, setStep] = useState(1);
  const [brandName, setBrandName] = useState("");
  const [brandWebsite, setBrandWebsite] = useState("");
  const [planDurationDays, setPlanDurationDays] = useState("30");
  const [tiers, setTiers] = useState<Tier[]>([
    { price: "10", label: "Basic", features: [{ title: "", description: "" }] },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const preview = useMemo<SubscriptionUiMetadata>(
    () => ({
      type: "subscription-ui",
      version: "1.1",
      brand: { name: brandName, website: brandWebsite },
      tiers: tiers,
    }),
    [brandName, brandWebsite, tiers],
  );

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

      if (tiers.length === 0) {
        throw new Error("At least one tier is required");
      }

      // Clean up metadata: filter out empty features
      const cleanedTiers = tiers.map(t => ({
        ...t,
        features: t.features.filter(f => f.title.trim() !== "" || f.description.trim() !== "")
      }));

      const cleanedPreview = {
        ...preview,
        tiers: cleanedTiers
      };

      const uploadResponse = await fetch("/api/subscription/upload-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: cleanedPreview }),
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
          durationSeconds: durationNum * 24 * 60 * 60,
          ipfsHash: uploadJson.ipfsHash,
          tiers: tiers.map(t => ({ price: t.price, label: t.label })),
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
      setSuccess("Advanced tiered plan deployment initiated.");
      setBrandName("");
      setBrandWebsite("");
      setTiers([{ price: "10", label: "Basic", features: [{ title: "", description: "" }] }]);
      setPlanDurationDays("30");
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && brandName && brandWebsite && planDurationDays) {
      setStep(2);
    }
  };

  return (
    <section className="w-full py-12 px-6">
      <CompactHeader title="Deploy Tiered Protocol" subtitle="Merchant Subscription Factory v1.1" />

      {/* Progress Tracker */}
      <div className="flex items-center gap-4 mb-12">
        <div className={cn("flex items-center gap-2", step === 1 ? "text-primary" : "text-muted-foreground/40")}>
          <span className="text-[10px] font-black italic">01</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Brand Matrix</span>
        </div>
        <div className="h-[1px] w-8 bg-border/20" />
        <div className={cn("flex items-center gap-2", step === 2 ? "text-primary" : "text-muted-foreground/40")}>
          <span className="text-[10px] font-black italic">02</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Tier Architecture</span>
        </div>
      </div>

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

      <div className="space-y-12">
        {step === 1 && (
          <div className="space-y-10">
            <div className="flex items-center gap-2 mb-4">
              <LayoutGrid size={14} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Core Identity</span>
            </div>
            
            <div className="grid gap-8">
              <div className="grid gap-8 md:grid-cols-2">
                <ProInput
                  label="Merchant Brand"
                  icon={Globe}
                  value={brandName}
                  onChange={(e: any) => setBrandName(e.target.value)}
                  placeholder="The Collective"
                />
                <ProInput
                  label="Primary Gateway (Website)"
                  icon={Globe}
                  value={brandWebsite}
                  onChange={(e: any) => setBrandWebsite(e.target.value)}
                  placeholder="https://yourapp.link"
                />
              </div>
              <ProInput
                label="Billing Cycle (Days)"
                icon={Clock}
                value={planDurationDays}
                onChange={(e: any) => setPlanDurationDays(e.target.value)}
                placeholder="30"
                type="number"
              />
            </div>

            <div className="pt-10 border-t border-border/10 flex justify-end">
              <Button
                onClick={nextStep}
                disabled={!brandName || !brandWebsite || !planDurationDays}
                className="group h-12 px-8 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px]"
              >
                Configure Tiers
                <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Offering Matrix</span>
              </div>
              <Button 
                onClick={() => setTiers([...tiers, { price: "", label: "", features: [{ title: "", description: "" }] }])}
                variant="outline" 
                className="h-8 rounded-full px-4 border-primary/20 bg-primary/5 text-primary hover:bg-primary/20 text-[9px] font-black uppercase tracking-widest"
              >
                <Plus size={10} className="mr-2" /> New Tier
              </Button>
            </div>

            <div className="space-y-8">
              {tiers.map((tier, index) => (
                <TierConfig
                  key={index}
                  index={index}
                  tier={tier}
                  isCanRemove={tiers.length > 1}
                  onUpdate={(updated) => {
                    const newTiers = [...tiers];
                    newTiers[index] = updated;
                    setTiers(newTiers);
                  }}
                  onRemove={() => setTiers(tiers.filter((_, i) => i !== index))}
                />
              ))}
            </div>

            <div className="pt-10 border-t border-border/10 flex items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                 <div className="flex flex-col gap-1">
                    <span className="text-[7px] font-black text-muted-foreground/60 uppercase tracking-widest">Network</span>
                    <span className="text-[10px] font-bold text-primary italic uppercase">ARC Testnet</span>
                 </div>
                 <div className="h-6 w-[1px] bg-border/20" />
                 <div className="flex flex-col gap-1">
                    <span className="text-[7px] font-black text-muted-foreground/60 uppercase tracking-widest">Settlement</span>
                    <span className="text-[10px] font-bold text-foreground italic uppercase">USDC (Stable)</span>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px]"
                >
                  <ArrowLeft size={14} className="mr-2" /> Back
                </Button>
                <Button
                  onClick={() => void handleSubmit()}
                  disabled={loading || tiers.some(t => !t.price || !t.label)}
                  className="group h-12 px-8 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/10"
                >
                  {loading ? "Launching..." : "Deploy Protocol"}
                  {!loading && <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-20 text-center opacity-30">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">Mecha Pay merchant OS v1.0.5 • Multi-Tier Edition</p>
      </div>
    </section>
  );
}
