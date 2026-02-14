"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loader from "@/components/Loader";
import { 
  LayoutDashboard, 
  Wallet, 
  Zap, 
  ShoppingBag, 
  FileText, 
  PlusSquare, 
  Activity, 
  ShieldAlert,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Settings
} from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { cn } from "@/lib/utils";

type TokenBalance = {
  amount: string;
  symbol: string;
  name: string;
  tokenId: string;
  isNative?: boolean;
};

type WalletInfo = {
  id: string;
  address: string;
  blockchain: string;
  tokenBalances: TokenBalance[];
};

type DashboardContextValue = {
  sessionUserToken: string;
  wallet: WalletInfo | null;
  userCircleId: string | null;
  refreshWallets: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/bridge", label: "Bridge", icon: Zap },
  { href: "/dashboard/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/dashboard/my-plans", label: "My Plans", icon: FileText },
  { href: "/dashboard/plans/create", label: "Create Plan", icon: PlusSquare },
  { href: "/dashboard/subscriptions", label: "My Subscriptions", icon: Activity },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function NavLink({ href, label, icon: Icon, onClick }: { href: string; label: string; icon: any; onClick?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all group relative border-l-4",
        active
          ? "bg-primary/10 text-primary border-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground border-transparent"
      )}
    >
      <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
      <span>{label}</span>
      {active && <ChevronRight className="ml-auto h-4 w-4" />}
    </Link>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, isReady, clearSession } = useCircleSDK();
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [userCircleId, setUserCircleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const refreshWallets = useCallback(async () => {
    if (!session?.userToken) return;

    setLoading(true);
    try {
      const [walletRes, userRes] = await Promise.all([
        fetch("/api/wallets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userToken: session.userToken }),
        }),
        fetch("/api/user-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userToken: session.userToken }),
        }),
      ]);

      const walletJson = (await walletRes.json()) as {
        wallets?: WalletInfo[];
      };
      const userJson = (await userRes.json()) as {
        id?: string;
      };

      const allWallets = walletJson.wallets ?? [];
      const arcWallet =
        allWallets.find((entry) => entry.blockchain === "ARC-TESTNET") ??
        allWallets[0] ??
        null;
      setWallet(arcWallet);
      setUserCircleId(userJson.id ?? null);
    } finally {
      setLoading(false);
    }
  }, [session?.userToken]);

  useEffect(() => {
    if (!isReady) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    void refreshWallets();
  }, [isReady, session, router, refreshWallets]);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const value = useMemo<DashboardContextValue | null>(() => {
    if (!session?.userToken) return null;
    return {
      sessionUserToken: session.userToken,
      wallet,
      userCircleId,
      refreshWallets,
    };
  }, [session?.userToken, wallet, userCircleId, refreshWallets]);

  if (!isReady || !session || loading || !value) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
        <Loader />
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-black uppercase italic animate-pulse">Initializing Protocol...</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">Mecha Pay Command Center</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={value}>
      <div className="flex min-h-screen bg-background font-mulish">
        
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Mecha Pay" className="h-6 w-6 shadow-sm" />
            <span className="font-black uppercase italic text-sm">Mecha Pay</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-muted"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:block overflow-y-auto no-scrollbar",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center gap-2 mb-10 px-2 mt-4 lg:mt-0">
              <img src="/logo.png" alt="Mecha Pay" className="h-8 w-8" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground leading-none">Mecha Pay</span>
                <span className="text-base font-black italic uppercase tracking-tighter">Command</span>
              </div>
            </div>

            <nav className="flex flex-col gap-1 flex-1">
              <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Navigation</p>
              {navItems.map((item) => (
                <NavLink 
                  key={item.href} 
                  href={item.href} 
                  label={item.label} 
                  icon={item.icon} 
                  onClick={() => setIsSidebarOpen(false)}
                />
              ))}
            </nav>

            <div className="mt-auto space-y-4 pt-6 border-t border-border">
              {wallet && (
                <div className="p-4 bg-muted/50 rounded-2xl border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ARC Testnet</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-xs font-mono font-bold truncate text-sky-600">{wallet.address}</p>
                </div>
              )}
              
             
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Desktop Top Bar */}
          <header className="hidden lg:flex h-20 items-center justify-between px-10 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-20">
            <h2 className="text-xl font-black uppercase italic tracking-tighter">
              {navItems.find(item => item.href === pathname || (item.href !== "/dashboard" && pathname.startsWith(item.href)))?.label || "Overview"}
            </h2>
            
            <div className="flex items-center gap-4">
              {wallet && (
                <div className="flex flex-col items-end px-4 py-2 bg-muted/30 rounded-xl border border-border">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Active Wallet</span>
                  <span className="text-xs font-mono font-bold text-foreground">{wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}</span>
                </div>
              )}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  clearSession();
                  router.push("/login");
                }}
                className="h-10 w-10 rounded-xl hover:bg-red-500/5 hover:text-red-500 transition-all"
              >
                <LogOut size={18} strokeWidth={3} />
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 lg:p-10 animate-in fade-in duration-700 mt-16 lg:mt-0 overflow-y-auto">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboardContext must be used inside DashboardShell");
  }
  return ctx;
}
