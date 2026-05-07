"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { CheckCircle2, Zap, ShieldCheck, Loader2, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  theme?: "light" | "dark";
  variables?: {
    colorPrimary?: string;
    colorSecondary?: string;
    colorError?: string;
    borderRadius?: string;
    fontFamily?: string;
    backgroundColor?: string;
    textColor?: string;
    cardPadding?: string;
    gap?: string;
  };
  elements?: {
    container?: React.CSSProperties;
    card?: React.CSSProperties;
    button?: React.CSSProperties;
    price?: React.CSSProperties;
    tierLabel?: React.CSSProperties;
  };
}

export interface MechaConfig {
  apiKey: string;
  portalUrl?: string;
}

/* ── Context ── */
interface MechaContextType extends MechaConfig {
  isConfigured: boolean;
}

const MechaContext = createContext<MechaContextType | null>(null);

export interface MechaProviderProps extends MechaConfig {
  children: React.ReactNode;
}

/**
 * MechaProvider
 * Wraps your application to provide Mecha configuration to all components and hooks.
 */
export const MechaProvider = ({ 
  apiKey, 
  portalUrl = "https://mecha-pay.vercel.app", 
  children 
}: MechaProviderProps) => {
  const value = useMemo(() => ({
    apiKey,
    portalUrl,
    isConfigured: !!apiKey
  }), [apiKey, portalUrl]);

  return <MechaContext.Provider value={value}>{children}</MechaContext.Provider>;
};

const useMechaConfig = () => {
  const context = useContext(MechaContext);
  if (!context) {
    throw new Error("Mecha components must be used within a MechaProvider");
  }
  return context;
};

/* ── Hooks ── */

export interface MechaSubscription {
  status: "ACTIVE" | "EXPIRED" | "NONE";
  remainingSeconds: number;
  tierId?: string;
  loading: boolean;
  error: string | null;
}

/**
 * useMecha
 * The primary hook to check a user's subscription status and remaining time.
 */
