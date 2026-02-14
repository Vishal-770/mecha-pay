"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { useCircleSDK } from "@/context/CircleSDKContext";

type Feature = { title: string; description: string };

type PlanMetadata = {
  name?: string;
  brand?: { name?: string; website?: string };
  features?: Feature[];
} | null;

type BuyerRow = {
  id: string;
  subscriber: string;
  status: "ACTIVE" | "EXPIRED";
  subscriptionCount: number;
  totalSpent: string;
  lastStartTime: string;
  lastEndTime: string;
  remainingSeconds: number;
};

type PlanResponse = {
  plan: {
    planId: string;
    price: string;
    duration: string;
    active: boolean;
    subscriptionCount: number;
    totalGrossVolume: string;
    totalFeesCollected: string;
    lastSubscriptionAt: string | null;
    seller: { id: string };
    metadata: PlanMetadata;
  };
  isOwnerView: boolean;
  buyers: BuyerRow[];
  metrics: {
    activeBuyerCount: number;
    expiredBuyerCount: number;
    totalBuyers: number;
  };
  analytics?: {
    grossEarnings: string;
    feeCollected: string;
    netEarnings: string;
    avgRevenuePerSubscriber: string;
    repeatBuyerCount: number;
    repeatBuyerRate: number;
    activeRate: number;
    windows: {
      sevenDays: {
        subscriptionCount: number;
        grossVolume: string;
        totalFees: string;
        averageTicket: string;
      };
      thirtyDays: {
        subscriptionCount: number;
        grossVolume: string;
        totalFees: string;
        averageTicket: string;
      };
    };
  };
};

type EligibilityResponse = {
  eligible: boolean;
  reason: string;
  remainingSeconds: number;
};

function humanDuration(secondsValue: string) {
  const seconds = Number(secondsValue);
  const days = Math.floor(seconds / 86400);
  if (days >= 1) return `${days} day${days !== 1 ? "s" : ""}`;
  const hours = Math.floor(seconds / 3600);
  if (hours >= 1) return `${hours}h`;
  return `${Math.max(Math.floor(seconds / 60), 1)}m`;
}

function formatCountdown(totalSeconds: number) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function daysSince(timestamp: string | null) {
  if (!timestamp) return null;
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(now - Number(timestamp), 0);
  return Math.floor(diff / 86400);
}

