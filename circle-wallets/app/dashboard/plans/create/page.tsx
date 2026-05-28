"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import {
  type SubscriptionFeature,
  type SubscriptionUiMetadata,
  validateSubscriptionMetadata,
  SUBSCRIPTION_GATEWAY_ADDRESS,
  normalizeIpfsUri,
} from "@/lib/subscription";
import { createPublicClient, encodeFunctionData, http, parseUnits } from "viem";
import { arcTestnet } from "@/lib/bridge_config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  Plus,
  Trash2,
  Globe,
  Tag,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Layers,
  LayoutGrid,
} from "lucide-react";

// --- Simple Professional Components ---

const CompactHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-12 border-b border-border/40 pb-6">
    <h1 className="text-3xl font-bold tracking-tight mb-1.5 text-foreground">
      {title}
    </h1>
    <p className="text-sm text-muted-foreground flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      {subtitle}
    </p>
  </div>
);

type ProInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: LucideIcon;
};

const ProInput = ({ label, icon: Icon, className, ...inputProps }: ProInputProps) => (
  <div className="group relative flex flex-col gap-1.5 w-full">
    <div className="flex items-center gap-1.5 px-1 text-xs font-semibold text-muted-foreground group-focus-within:text-primary transition-colors">
      {Icon && <Icon size={13} className="stroke-[2.5px]" />}
      {label}
    </div>
    <div className="relative">
      <input
        {...inputProps}
        className={cn(
          "w-full bg-muted/20 border border-border rounded-lg px-4 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary",
          className
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
      <span className="text-xs font-bold text-primary/30 mt-2.5">
        {index + 1}
      </span>
      <div className="flex-1 space-y-3">
        <input
          value={feature.title}
          onChange={(e) => onUpdate("title", e.target.value)}
          placeholder="Feature Name"
          className="w-full bg-muted/5 border border-border rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/50"
        />
        <textarea
          value={feature.description}
          onChange={(e) => onUpdate("description", e.target.value)}
          placeholder="Feature description..."
          className="w-full bg-muted/5 border border-border rounded-lg px-3 py-2 text-xs font-normal outline-none transition-all placeholder:text-muted-foreground/60 resize-none min-h-[50px] leading-relaxed focus:border-primary/50"
        />
      </div>
      {isCanRemove && (
        <button
          onClick={onRemove}
          className="mt-2 p-2 rounded-lg text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/5 transition-all"
        >
          <Trash2 size={13} />
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
  <Card className="bg-card border-border overflow-hidden rounded-xl shadow-none">
    <div className="p-5 border-b border-border/10 bg-muted/5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
          {index + 1}
        </div>
        <span className="text-xs font-semibold tracking-wider text-foreground">Tier Settings</span>
      </div>
      {isCanRemove && (
        <Button variant="ghost" size="icon" onClick={onRemove} className="text-muted-foreground/40 hover:text-red-500 h-8 w-8 rounded-lg">
          <Trash2 size={13} />
        </Button>
      )}
    </div>
    <div className="p-5 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <ProInput
          label="Tier Name"
          icon={Tag}
          value={tier.label}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ ...tier, label: e.target.value })}
          placeholder="e.g. Basic, Pro, Enterprise"
        />
        <ProInput
          label="Price (USDC)"
          icon={DollarSign}
          value={tier.price}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ ...tier, price: e.target.value })}
          placeholder="0.00"
          type="number"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/10 pb-2">
          <span className="text-xs font-semibold text-muted-foreground">Tier Features</span>
          <Button 
            onClick={() => onUpdate({ ...tier, features: [...tier.features, { title: "", description: "" }] })}
            variant="outline" 
            className="h-7 rounded-lg px-2.5 border-primary/20 bg-primary/5 text-primary text-xs font-medium hover:bg-primary/10 transition-colors"
          >
            <Plus size={11} className="mr-1" /> Add Feature
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
  const { executeTransaction } = useCircleSDK();
  const { wallet } = useDashboardContext();

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
  const [txHash, setTxHash] = useState<string | null>(null);

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
    if (!wallet?.address) {
      setError("Active smart account wallet not found");
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

      const prices = tiers.map((t) => parseUnits(t.price, 6));
      const labels = tiers.map((t) => t.label);
      if (prices.some((p) => p <= 0n)) {
        throw new Error("Each tier price must be greater than 0");
      }
      const durationSeconds = durationNum * 24 * 60 * 60;
      const normalizedIpfs = normalizeIpfsUri(uploadJson.ipfsHash);

      const subscriptionGatewayAbi = [
        {
          name: "createPlan",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "durationSeconds", type: "uint32" },
            { name: "ipfsHash", type: "string" },
            { name: "prices", type: "uint256[]" },
            { name: "labels", type: "string[]" }
          ],
          outputs: []
        }
      ] as const;

      const txData = encodeFunctionData({
        abi: subscriptionGatewayAbi,
        functionName: "createPlan",
        args: [durationSeconds, normalizedIpfs, prices, labels],
      });

      const { txHash: tx } = await executeTransaction(
        [
          {
            to: SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`,
            data: txData,
          }
        ],
        false, // sponsorGas
        "Arc_Testnet" // chainKey
      );

      const publicClient = createPublicClient({
        chain: arcTestnet,
        transport: http(arcTestnet.rpcUrls.default.http[0]),
      });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });
      if (receipt.status !== "success") {
        throw new Error("Transaction reverted while creating the plan");
      }

      setTxHash(tx);
      setSuccess("Plan created on-chain. Indexing can take 1-2 minutes.");
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
      <CompactHeader title="Create a Plan" subtitle="Design your subscription plans" />

      {/* Progress Tracker */}
      <div className="flex items-center gap-4 mb-12">
        <div className={cn("flex items-center gap-2", step === 1 ? "text-primary animate-in fade-in" : "text-muted-foreground/40")}>
          <span className="text-xs font-semibold">01</span>
          <span className="text-xs font-semibold tracking-wider">Brand Info</span>
        </div>
        <div className="h-[1px] w-8 bg-border/20" />
        <div className={cn("flex items-center gap-2", step === 2 ? "text-primary animate-in fade-in" : "text-muted-foreground/40")}>
          <span className="text-xs font-semibold">02</span>
          <span className="text-xs font-semibold tracking-wider">Pricing Tiers</span>
        </div>
      </div>

      {error && (
        <div className="mb-8 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm font-medium text-red-500">
          <AlertCircle size={16} className="stroke-[2px]" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-8 flex items-center gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-sm font-medium text-blue-500">
          <CheckCircle2 size={16} className="stroke-[2px]" />
          <div className="flex flex-wrap items-center gap-2">
            <span>{success}</span>
            {txHash && (
              <a
                href={`https://testnet.arcscan.app/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                View Transaction
              </a>
            )}
          </div>
        </div>
      )}

      <div className="space-y-12">
        {step === 1 && (
          <div className="space-y-10">
            <div className="flex items-center gap-2 mb-4">
              <LayoutGrid size={14} className="text-primary" />
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Basic Info</span>
            </div>
            
            <div className="grid gap-8">
              <div className="grid gap-8 md:grid-cols-2">
                <ProInput
                  label="Brand Name"
                  icon={Globe}
                  value={brandName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setBrandName(e.target.value)}
                  placeholder="The Collective"
                />
                <ProInput
                  label="Website URL"
                  icon={Globe}
                  value={brandWebsite}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setBrandWebsite(e.target.value)}
                  placeholder="https://yourapp.link"
                />
              </div>
              <ProInput
                label="Billing Cycle (Days)"
                icon={Clock}
                value={planDurationDays}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPlanDurationDays(e.target.value)}
                placeholder="30"
                type="number"
              />
            </div>

            <div className="pt-10 border-t border-border/10 flex justify-end">
              <Button
                onClick={nextStep}
                disabled={!brandName || !brandWebsite || !planDurationDays}
                className="group h-10 px-6 rounded-lg bg-primary text-primary-foreground font-semibold text-sm"
              >
                Next: Pricing Tiers
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
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Pricing Tiers</span>
              </div>
              <Button 
                onClick={() => setTiers([...tiers, { price: "", label: "", features: [{ title: "", description: "" }] }])}
                variant="outline" 
                className="h-8 rounded-lg px-3 border-primary/20 bg-primary/5 text-primary hover:bg-primary/20 text-xs font-medium"
              >
                <Plus size={12} className="mr-1" /> New Tier
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
                 <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-medium text-muted-foreground">Network</span>
                    <span className="text-xs font-semibold text-primary">Arc Testnet</span>
                 </div>
                 <div className="h-6 w-[1px] bg-border/20" />
                 <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-medium text-muted-foreground">Settlement Token</span>
                    <span className="text-xs font-semibold text-foreground">USDC (Stablecoin)</span>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="h-10 px-4 rounded-lg font-semibold text-sm"
                >
                  <ArrowLeft size={14} className="mr-2" /> Back
                </Button>
                <Button
                  onClick={() => void handleSubmit()}
                  disabled={loading || tiers.some(t => !t.price || !t.label)}
                  className="group h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-xl shadow-primary/5"
                >
                  {loading ? "Creating..." : "Create Plan"}
                  {!loading && <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-20 text-center opacity-35">
        <p className="text-xs text-muted-foreground font-medium">Powered by Mecha Pay</p>
      </div>
    </section>
  );
}
