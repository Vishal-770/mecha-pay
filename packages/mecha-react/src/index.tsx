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
  portalUrl?: string;
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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px', fontFamily: tokens.font, color: tokens.text }}>
        <Loader2 style={{ animation: 'spin 1s linear infinite', opacity: 0.5 }} />
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '24px', 
        border: '1px solid #27272a', 
        borderRadius: tokens.radius, 
        textAlign: 'center', 
        maxWidth: '400px', 
        margin: '40px auto', 
        fontFamily: tokens.font, 
        backgroundColor: '#09090b' 
      }}>
        <AlertCircle size={20} style={{ color: '#f4f4f5', margin: '0 auto 12px' }} />
        <p style={{ fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{error.code || "Error"}</p>
        <p style={{ fontSize: '12px', color: '#f4f4f5', marginTop: '8px', fontWeight: 500, lineHeight: 1.5, margin: '8px 0 0 0' }}>{error.message}</p>
      </div>
    );
  }

  // Inject beautiful layout CSS styles (Enterprise Monochrome Flat Classes)
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
      transition: border-color 0.15s ease;
    }
    .mecha-card-cls:hover {
      border-color: #3f3f46;
    }
    .mecha-card-rec-cls {
      border-color: #52525b;
    }
    .mecha-card-active-cls {
      border-color: #ffffff;
      background-color: var(--mecha-card-active-bg);
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
      transition: background-color 0.15s ease, color 0.15s ease;
    }
    .mecha-btn-active-cls {
      background-color: transparent;
      color: #a1a1aa;
      cursor: default;
      border: 1px solid #27272a;
    }
    .mecha-btn-primary-cls {
      background-color: var(--mecha-primary);
      color: var(--mecha-btn-text-color);
    }
    .mecha-btn-primary-cls:hover {
      background-color: #e4e4e7;
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
    "--mecha-btn-text-color": isDark ? "#09090b" : "#ffffff",
    "--mecha-card-active-bg": "transparent",
    "--mecha-muted-text": tokens.muted,
  } as React.CSSProperties;

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
                  ? '1px solid #ffffff' 
                  : isRecommended 
                    ? `1px solid #52525b` 
                    : `1px solid var(--mecha-border-color)`,
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
                    backgroundColor: '#ffffff', 
                    color: '#09090b', 
                    padding: '3px 12px', 
                    borderRadius: '4px', 
                    fontSize: '9px', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: '1px solid #ffffff'
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
                    backgroundColor: '#18181b', 
                    color: '#f4f4f5', 
                    padding: '3px 12px', 
                    borderRadius: '4px', 
                    fontSize: '9px', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px',
                    border: '1px solid #27272a'
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
                        <Check size={12} style={{ color: isThisTierActive ? '#ffffff' : '#71717a' }} />
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
                    backgroundColor: isThisTierActive ? 'transparent' : tokens.primary,
                    color: isThisTierActive ? '#a1a1aa' : (isDark ? '#09090b' : '#ffffff'),
                    border: isThisTierActive ? '1px solid #27272a' : 'none',
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
