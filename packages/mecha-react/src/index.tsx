"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { CheckCircle2, Zap, Loader2, Lock, ArrowRight, AlertCircle, Check } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/* ── Utility: CSS Merger ── */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Feature {
  title: string;
  description: string;
}

export interface Tier {
  id: string;
  price: string;
  label: string;
  features: Feature[];
}

export interface Plan {
  id: string;
  name: string;
  duration: string;
  brand?: { name?: string; website?: string };
  tiers: Tier[];
}

export interface SubscribedTierDetail {
  tierId: string;
  tierName: string;
  features: Feature[];
  expiryDate: Date;
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
}

export interface MechaLabels {
  activeSubscription?: string;      // Default: "Current Plan"
  upgrade?: string;                 // Default: "Upgrade"
  downgrade?: string;               // Default: "Downgrade"
  changePlan?: string;              // Default: "Switch Plan"
  getTier?: string;                 // Default: "Get {{tierLabel}}"
  selectPlanDescription?: string;   // Default: "Select a membership tier to access the protocol."
  subscriptionActiveHeader?: string; // Default: "Subscription Active · {{countdown}} Left"
}

export interface MechaClassNames {
  container?: string;
  grid?: string;
  card?: string;
  badge?: string;
  tierLabel?: string;
  priceContainer?: string;
  priceAmount?: string;
  priceMuted?: string;
  featuresList?: string;
  featureItem?: string;
  featureTitle?: string;
  featureDescription?: string;
  button?: string;
}

/* ── Context ── */
interface MechaContextType {
  apiKey: string;
  portalUrl: string;
  isConfigured: boolean;
}

const MechaContext = createContext<MechaContextType | null>(null);

export interface MechaProviderProps {
  apiKey: string;
  children: React.ReactNode;
}

/**
 * MechaProvider
 * Wraps your application to provide Mecha configuration to all components and hooks.
 */
export const MechaProvider = ({ 
  apiKey, 
  children 
}: MechaProviderProps) => {
  const portalUrl = "https://mecha-pay.vercel.app";
  const value = useMemo(() => ({
    apiKey,
    portalUrl,
    isConfigured: !!apiKey
  }), [apiKey]);

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
  tierId?: string;    // Primary active tier ID (backward compatibility)
  tierIds: string[];  // List of all active/bought tier IDs
  loading: boolean;
  error: string | null;
}

/**
 * useMecha
 * The primary hook to check a user's subscription status, active tier IDs, and remaining time.
 */