export const useMecha = (planId: string, userId?: string) => {
  const { apiKey, portalUrl } = useMechaConfig();
  const [subscription, setSubscription] = useState<MechaSubscription>({
    status: "NONE",
    remainingSeconds: 0,
    loading: !!userId,
    error: null,
  });

  useEffect(() => {
    if (!planId || !userId) return;

    const fetchStatus = async () => {
      try {
        setSubscription(s => ({ ...s, loading: true, error: null }));
        const url = new URL(`${portalUrl}/api/sdk/plan/${planId}`);
        url.searchParams.set("userId", userId);
        
        const res = await fetch(url.toString(), {
          headers: { "x-api-key": apiKey }
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch subscription status");

        if (data.subscription) {
          setSubscription({
            status: data.subscription.status,
            remainingSeconds: data.subscription.remainingSeconds,
            tierId: data.subscription.tierId,
            loading: false,
            error: null
          });
        } else {
          setSubscription(s => ({ ...s, status: "NONE", loading: false }));
        }
      } catch (err: any) {
        setSubscription(s => ({ ...s, loading: false, error: err.message }));
      }
    };

    fetchStatus();
  }, [planId, userId, apiKey, portalUrl]);

  // Live Countdown
  useEffect(() => {
    if (subscription.remainingSeconds <= 0 || subscription.status !== "ACTIVE") return;
    const timer = setInterval(() => {
      setSubscription(prev => ({
        ...prev,
        remainingSeconds: Math.max(prev.remainingSeconds - 1, 0),
        status: prev.remainingSeconds - 1 <= 0 ? "EXPIRED" : "ACTIVE"
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [subscription.remainingSeconds, subscription.status]);

  return subscription;
};

/* ── Utility ── */
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

function formatCountdown(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  return `${hours}h ${mins}m ${secs}s`;
}

/* ── Components ── */

export interface MechaPricingTableProps {
  planId: string;
  userId?: string;
  redirectUrl?: string;
  appearance?: MechaAppearance;
  className?: string;
  style?: React.CSSProperties;
  hideBranding?: boolean;
  recommendedTierId?: string;
}

/**
 * MechaPricingTable
 * Professional pricing table that consumes configuration from MechaProvider.
 */
export const MechaPricingTable = ({
  planId,
  userId,
  redirectUrl,
  appearance,
  className,
  style,
  hideBranding = false,
  recommendedTierId,
}: MechaPricingTableProps) => {
  const { apiKey, portalUrl } = useMechaConfig();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  
  const subscription = useMecha(planId, userId);

  const theme = appearance?.theme || "dark";
  const isDark = theme === "dark";

  // Design Tokens
  const tokens = {
    primary: appearance?.variables?.colorPrimary || (isDark ? "#ffffff" : "#000000"),
    error: appearance?.variables?.colorError || "#ef4444",
    background: appearance?.variables?.backgroundColor || (isDark ? "#0a0a0a" : "#ffffff"),
    text: appearance?.variables?.textColor || (isDark ? "#ffffff" : "#000000"),
    muted: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
    border: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    cardBg: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    radius: appearance?.variables?.borderRadius || "1.5rem",
    font: appearance?.variables?.fontFamily || "Inter, sans-serif",
    padding: appearance?.variables?.cardPadding || "40px",
    gap: appearance?.variables?.gap || "24px",
  };

  useEffect(() => {
    if (!planId) return;
    const fetchPlan = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = `${portalUrl}/api/sdk/plan/${planId}`;
        const res = await fetch(url, {
          headers: { "x-api-key": apiKey }
        });
        const data = await res.json();
        if (!res.ok) throw { message: data.error || "Plan load failed", code: res.status.toString() };
        setPlan(data.plan);
      } catch (err: any) {
        setError({ message: err.message, code: err.code || "FETCH_ERROR" });
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planId, apiKey, portalUrl]);

  const handleSelect = (tierId: string) => {
    const rUrl = encodeURIComponent(redirectUrl || window.location.href);
    const checkoutUrl = `${portalUrl}/pay/${planId}?userId=${userId || ""}&redirectUrl=${rUrl}&apiKey=${apiKey || ""}`;
    window.location.href = checkoutUrl;
  };

  const isActiveSub = subscription.status === "ACTIVE" && subscription.remainingSeconds > 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px', fontFamily: tokens.font, color: tokens.text }}>
        <Loader2 style={{ animation: 'spin 1s linear infinite', opacity: 0.5 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', border: `1px solid ${tokens.error}30`, borderRadius: tokens.radius, textAlign: 'center', maxWidth: '400px', margin: '40px auto', fontFamily: tokens.font, backgroundColor: `${tokens.error}05` }}>
        <AlertCircle size={24} style={{ color: tokens.error, margin: '0 auto 16px' }} />
        <p style={{ fontSize: '12px', fontWeight: 900, color: tokens.error, textTransform: 'uppercase', letterSpacing: '2px' }}>{error.code || "Error"}</p>
        <p style={{ fontSize: '14px', color: tokens.text, marginTop: '8px', fontWeight: 500 }}>{error.message}</p>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', fontFamily: tokens.font, color: tokens.text, ...style }}>
      {!hideBranding && (
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          {isActiveSub && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>
              <CheckCircle2 size={12} />
              Subscription Active · {formatCountdown(subscription.remainingSeconds)} Left
            </div>
          )}
          <h2 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '16px', ...appearance?.elements?.tierLabel }}>{plan?.name}</h2>
          <p style={{ color: tokens.muted, fontSize: '16px', fontWeight: 500 }}>Select a membership tier to access the protocol.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.gap, justifyContent: 'center', padding: '20px 0' }}>
        {plan?.tiers.map((tier, idx) => {
          const isRecommended = recommendedTierId ? tier.id === recommendedTierId : idx === 1;
          const isThisTierActive = isActiveSub && subscription.tierId === tier.id;
          
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              style={{
                flex: '1 1 320px',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: tokens.cardBg,
                border: `1px solid ${isThisTierActive ? '#10b981' : isRecommended ? tokens.primary : tokens.border}`,
                borderRadius: tokens.radius,
                padding: tokens.padding,
                position: 'relative',
                boxShadow: isThisTierActive ? '0 20px 40px -12px rgba(16, 185, 129, 0.2)' : isRecommended ? `0 20px 40px -12px ${tokens.primary}20` : 'none',
                opacity: (isActiveSub && !isThisTierActive) ? 0.6 : 1,
                ...appearance?.elements?.card
              }}
            >
              {isThisTierActive && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#10b981', color: '#fff', padding: '4px 16px', borderRadius: '100px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Current Plan</div>
              )}
              {!isThisTierActive && isRecommended && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: tokens.primary, color: isDark ? '#000' : '#fff', padding: '4px 16px', borderRadius: '100px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Recommended</div>
              )}

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px', ...appearance?.elements?.tierLabel }}>{tier.label}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '32px', ...appearance?.elements?.price }}>
                  <span style={{ fontSize: '40px', fontWeight: 900 }}>${formatPrice(tier.price)}</span>
                  <span style={{ fontSize: '14px', color: tokens.muted, fontWeight: 700 }}>/ {humanDuration(plan?.duration || "0")}</span>
                </div>
                <div style={{ borderTop: `1px solid ${tokens.border}`, paddingTop: '24px' }}>
                  {tier.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                      <div style={{ marginTop: '4px' }}><CheckCircle2 size={16} style={{ color: isThisTierActive ? '#10b981' : tokens.primary, flexShrink: 0 }} /></div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, lineHeight: '1.4' }}>{f.title}</p>
                        {f.description && <p style={{ fontSize: '11px', color: tokens.muted, marginTop: '2px', lineHeight: '1.4' }}>{f.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => !isActiveSub && handleSelect(tier.id)}
                disabled={isActiveSub}
                style={{
                  marginTop: '32px',
                  width: '100%',
                  height: '52px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isThisTierActive ? 'rgba(16, 185, 129, 0.1)' : (isActiveSub ? tokens.border : tokens.primary),
                  color: isThisTierActive ? '#10b981' : (isActiveSub ? tokens.muted : (isDark ? '#000' : '#fff')),
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  fontSize: '11px',
                  cursor: isActiveSub ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  ...appearance?.elements?.button
                }}
              >
                {isThisTierActive ? "Active Subscription" : (isActiveSub ? "Plan Locked" : `Get ${tier.label}`)}
                {!isActiveSub && <ArrowRight size={14} />}
                {isThisTierActive && <CheckCircle2 size={14} />}
              </button>
            </motion.div>
          );
        })}
      </div>

      {!hideBranding && (
        <div style={{ marginTop: '60px', textAlign: 'center', opacity: 0.3, display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
          <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>Powered by Mecha Pay</p>
          <Lock size={12} /><Zap size={12} />
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` }} />
    </div>
  );
};
