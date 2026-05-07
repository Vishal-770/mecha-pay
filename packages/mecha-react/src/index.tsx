"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Zap, ShieldCheck, Loader2, ExternalLink, Lock, ArrowRight } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";

/* ── Utility ── */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function formatPrice(price: string) {
  return (Number(price) / 1e6).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function humanDuration(s: string) {
  const sec = Number(s);
  const d = Math.floor(sec / 86400);
  if (d >= 1) return `${d} day${d !== 1 ? "s" : ""}`;
  const h = Math.floor(sec / 3600);
  if (h >= 1) return `${h}h`;
  return `${Math.max(Math.floor(sec / 60), 1)}m`;
}

/* ── Types ── */
export interface Tier {
  id: string;
  price: string;
  label: string;
  features: Array<{ title: string; description: string }>;
}

export interface Plan {
  id: string;
  name: string;
  duration: string;
  brand?: { name?: string; website?: string };
  tiers: Tier[];
}

export interface MechaAppearance {
  /** Customize colors, fonts, and radii */
  variables?: {
    colorPrimary?: string;
    borderRadius?: string;
    fontFamily?: string;
  };
  /** CSS class overrides for specific elements */
  elements?: {
    card?: string;
    cardActive?: string;
    button?: string;
    buttonActive?: string;
    title?: string;
    price?: string;
    featureTitle?: string;
  };
}

export interface MechaPricingTableProps {
  /** The Mecha Protocol Plan ID */
  planId: string;
  /** Optional User ID to link the transaction to your internal system */
  userId?: string;
  /** Base URL for the Mecha Payment Portal */
  portalUrl?: string;
  /** The URL to redirect to after a successful purchase */
  redirectUrl?: string;
  /** Theme: 'light' or 'dark' (Default: 'dark') */
  theme?: "light" | "dark";
  /** Custom styling and appearance overrides */
  appearance?: MechaAppearance;
  /** Custom class name for the outer container */
  className?: string;
}

/**
 * MechaPricingTable
 * A professional, high-fidelity pricing table that connects to the Mecha Subscription Protocol.
 */
export const MechaPricingTable = ({
  planId,
  userId,
  portalUrl = "https://mecha-pay.vercel.app",
  redirectUrl,
  theme = "dark",
  appearance,
  className,
}: MechaPricingTableProps) => {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [subscription, setSubscription] = useState<{ status: string; remainingSeconds: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) return;

    const run = async () => {
      try {
        setLoading(true);
        const url = new URL(`${portalUrl}/api/sdk/plan/${planId}`);
        if (userId) url.searchParams.set("userId", userId);

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Protocol communication failed");
        
        const data = await res.json();
        setPlan(data.plan);
        setSubscription(data.subscription);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load protocol");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [planId, userId, portalUrl]);

  const handleSelect = (tierId: string) => {
    const rUrl = encodeURIComponent(redirectUrl || window.location.href);
    const checkoutUrl = `${portalUrl}/pay/${planId}?userId=${userId || ""}&redirectUrl=${rUrl}`;
    window.location.href = checkoutUrl;
  };

  const isActiveSub = subscription?.status === "ACTIVE" && (subscription?.remainingSeconds ?? 0) > 0;

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-32 min-h-[400px]", theme === "dark" ? "dark bg-background text-foreground" : "")}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Initializing Protocol</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("p-12 border border-red-500/10 bg-red-500/[0.02] rounded-3xl text-center max-w-md mx-auto my-20", theme === "dark" ? "dark bg-background" : "")}>
        <div className="bg-red-500/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-sm text-red-500 font-black uppercase tracking-widest">Protocol Connection Error</p>
        <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">{error}</p>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "w-full max-w-7xl mx-auto py-20 px-6", 
        className, 
        theme === "dark" ? "dark bg-background text-foreground" : ""
      )}
      style={{
        fontFamily: appearance?.variables?.fontFamily,
      }}
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-24 space-y-6"
      >
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 backdrop-blur-sm">
          <Zap className="h-3.5 w-3.5 text-primary fill-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Mecha Subscription Gateway</span>
        </div>
        
        <div className="space-y-4">
          <h2 className={cn("text-5xl md:text-6xl font-black tracking-tighter leading-none", appearance?.elements?.title)}>
            {plan?.name || "Choose Access"}
          </h2>
          <p className="text-muted-foreground/60 max-w-xl mx-auto text-base md:text-lg font-medium leading-relaxed">
            High-performance digital access with non-custodial settlement. Secure your slot on the Arc network.
          </p>
        </div>
      </motion.div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {plan?.tiers.map((tier, idx) => {
          const isPopular = tier.label.toLowerCase().includes("pro") || tier.label.toLowerCase().includes("plus") || idx === 1;
          
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className={cn(
                "relative group flex flex-col border border-border/40 rounded-[2.5rem] p-10 transition-all duration-500",
                isPopular ? "bg-primary/[0.03] border-primary/20 scale-105 z-10 shadow-2xl shadow-primary/5" : "bg-muted/5 hover:border-border",
                appearance?.elements?.card,
                isPopular && appearance?.elements?.cardActive
              )}
              style={{ borderRadius: appearance?.variables?.borderRadius }}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                  Recommended
                </div>
              )}

              <div className="flex-1 space-y-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight">{tier.label}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Tier ID {tier.id}</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className={cn("text-5xl font-black tracking-tighter", appearance?.elements?.price)}>
                    ${formatPrice(tier.price)}
                  </span>
                  <span className="text-sm text-muted-foreground/50 font-bold uppercase tracking-widest">
                    / {humanDuration(plan?.duration || "0")}
                  </span>
                </div>

                <div className="space-y-5 pt-8 border-t border-border/10">
                  {tier.features.map((f, i) => (
                    <div key={i} className="flex gap-4 items-start group/feat">
                      <div className="mt-0.5 bg-primary/10 rounded-full p-1 group-hover/feat:bg-primary/20 transition-colors">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      </div>
                      <div className="space-y-1">
                        <p className={cn("text-[13px] font-bold text-foreground/90", appearance?.elements?.featureTitle)}>
                          {f.title}
                        </p>
                        {f.description && (
                          <p className="text-[11px] text-muted-foreground/60 leading-relaxed font-medium">
                            {f.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => !isActiveSub && handleSelect(tier.id)}
                disabled={isActiveSub}
                className={cn(
                  "mt-12 w-full h-14 font-black uppercase tracking-[0.2em] text-[11px] rounded-[1.25rem] transition-all flex items-center justify-center gap-3 border shadow-sm",
                  isActiveSub 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 cursor-default"
                    : isPopular
                      ? "bg-primary text-primary-foreground border-primary hover:shadow-xl hover:shadow-primary/20"
                      : "bg-background text-foreground border-border/60 hover:bg-muted/10",
                  appearance?.elements?.button,
                  isActiveSub && appearance?.elements?.buttonActive
                )}
                style={{ 
                  borderRadius: appearance?.variables?.borderRadius,
                  backgroundColor: !isActiveSub && isPopular ? appearance?.variables?.colorPrimary : undefined,
                  borderColor: !isActiveSub && isPopular ? appearance?.variables?.colorPrimary : undefined,
                }}
              >
                <AnimatePresence mode="wait">
                  {isActiveSub ? (
                    <motion.span 
                      key="active" 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="flex items-center gap-2"
                    >
                      Member Active <CheckCircle2 className="h-4 w-4" />
                    </motion.span>
                  ) : (
                    <motion.span 
                      key="idle" 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      Get {tier.label} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          );
        })}
      </div>

      {/* Footer Branding */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.8 }}
        className="mt-24 pt-12 border-t border-border/10 flex flex-col md:flex-row items-center justify-between gap-8 grayscale"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
            <Zap className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            Secured by Mecha Pay Protocol
          </p>
        </div>
        
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> 256-bit AES
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Non-Custodial
          </div>
        </div>
      </motion.div>
    </div>
  );
};
