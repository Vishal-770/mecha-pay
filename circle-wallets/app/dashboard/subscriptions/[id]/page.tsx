"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { 
  ArrowLeft, 
  Bell, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  ShieldCheck,
  Globe,
  Settings,
  AlertTriangle,
  Activity,
  ChevronRight
} from "lucide-react";

type NotificationEvent = {
  id: string;
  planId: string;
  blockTimestamp: string;
  transactionHash: string;
  type: "STATUS_CHANGE" | "PLAN_UPDATE";
  active?: boolean;
  price?: string;
  duration?: string;
  ipfsHash?: string;
};

type SubscriptionDetail = {
  id: string;
  status: "ACTIVE" | "EXPIRED";
  subscriptionCount: number;
  totalSpent: string;
  remainingSeconds: number;
  lastStartTime: string;
  lastEndTime: string;
  lastBuyerData: string;
  metadata: {
    name?: string;
    brand?: { name?: string; website?: string };
    features?: { title: string; description: string }[];
  } | null;
  plan: {
    id: string;
    price: string;
    duration: string;
    active: boolean;
  };
  seller: { id: string };
};

function formatCountdown(totalSeconds: number) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h ${minutes}m`;
}

function timeAgo(timestamp: string) {
  const seconds = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (seconds < 60) return "Just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function SubscriptionDetailPage() {
  const params = useParams<{ id: string }>();
  const { wallet } = useDashboardContext();

  const [data, setData] = useState<SubscriptionDetail | null>(null);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!params.id || !wallet?.address) return;
      try {
        setLoading(true);
        const [subRes, notifRes] = await Promise.all([
          fetch(`/api/subscription/my-subscriptions/${params.id}?subscriber=${wallet.address}`, { cache: "no-store" }),
          fetch(`/api/subscription/notifications?subscriber=${wallet.address}`, { cache: "no-store" })
        ]);

        const subJson = await subRes.json();
        const notifJson = await notifRes.json();

        if (!subRes.ok) throw new Error(subJson.error ?? "Failed to load subscription");

        if (mounted) {
          setData(subJson.subscription);
          // Filter notifications for this specific plan
          const planNotifs = (notifJson.notifications ?? []).filter((n: NotificationEvent) => n.planId === params.id);
          setNotifications(planNotifs);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void run();
    return () => { mounted = false; };
  }, [params.id, wallet?.address]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-3xl border border-slate-100 bg-white p-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-100 border-t-sky-600" />
        <p className="animate-pulse text-sm font-medium text-slate-500">Syncing subscription details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-3xl border border-rose-100 bg-rose-50 p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <Activity size={24} />
        </div>
        <h3 className="mt-4 text-lg font-bold text-rose-900">Load Error</h3>
        <p className="mt-2 text-sm text-rose-600">{error ?? "Subscription data is unavailable"}</p>
        <Link href="/dashboard/subscriptions" className="mt-6 inline-flex text-sm font-semibold text-rose-700 hover:underline">
          <ArrowLeft size={16} className="mr-1" /> Back to My Subscriptions
        </Link>
      </div>
    );
  }

  const title = data.metadata?.name ?? `Plan ${data.plan.id.slice(0, 10)}`;
  const isActive = data.status === "ACTIVE";

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <Link
            href="/dashboard/subscriptions"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            My Subscriptions
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">{title}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-black tracking-widest border ${
              isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200"
            }`}>
              {data.status}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Seller: {truncateAddress(data.seller.id)}
          </p>
        </div>

        <div className="flex gap-2">
           <Link
            href={`/dashboard/marketplace/${data.plan.id}`}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Marketplace Listing
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Card */}
          <article className="relative overflow-hidden rounded-[2.5rem] bg-indigo-900 p-8 text-white shadow-2xl shadow-indigo-900/20">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
            
            <div className="relative z-10 grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200/60">Subscription Status</p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md border border-white/10">
                      <Clock size={32} className={isActive ? "text-sky-300" : "text-slate-400"} />
                    </div>
                    <div>
                      <p className="text-3xl font-black">
                        {isActive ? formatCountdown(data.remainingSeconds) : "EXPIRED"}
                      </p>
                      <p className="text-xs font-bold text-indigo-200/80">Remaining access time</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                    <span className="text-indigo-200/60">Usage Period</span>
                    <span>{Math.round((data.remainingSeconds / Number(data.plan.duration)) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-linear-to-r from-sky-400 to-indigo-400 transition-all duration-1000"
                      style={{ width: `${Math.min((data.remainingSeconds / Number(data.plan.duration)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-white/5 p-5 border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200/60">Total Spent</p>
                  <p className="mt-2 text-xl font-black">{formatUnits(data.totalSpent, 6)}</p>
                  <p className="text-[10px] font-bold text-sky-300">USDC Total</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-5 border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200/60">Renewals</p>
                  <p className="mt-2 text-xl font-black">{data.subscriptionCount}</p>
                  <p className="text-[10px] font-bold text-indigo-200/60">Cycles active</p>
                </div>
                <div className="col-span-2 rounded-3xl bg-linear-to-br from-sky-500/20 to-indigo-500/20 p-5 border border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200/60">Last Subscription Data</p>
                  <div className="mt-2 truncate font-mono text-[11px] font-bold text-sky-200 bg-indigo-950/50 px-3 py-2 rounded-xl">
                    {data.lastBuyerData || "No data provided"}
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Plan Metadata Content */}
          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-2xl bg-sky-50 p-2.5 text-sky-600">
                  <Globe size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Brand Identity</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Provider Name</label>
                  <p className="text-base font-bold text-slate-900 mt-1">{data.metadata?.brand?.name || "Premium Provider"}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Official Website</label>
                  <a 
                    href={data.metadata?.brand?.website} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sky-600 hover:text-sky-700 transition-colors font-bold mt-1"
                  >
                    {data.metadata?.brand?.website || "N/A"}
                    <ExternalLink size={14} />
                  </a>
                </div>
                <div className="pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <p className="text-xs font-bold text-slate-600">Secure USDC-Native Billing</p>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-2xl bg-amber-50 p-2.5 text-amber-600">
                  <Settings size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Service Features</h3>
              </div>

              <div className="space-y-4">
                {data.metadata?.features?.map((f, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="mt-0.5 rounded-full bg-white p-1 shadow-xs ring-1 ring-slate-200">
                      <CheckCircle2 size={12} className="text-sky-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">{f.title}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                ))}
                {(!data.metadata?.features || data.metadata.features.length === 0) && (
                  <p className="text-xs text-slate-400 italic py-8 text-center opacity-60">No features specified by seller.</p>
                )}
              </div>
            </article>
          </div>
        </div>

        {/* Sidebar: Activity & Support */}
        <aside className="space-y-8">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm h-fit">
            <div className="flex items-center gap-3 mb-8">
              <div className="rounded-2xl bg-indigo-50 p-2.5 text-indigo-600 font-bold">
                <Bell size={20} />
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Plan Activity</h2>
            </div>

            <div className="space-y-6">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic opacity-40">No recent updates</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="relative pl-6 pb-6 border-l-2 border-slate-100 last:pb-0 last:border-l-transparent">
                    <div className={`absolute -left-1.5 top-0 h-3 w-3 rounded-full ${notif.type === "STATUS_CHANGE" ? "bg-amber-400" : "bg-sky-400"}`} />
                    <div className="space-y-2">
                       <p className="text-[11px] font-bold text-slate-400 leading-none">
                        {timeAgo(notif.blockTimestamp)}
                      </p>
                      <p className="text-xs font-black text-slate-800 leading-relaxed">
                        {notif.type === "STATUS_CHANGE" 
                          ? `Seller toggled plan to ${notif.active ? "ACTIVE" : "INACTIVE"}`
                          : "Seller updated plan pricing or visual details"}
                      </p>
                      <div className="flex gap-2">
                         <span className={`rounded-lg px-2 py-1 text-[10px] font-black ${
                           notif.type === "STATUS_CHANGE" ? "bg-amber-50 text-amber-600" : "bg-sky-50 text-sky-600"
                         }`}>
                           {notif.type === "STATUS_CHANGE" ? "Network State" : "Data Update"}
                         </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <article className="rounded-[2rem] bg-linear-to-br from-indigo-50 to-white p-8 border border-slate-200">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Subscriber Support</h3>
            <p className="mt-4 text-sm font-bold text-slate-700 leading-relaxed">
              If you notice unannounced changes to the plan, please contact the provider directly.
            </p>
            <div className="mt-6 space-y-3">
              <button className="flex w-full items-center justify-between rounded-2xl bg-white p-4 text-xs font-black text-slate-900 shadow-sm border border-slate-100 hover:bg-slate-50 transition-all group">
                Provider Site
                <ChevronRight size={14} className="text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
              </button>
              <button className="flex w-full items-center justify-between rounded-2xl bg-white p-4 text-xs font-black text-slate-900 shadow-sm border border-slate-100 hover:bg-slate-50 transition-all group">
                On-chain Receipt
                <ChevronRight size={14} className="text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}
