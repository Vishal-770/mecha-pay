"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { Separator } from "@/components/ui/separator";
import { encodeFunctionData } from "viem";
import { SUBSCRIPTION_GATEWAY_ADDRESS, normalizeIpfsUri } from "@/lib/subscription";

type EditPlanDialogProps = {
  planId: string;
  durationSeconds: number;
  metadata: EditPlanMetadata;
  onSuccess?: () => void;
};

type FeatureState = {
  title: string;
  description: string;
};

type TierState = {
  label: string;
  price: string;
  features: FeatureState[];
};

type EditPlanMetadata = {
  name?: string;
  brand?: { name?: string; website?: string };
  tiers?: TierState[];
} | null;

export function EditPlanDialog({ planId, durationSeconds, metadata, onSuccess }: EditPlanDialogProps) {
  const { executeTransaction } = useCircleSDK();
  const { wallet } = useDashboardContext();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default values
  const [durationDays, setDurationDays] = useState(Math.max(1, Math.floor(durationSeconds / 86400)).toString());
  const [brandName, setBrandName] = useState(metadata?.brand?.name || metadata?.name || "");
  const [brandWebsite, setBrandWebsite] = useState(metadata?.brand?.website || "");

  const [tiers, setTiers] = useState<TierState[]>(metadata?.tiers || []);

  const handleFeatureChange = (tierIdx: number, featureIdx: number, field: keyof FeatureState, value: string) => {
    const newTiers = [...tiers];
    newTiers[tierIdx].features[featureIdx][field] = value;
    setTiers(newTiers);
  };

  const addFeature = (tierIdx: number) => {
    const newTiers = [...tiers];
    if (!newTiers[tierIdx].features) newTiers[tierIdx].features = [];
    newTiers[tierIdx].features.push({ title: "", description: "" });
    setTiers(newTiers);
  };

  const removeFeature = (tierIdx: number, featureIdx: number) => {
    const newTiers = [...tiers];
    newTiers[tierIdx].features.splice(featureIdx, 1);
    setTiers(newTiers);
  };

  const handleSave = async () => {
    if (!wallet?.address) {
      setError("Active smart account wallet not found");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Create new metadata payload
      const newMetadata = {
        type: "subscription-ui",
        version: "1.1",
        brand: {
          name: brandName,
          website: brandWebsite || "https://example.com",
        },
        tiers: tiers,
      };

      // 2. Upload to IPFS
      const uploadRes = await fetch("/api/subscription/upload-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: newMetadata }),
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error || "Failed to upload metadata");

      // 3. Directly update metadata on contract
      const subscriptionGatewayAbi = [
        {
          name: "updatePlanMetadata",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "planId", type: "bytes32" },
            { name: "durationSeconds", type: "uint32" },
            { name: "ipfsHash", type: "string" }
          ],
          outputs: []
        }
      ] as const;

      const newDurationSeconds = Number(durationDays) * 86400;
      const normalizedIpfs = normalizeIpfsUri(uploadJson.ipfsHash);

      const txData = encodeFunctionData({
        abi: subscriptionGatewayAbi,
        functionName: "updatePlanMetadata",
        args: [planId as `0x${string}`, newDurationSeconds, normalizedIpfs],
      });

      await executeTransaction(
        [
          {
            to: SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`,
            data: txData,
          }
        ],
        false, // sponsorGas
        "Arc_Testnet" // chainKey
      );

      setOpen(false);
      if (onSuccess) onSuccess();

    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 px-6 rounded-lg border-border/80 font-black uppercase tracking-widest text-[10px]">
          <Edit3 className="mr-2 h-4 w-4" /> Edit & Notify
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 pb-2 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">Edit Protocol Data</DialogTitle>
            <DialogDescription>
              Update metadata such as brand details and tier features. (Tier prices and labels are permanently recorded on-chain).
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1 grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="brandName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Protocol Name</label>
              <Input
                id="brandName"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Premium Analytics"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="duration" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Cycle Duration (Days)</label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="brandWebsite" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Website URL</label>
            <Input
              id="brandWebsite"
              value={brandWebsite}
              onChange={(e) => setBrandWebsite(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <Separator />

          <div className="space-y-6">
            <h3 className="text-sm font-semibold">Tier Features</h3>
            {tiers.map((tier, tierIdx) => (
              <div key={tierIdx} className="space-y-4 bg-muted/20 p-4 rounded-xl border border-dashed">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-primary">{tier.label} Tier</h4>
                  <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">${tier.price}</span>
                </div>
                
                <div className="space-y-3">
                  {tier.features?.map((feat, featIdx) => (
                    <div key={featIdx} className="flex items-start gap-3">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Feature Title"
                          value={feat.title}
                          onChange={(e) => handleFeatureChange(tierIdx, featIdx, "title", e.target.value)}
                          className="h-8 text-xs font-semibold"
                        />
                        <Input
                          placeholder="Feature Description"
                          value={feat.description}
                          onChange={(e) => handleFeatureChange(tierIdx, featIdx, "description", e.target.value)}
                          className="h-8 text-xs text-muted-foreground"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                        onClick={() => removeFeature(tierIdx, featIdx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-dashed"
                  onClick={() => addFeature(tierIdx)}
                >
                  <Plus className="h-3 w-3 mr-2" /> Add Feature
                </Button>
              </div>
            ))}
            {tiers.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No tiers found in metadata.</p>
            )}
          </div>

          {error && <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg">{error}</p>}
        </div>

        <div className="p-6 pt-4 shrink-0 border-t bg-muted/10">
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} disabled={loading}>
              {loading ? "Processing..." : "Save & Notify Buyers"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