export const useMecha = (planId: string, userId?: string) => {
  const { apiKey, portalUrl } = useMechaConfig();
  const [subscription, setSubscription] = useState<MechaSubscription>({
    status: "NONE",
    remainingSeconds: 0,
    tierIds: [],
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
          const activeTierId = data.subscription.tierId;
          const activeTierIds = data.subscription.tierIds || (activeTierId ? [activeTierId] : []);

          setSubscription({
            status: data.subscription.status,
            remainingSeconds: data.subscription.remainingSeconds,
            tierId: activeTierId,
            tierIds: activeTierIds,
            loading: false,
            error: null
          });
        } else {
          setSubscription(s => ({ ...s, status: "NONE", tierIds: [], loading: false }));
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setSubscription(s => ({ ...s, loading: false, error: message }));
      }
    };

    fetchStatus();
  }, [planId, userId, apiKey, portalUrl]);

  // Live Countdown
  useEffect(() => {
    if (subscription.remainingSeconds <= 0 || subscription.status !== "ACTIVE") return;
    const timer = setInterval(() => {
      setSubscription(prev => {
        const nextSeconds = Math.max(prev.remainingSeconds - 1, 0);
        return {
          ...prev,
          remainingSeconds: nextSeconds,
          status: nextSeconds <= 0 ? "EXPIRED" : "ACTIVE",
          tierIds: nextSeconds <= 0 ? [] : prev.tierIds
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [subscription.remainingSeconds, subscription.status]);

  return subscription;
};

/* ── Format Utilities ── */
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

/* ── Pricing Table Component ── */

export interface MechaPricingTableProps {
  planId: string;
  userId?: string;
  redirectUrl?: string;
  appearance?: MechaAppearance;
  className?: string;
  style?: React.CSSProperties;
  hideBranding?: boolean;
  recommendedTierId?: string;
  
  // Customization Overrides
  customLabels?: MechaLabels;
  classNames?: MechaClassNames;
  
  // Custom Renderers
  renderHeader?: (plan: Plan, subscription: MechaSubscription) => React.ReactNode;
  renderFooter?: () => React.ReactNode;
  renderTierButton?: (
    tier: Tier, 
    state: { 
      isActive: boolean; 
      isCurrent: boolean; 
      isDisabled: boolean; 
      isUpgrade: boolean; 
      isDowngrade: boolean; 
      label: string 
    }, 
    handleSelect: () => void
  ) => React.ReactNode;
}

/**
 * MechaPricingTable
 * Professional, premium, and fully customizable pricing table.
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
  customLabels,
  classNames,
  renderHeader,
  renderFooter,
  renderTierButton,
}: MechaPricingTableProps) => {
  const { apiKey, portalUrl } = useMechaConfig();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  
  const subscription = useMecha(planId, userId);

  const theme = appearance?.theme || "dark";
  const isDark = theme === "dark";

  // Base Style Tokens
  const tokens = {
    primary: appearance?.variables?.colorPrimary || (isDark ? "#ffffff" : "#000000"),
    error: appearance?.variables?.colorError || "#ef4444",
    background: appearance?.variables?.backgroundColor || (isDark ? "#0a0a0a" : "#ffffff"),
    text: appearance?.variables?.textColor || (isDark ? "#ffffff" : "#000000"),
    muted: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    cardBg: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    radius: appearance?.variables?.borderRadius || "4px",
    font: appearance?.variables?.fontFamily || "Inter, sans-serif",
    padding: appearance?.variables?.cardPadding || "40px",
    gap: appearance?.variables?.gap || "24px",
    
    // Premium Design Tokens
    hoverBorder: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)",
    activeBorder: isDark ? "#ffffff" : "#000000",
    recommendedBorder: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
    btnText: isDark ? "#09090b" : "#ffffff",
    btnHoverBg: isDark ? "#e4e4e7" : "#27272a",
    btnActiveBorder: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
    btnActiveText: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
    badgeBgRec: isDark ? "#18181b" : "#f4f4f5",
    badgeBorderRec: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    badgeTextRec: isDark ? "#f4f4f5" : "#18181b",
    badgeBgActive: isDark ? "#ffffff" : "#000000",
    badgeTextActive: isDark ? "#09090b" : "#ffffff",
    skeletonBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    errorBg: isDark ? "#09090b" : "#fbfbfb",
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
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        const code = err && typeof err === "object" && "code" in err && typeof err.code === "string"
          ? err.code
          : "FETCH_ERROR";
        setError({ message, code });
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

  // Compute Active Tier Price (for upgrade/downgrade logic)
  const maxActivePrice = useMemo(() => {
    if (!isActiveSub || !plan) return 0;
    const activeTiers = plan.tiers.filter(t => subscription.tierIds.includes(t.id));
    return activeTiers.length > 0 ? Math.max(...activeTiers.map(t => Number(t.price))) : 0;
  }, [isActiveSub, plan, subscription.tierIds]);

  // Scoped Custom Styles (Monochrome Flat Premium Theme)
  const customStyles = `
    .mecha-container-cls {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      box-sizing: border-box;
    }
    .mecha-grid-cls {
      display: flex;
      flex-wrap: wrap;
      gap: var(--mecha-gap);
      justify-content: center;
      padding: 20px 0;
      box-sizing: border-box;
    }
    .mecha-card-cls {
      flex: 1 1 320px;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      background-color: var(--mecha-card-bg);
      border: 1px solid var(--mecha-border-color);
      border-radius: var(--mecha-radius);
      padding: var(--mecha-padding);
      position: relative;
      box-sizing: border-box;
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }
    .mecha-card-cls:hover {
      border-color: var(--mecha-hover-border);
    }
    .mecha-card-rec-cls {
      border-color: var(--mecha-rec-border);
    }
    .mecha-card-active-cls {
      border-color: var(--mecha-active-border);
    }
    .mecha-btn-cls {
      margin-top: 32px;
      width: 100%;
      height: 48px;
      border-radius: var(--mecha-radius);
      border: none;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      box-sizing: border-box;
      transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    }
    .mecha-btn-active-cls {
      background-color: transparent;
      color: var(--mecha-btn-active-text);
      cursor: default;
      border: 1px solid var(--mecha-btn-active-border);
    }
    .mecha-btn-primary-cls {
      background-color: var(--mecha-primary);
      color: var(--mecha-btn-text-color);
    }
    .mecha-btn-primary-cls:hover {
      background-color: var(--mecha-btn-hover-bg);
    }
    .mecha-btn-disabled-cls {
      background-color: var(--mecha-border-color);
      color: var(--mecha-muted-text);
      cursor: not-allowed;
      opacity: 0.6;
    }
  `;

  const cssVariables = {
    "--mecha-primary": tokens.primary,
    "--mecha-primary-alpha-50": `${tokens.primary}80`,
    "--mecha-primary-alpha-15": `${tokens.primary}26`,
    "--mecha-primary-alpha-30": `${tokens.primary}4d`,
    "--mecha-card-bg": tokens.cardBg,
    "--mecha-border-color": tokens.border,
    "--mecha-radius": tokens.radius,
    "--mecha-padding": tokens.padding,
    "--mecha-gap": tokens.gap,
    "--mecha-btn-text-color": tokens.btnText,
    "--mecha-btn-hover-bg": tokens.btnHoverBg,
    "--mecha-hover-border": tokens.hoverBorder,
    "--mecha-active-border": tokens.activeBorder,
    "--mecha-rec-border": tokens.recommendedBorder,
    "--mecha-btn-active-border": tokens.btnActiveBorder,
    "--mecha-btn-active-text": tokens.btnActiveText,
    "--mecha-badge-bg-rec": tokens.badgeBgRec,
    "--mecha-badge-border-rec": tokens.badgeBorderRec,
    "--mecha-badge-text-rec": tokens.badgeTextRec,
    "--mecha-badge-bg-active": tokens.badgeBgActive,
    "--mecha-badge-text-active": tokens.badgeTextActive,
    "--mecha-skeleton-bg": tokens.skeletonBg,
    "--mecha-error-bg": tokens.errorBg,
    "--mecha-muted-text": tokens.muted,
  } as React.CSSProperties;

  if (loading) {
    return (
      <div 
        className={cn("mecha-container-cls", className, classNames?.container)} 
        style={{ fontFamily: tokens.font, color: tokens.text, ...cssVariables, ...style }}
      >
        <style dangerouslySetInnerHTML={{ __html: customStyles + `
          @keyframes mecha-pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
          .mecha-pulse-el {
            animation: mecha-pulse 1.8s ease-in-out infinite;
            background-color: var(--mecha-skeleton-bg);
            border-radius: var(--mecha-radius);
          }
        ` }} />

        {!hideBranding && (
          <div style={{ textAlign: 'center', marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ height: '36px', width: '220px' }} className="mecha-pulse-el" />
            <div style={{ height: '18px', width: '340px' }} className="mecha-pulse-el" />
          </div>
        )}

        <div style={{
          maxWidth: '800px',
          height: '140px',
          margin: '0 auto',
          boxSizing: 'border-box'
        }} className="mecha-pulse-el" />
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={cn("mecha-container-cls", className, classNames?.container)} 
        style={{ fontFamily: tokens.font, color: tokens.text, ...cssVariables, ...style }}
      >
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />
        <div style={{ 
          padding: '40px var(--mecha-padding)', 
          border: '1px solid var(--mecha-border-color)', 
          borderRadius: 'var(--mecha-radius)', 
          textAlign: 'center', 
          maxWidth: '440px', 
          margin: '80px auto', 
          backgroundColor: 'var(--mecha-error-bg)',
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: `${tokens.error}15`,
            color: tokens.error,
            marginBottom: '16px'
          }}>
            <AlertCircle size={20} />
          </div>
          <p style={{ 
            fontSize: '11px', 
            fontWeight: 800, 
            color: tokens.error, 
            textTransform: 'uppercase', 
            letterSpacing: '1.5px', 
            margin: 0 
          }}>
            {error.code || "Failed to Load"}
          </p>
          <p style={{ 
            fontSize: '13px', 
            color: tokens.muted, 
            marginTop: '8px', 
            fontWeight: 500, 
            lineHeight: 1.6, 
            margin: '8px 0 0 0' 
          }}>
            {error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mecha-btn-cls mecha-btn-primary-cls"
            style={{ marginTop: '24px', height: '40px' }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("mecha-container-cls", className, classNames?.container)} 
      style={{ fontFamily: tokens.font, color: tokens.text, ...cssVariables, ...style }}
    >
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      {/* ── Header Segment ── */}
      {renderHeader ? (
        renderHeader(plan || { id: planId, name: "", duration: "", tiers: [] }, subscription)
      ) : (
        !hideBranding && (
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            {isActiveSub && (
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                backgroundColor: '#18181b', 
                border: '1px solid #27272a',
                color: '#f4f4f5', 
                padding: '4px 10px', 
                borderRadius: '4px', 
                fontSize: '10px', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '1px', 
                marginBottom: '24px'
              }}>
                <Check size={11} style={{ strokeWidth: 3 }} />
                {customLabels?.subscriptionActiveHeader 
                  ? customLabels.subscriptionActiveHeader.replace("{{countdown}}", formatCountdown(subscription.remainingSeconds))
                  : `Subscription Active · ${formatCountdown(subscription.remainingSeconds)} Left`
                }
              </div>
            )}
            <h2 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '16px', color: tokens.text, ...appearance?.elements?.tierLabel }} className={classNames?.tierLabel}>
              {plan?.name}
            </h2>
            <p style={{ color: tokens.muted, fontSize: '15px', fontWeight: 500 }}>
              {customLabels?.selectPlanDescription || "Select a membership tier to access the protocol."}
            </p>
          </div>
        )
      )}

      {/* ── Pricing Tiers Grid ── */}
      <div className={cn("mecha-grid-cls", classNames?.grid)}>
        {plan?.tiers.map((tier, idx) => {
          const isRecommended = recommendedTierId ? tier.id === recommendedTierId : idx === 1;
          const isThisTierActive = isActiveSub && subscription.tierIds.includes(tier.id);
          
          // Determine Transition Type relative to maximum bought tier
          const tierPrice = Number(tier.price);
          const isUpgrade = isActiveSub && !isThisTierActive && tierPrice > maxActivePrice;
          const isDowngrade = isActiveSub && !isThisTierActive && tierPrice < maxActivePrice;
          
          // Resolve standard label text
          let buttonText = `Get ${tier.label}`;
          if (isThisTierActive) {
            buttonText = customLabels?.activeSubscription || "Current Plan";
          } else if (isActiveSub) {
            if (isUpgrade) {
              buttonText = customLabels?.upgrade || "Upgrade";
            } else if (isDowngrade) {
              buttonText = customLabels?.downgrade || "Downgrade";
            } else {
              buttonText = customLabels?.changePlan || "Switch Plan";
            }
          } else {
            if (customLabels?.getTier) {
              buttonText = customLabels.getTier.replace("{{tierLabel}}", tier.label);
            }
          }

          return (
            <div
              key={tier.id}
              className={cn(
                "mecha-card-cls",
                isThisTierActive && "mecha-card-active-cls",
                !isThisTierActive && isRecommended && "mecha-card-rec-cls",
                classNames?.card
              )}
              style={{
                border: isThisTierActive 
                  ? '1px solid var(--mecha-active-border)' 
                  : isRecommended 
                    ? '1px solid var(--mecha-rec-border)' 
                    : '1px solid var(--mecha-border-color)',
                ...appearance?.elements?.card
              }}
            >
              {/* Premium Flat Badges */}
              {isThisTierActive && (
                <div 
                  className={cn(classNames?.badge)}
                  style={{ 
                    position: 'absolute', 
                    top: '-10px', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    backgroundColor: 'var(--mecha-badge-bg-active)', 
                    color: 'var(--mecha-badge-text-active)', 
                    padding: '3px 12px', 
                    borderRadius: '4px', 
                    fontSize: '9px', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: '1px solid var(--mecha-badge-bg-active)'
                  }}
                >
                  <Check size={10} style={{ strokeWidth: 3 }} />
                  Current Plan
                </div>
              )}
              {!isThisTierActive && isRecommended && (
                <div 
                  className={cn(classNames?.badge)}
                  style={{ 
                    position: 'absolute', 
                    top: '-10px', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    backgroundColor: 'var(--mecha-badge-bg-rec)', 
                    color: 'var(--mecha-badge-text-rec)', 
                    padding: '3px 12px', 
                    borderRadius: '4px', 
                    fontSize: '9px', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px',
                    border: '1px solid var(--mecha-badge-border-rec)'
                  }}
                >
                  Recommended
                </div>
              )}

              <div style={{ flex: 1 }}>
                <h3 
                  className={cn(classNames?.tierLabel)} 
                  style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px', ...appearance?.elements?.tierLabel }}
                >
                  {tier.label}
                </h3>
                
                <div 
                  className={cn(classNames?.priceContainer)} 
                  style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '32px', ...appearance?.elements?.price }}
                >
                  <span className={cn(classNames?.priceAmount)} style={{ fontSize: '40px', fontWeight: 900 }}>
                    ${formatPrice(tier.price)}
                  </span>
                  <span className={cn(classNames?.priceMuted)} style={{ fontSize: '14px', color: tokens.muted, fontWeight: 700 }}>
                    / {humanDuration(plan?.duration || "0")}
                  </span>
                </div>

                <div className={cn(classNames?.featuresList)} style={{ borderTop: `1px solid var(--mecha-border-color)`, paddingTop: '24px' }}>
                  {tier.features.map((f, i) => (
                    <div key={i} className={cn("mecha-feat-item", classNames?.featureItem)} style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                      <div style={{ marginTop: '4px', flexShrink: 0 }}>
                        <Check size={12} style={{ color: isThisTierActive ? 'var(--mecha-active-border)' : 'var(--mecha-muted-text)' }} />
                      </div>
                      <div>
                        <p className={cn(classNames?.featureTitle)} style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, lineHeight: '1.4' }}>
                          {f.title}
                        </p>
                        {f.description && (
                          <p className={cn(classNames?.featureDescription)} style={{ fontSize: '11.5px', color: tokens.muted, marginTop: '2px', lineHeight: '1.4', margin: 0 }}>
                            {f.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Tier CTA Button Renderer ── */}
              {renderTierButton ? (
                renderTierButton(
                  tier, 
                  { 
                    isActive: isActiveSub, 
                    isCurrent: isThisTierActive, 
                    isDisabled: isThisTierActive, 
                    isUpgrade, 
                    isDowngrade, 
                    label: buttonText 
                  }, 
                  () => handleSelect(tier.id)
                )
              ) : (
                <button
                  onClick={() => !isThisTierActive && handleSelect(tier.id)}
                  disabled={isThisTierActive}
                  className={cn(
                    "mecha-btn-cls",
                    isThisTierActive 
                      ? "mecha-btn-active-cls" 
                      : "mecha-btn-primary-cls",
                    classNames?.button
                  )}
                  style={{
                    backgroundColor: isThisTierActive ? 'transparent' : 'var(--mecha-primary)',
                    color: isThisTierActive ? 'var(--mecha-btn-active-text)' : 'var(--mecha-btn-text-color)',
                    border: isThisTierActive ? '1px solid var(--mecha-btn-active-border)' : 'none',
                    ...appearance?.elements?.button
                  }}
                >
                  {buttonText}
                  {!isThisTierActive && <ArrowRight size={13} style={{ strokeWidth: 2.5 }} />}
                  {isThisTierActive && <Check size={13} style={{ strokeWidth: 3 }} />}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Footer / Branding Segment ── */}
      {renderFooter ? (
        renderFooter()
      ) : (
        !hideBranding && (
          <div style={{ marginTop: '60px', textAlign: 'center', opacity: 0.35, display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
            <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
              Powered by Mecha Pay
            </p>
            <Lock size={11} />
            <Zap size={11} />
          </div>
        )
      )}
    </div>
  );
};

/**
 * useMechaPerks
 * Fetches and resolves active plan tier details (tier name, features, expiry date) subscribed by the user.
 * Returns null if the user has no active subscriptions, or is expired.
 */
export const useMechaPerks = (planId: string, userId?: string) => {
  const { apiKey, portalUrl } = useMechaConfig();
  const subscription = useMecha(planId, userId);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  useEffect(() => {
    if (!planId) return;
    const fetchPlan = async () => {
      try {
        setLoadingPlan(true);
        const url = `${portalUrl}/api/sdk/plan/${planId}`;
        const res = await fetch(url, {
          headers: { "x-api-key": apiKey }
        });
        const data = await res.json();
        if (res.ok) {
          setPlan(data.plan);
        }
      } catch (err) {
        console.error("Failed to fetch plan in useMechaPerks", err);
      } finally {
        setLoadingPlan(false);
      }
    };
    fetchPlan();
  }, [planId, apiKey, portalUrl]);

  const perks = useMemo((): SubscribedTierDetail[] | null | undefined => {
    if (subscription.loading || loadingPlan) return undefined;
    if (subscription.status !== "ACTIVE" || subscription.tierIds.length === 0 || !plan) {
      return null;
    }

    const expiryTime = new Date(Date.now() + subscription.remainingSeconds * 1000);

    // Filter tiers that are currently active/bought by the user
    const activeTiers = plan.tiers.filter(t => subscription.tierIds.includes(t.id));
    
    // Map active tiers to details containing tier name, features, and expiry date
    return activeTiers.map(t => ({
      tierId: t.id,
      tierName: t.label,
      features: t.features,
      expiryDate: expiryTime,
    }));
  }, [subscription.loading, subscription.status, subscription.tierIds, subscription.remainingSeconds, plan, loadingPlan]);

  return {
    perks,
    loading: subscription.loading || loadingPlan,
    error: subscription.error
  };
};