export default function MarketplaceDetailPage() {
  const params = useParams<{ id: string }>();
  const { executeChallenge } = useCircleSDK();
  const { wallet, userCircleId, sessionUserToken } = useDashboardContext();

  const [data, setData] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const userAddress = wallet?.address ?? "";

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const viewer = wallet?.address ? `?viewer=${wallet.address}` : "";
        const response = await fetch(
          `/api/subscription/plan/${params.id}${viewer}`,
          {
            cache: "no-store",
          },
        );
        const json = (await response.json()) as PlanResponse & {
          error?: string;
        };
        if (!response.ok) throw new Error(json.error ?? "Failed to load plan");
        if (mounted) setData(json);
      } catch (err) {
        if (mounted)
          setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (params.id) void run();
    return () => {
      mounted = false;
    };
  }, [params.id, wallet?.address]);

  useEffect(() => {
    if (!data?.plan || !wallet?.address) return;
    let mounted = true;
    const run = async () => {
      try {
        const res = await fetch("/api/subscription/eligibility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscriber: wallet.address,
            planId: data.plan.planId,
          }),
        });
        const json = (await res.json()) as EligibilityResponse;
        if (mounted) setEligibility(json);
      } catch {
        if (mounted) {
          setEligibility({
            eligible: true,
            reason: "UNKNOWN",
            remainingSeconds: 0,
          });
        }
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, [data?.plan, wallet?.address]);

  const title = useMemo(() => {
    if (!data?.plan) return "Plan";
    return data.plan.metadata?.name ?? `Plan ${data.plan.planId.slice(0, 10)}`;
  }, [data?.plan]);

  const handleBuy = async () => {
    if (!wallet?.id || !userCircleId || !userAddress) {
      setError("Wallet and user are required before subscribing");
      return;
    }
    if (!data?.plan) return;

    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const eligRes = await fetch("/api/subscription/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriber: userAddress,
          planId: data.plan.planId,
        }),
      });
      const latestEligibility = (await eligRes.json()) as EligibilityResponse;
      if (!latestEligibility.eligible) {
        throw new Error(
          `Subscription still active. Remaining ${formatCountdown(latestEligibility.remainingSeconds)}.`,
        );
      }

      const allowanceRes = await fetch("/api/subscription/allowance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: wallet.address }),
      });
      const allowanceJson = (await allowanceRes.json()) as {
        allowance?: string;
        error?: string;
      };
      if (!allowanceRes.ok || !allowanceJson.allowance) {
        throw new Error(allowanceJson.error ?? "Failed to check allowance");
      }

      const allowance = BigInt(allowanceJson.allowance);
      const required = BigInt(data.plan.price);

      if (allowance < required) {
        const approveRes = await fetch("/api/subscription/approve-usdc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userToken: sessionUserToken,
            walletId: wallet.id,
            amount: formatUnits(required, 6),
          }),
        });
        const approveJson = (await approveRes.json()) as {
          challengeId?: string;
          error?: string;
        };
        if (!approveRes.ok || !approveJson.challengeId) {
          throw new Error(approveJson.error ?? "Approval challenge failed");
        }
        await executeChallenge(approveJson.challengeId);
      }

      const subscribeRes = await fetch("/api/subscription/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userToken: sessionUserToken,
          walletId: wallet.id,
          planId: data.plan.planId,
          buyerData: userCircleId,
        }),
      });
      const subscribeJson = (await subscribeRes.json()) as {
        challengeId?: string;
        error?: string;
      };
      if (!subscribeRes.ok || !subscribeJson.challengeId) {
        throw new Error(subscribeJson.error ?? "Subscribe challenge failed");
      }
      await executeChallenge(subscribeJson.challengeId);
      setSuccessMsg("Subscribed successfully");
      setEligibility({
        eligible: false,
        reason: "ACTIVE",
        remainingSeconds: Number(data.plan.duration),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-40 rounded-3xl bg-slate-100 animate-pulse" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const { plan, metrics, buyers, isOwnerView, analytics } = data;
  const features = plan.metadata?.features ?? [];
  const brand = plan.metadata?.brand;
  const blocked = eligibility ? !eligibility.eligible : false;
  const lastSubscriptionDays = daysSince(plan.lastSubscriptionAt);

  return (
    <section className="space-y-6">
      <Link
        href="/dashboard/marketplace"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        ← Back to Marketplace
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-linear-to-br from-white via-sky-50 to-cyan-50 p-6 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-cyan-400 via-sky-500 to-indigo-500" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                  plan.active
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {plan.active ? "Active" : "Inactive"}
              </span>
            </div>

            {brand && (
              <div className="mt-1.5 flex items-center gap-2 text-sm text-slate-500">
                <span className="font-medium text-slate-700">{brand.name}</span>
                {brand.website && (
                  <>
                    <span>·</span>
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:underline"
                    >
                      {brand.website.replace(/^https?:\/\//, "")}
                    </a>
                  </>
                )}
              </div>
            )}

            <p className="mt-2 text-xs text-slate-400 font-mono">
              Seller: {plan.seller.id}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Last subscription:{" "}
              {lastSubscriptionDays == null
                ? "No activity"
                : `${lastSubscriptionDays} day(s) ago`}
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">
                {formatUnits(plan.price, 6)}{" "}
                <span className="text-base font-normal text-slate-500">
                  USDC
                </span>
              </p>
              <p className="text-xs text-slate-400">
                per {humanDuration(plan.duration)}
              </p>
            </div>

            {!isOwnerView &&
              (successMsg ? (
                <p className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700">
                  {successMsg}
                </p>
              ) : (
                <button
                  onClick={() => void handleBuy()}
                  disabled={submitting || blocked || !plan.active || !wallet}
                  className="rounded-xl bg-sky-900 px-6 py-2.5 text-sm font-semibold text-white shadow
                    transition-colors hover:bg-sky-800 active:bg-sky-950
                    disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                >
                  {submitting
                    ? "Processing..."
                    : blocked
                      ? `Already Subscribed (${formatCountdown(eligibility!.remainingSeconds)} left)`
                      : !wallet
                        ? "Connect Wallet"
                        : "Buy Plan"}
                </button>
              ))}
            {isOwnerView && (
              <span className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                Creator View
              </span>
            )}
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Total Subscribers</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {metrics.totalBuyers}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Active Subscribers</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {metrics.activeBuyerCount}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Gross Revenue</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {Number(formatUnits(plan.totalGrossVolume, 6)).toFixed(2)} USDC
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Net Earnings</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {Number(formatUnits(analytics?.netEarnings ?? "0", 6)).toFixed(2)}{" "}
            USDC
          </p>
        </article>
      </div>

      {analytics && (
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">
              Plan Analysis
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Repeat Buyers</p>
                <p className="font-semibold text-slate-900">
                  {analytics.repeatBuyerCount} (
                  {analytics.repeatBuyerRate.toFixed(1)}%)
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Active Rate</p>
                <p className="font-semibold text-slate-900">
                  {analytics.activeRate.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">
                  Avg Revenue / Subscriber
                </p>
                <p className="font-semibold text-slate-900">
                  {Number(
                    formatUnits(analytics.avgRevenuePerSubscriber, 6),
                  ).toFixed(2)}{" "}
                  USDC
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Total Fees</p>
                <p className="font-semibold text-slate-900">
                  {Number(formatUnits(analytics.feeCollected, 6)).toFixed(2)}{" "}
                  USDC
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Momentum</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Last 7 Days Subs</p>
                <p className="font-semibold text-slate-900">
                  {analytics.windows.sevenDays.subscriptionCount}
                </p>
                <p className="text-xs text-slate-500">
                  {Number(
                    formatUnits(analytics.windows.sevenDays.grossVolume, 6),
                  ).toFixed(2)}{" "}
                  USDC
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Last 30 Days Subs</p>
                <p className="font-semibold text-slate-900">
                  {analytics.windows.thirtyDays.subscriptionCount}
                </p>
                <p className="text-xs text-slate-500">
                  {Number(
                    formatUnits(analytics.windows.thirtyDays.grossVolume, 6),
                  ).toFixed(2)}{" "}
                  USDC
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 col-span-2">
                <p className="text-xs text-slate-500">30 Day Average Ticket</p>
                <p className="font-semibold text-slate-900">
                  {Number(
                    formatUnits(analytics.windows.thirtyDays.averageTicket, 6),
                  ).toFixed(2)}{" "}
                  USDC
                </p>
              </div>
            </div>
          </article>
        </div>
      )}

      {features.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Metadata
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {feature.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            Subscribers
          </h3>
          <span className="text-xs text-slate-400">
            {isOwnerView
              ? "Creator view: full addresses"
              : "Public view: masked addresses"}
          </span>
        </div>

        {buyers.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No subscribers yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-2 py-2">Subscriber</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Remaining</th>
                  <th className="px-2 py-2">Purchases</th>
                  <th className="px-2 py-2">Spent</th>
                </tr>
              </thead>
              <tbody>
                {buyers.map((buyer) => (
                  <tr
                    key={buyer.id}
                    className="border-b border-slate-100 text-slate-700 hover:bg-slate-50"
                  >
                    <td className="px-2 py-3 font-mono text-xs">
                      {buyer.subscriber}
                    </td>
                    <td className="px-2 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          buyer.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {buyer.status}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-xs">
                      {buyer.status === "ACTIVE"
                        ? formatCountdown(buyer.remainingSeconds)
                        : "—"}
                    </td>
                    <td className="px-2 py-3">{buyer.subscriptionCount}</td>
                    <td className="px-2 py-3 text-xs">
                      {formatUnits(buyer.totalSpent, 6)} USDC
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
