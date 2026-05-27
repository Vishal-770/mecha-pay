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
  Settings,
  Terminal,
  BookOpen,
  Webhook,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { cn } from "@/lib/utils";
import { createPublicClient, http, formatUnits } from "viem";
import { SUPPORTED_CHAINS } from "@/lib/bridge_config";

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
  accountType?: string;
  tokenBalances: TokenBalance[];
};

type DashboardContextValue = {
  sessionUserToken: string;
  wallet: WalletInfo | null;
  allWallets: WalletInfo[];
  userCircleId: string | null;
  refreshWallets: () => Promise<void>;
  selectWallet: (walletId: string) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

const navGroups = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
      { href: "/dashboard/marketplace", label: "Marketplace", icon: ShoppingBag },
    ],
  },
  {
    label: "Subscriptions",
    items: [
      { href: "/dashboard/my-plans", label: "My Plans", icon: FileText },
      { href: "/dashboard/plans/create", label: "Create Plan", icon: PlusSquare },
      { href: "/dashboard/subscriptions", label: "My Subscriptions", icon: Activity },
      { href: "/dashboard/autopay", label: "Auto-Pay", icon: RefreshCw },
    ],
  },
  {
    label: "Transfers",
    items: [
      { href: "/dashboard/smart-bridge", label: "Smart Transfer", icon: Zap },
      { href: "/dashboard/bridge", label: "Bridge", icon: RefreshCw },
    ],
  },
  {
    label: "Developer",
    items: [
      { href: "/dashboard/developer", label: "API Keys", icon: Terminal },
      { href: "/dashboard/webhooks", label: "Webhooks", icon: Webhook },
      { href: "/docs", label: "Docs", icon: BookOpen },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

// Flat list for header label lookup
const navItems = navGroups.flatMap(g => g.items);

const erc20Abi = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
] as const;

function NavLink({ href, label, icon: Icon, onClick }: { href: string; label: string; icon: LucideIcon; onClick?: () => void }) {
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

import { useQuery } from "@tanstack/react-query";

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, isReady, clearSession } = useCircleSDK();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState<string>("Arc_Testnet");

  const fetchBalances = useCallback(async (selectedChainId: string, address: string) => {
    const balancePromises = SUPPORTED_CHAINS.map(async (chain) => {
      // Only fetch selected chain or Arc Testnet to keep it extremely fast
      if (chain.identifier !== selectedChainId && chain.identifier !== "Arc_Testnet") {
        return { identifier: chain.identifier, balances: [] };
      }

      try {
        const publicClient = createPublicClient({
          chain: chain.viemChain,
          transport: http(chain.viemChain.rpcUrls.default.http[0]),
        });

        if (chain.identifier === "Arc_Testnet") {
          // Native USDC on Arc
          const balance = await publicClient.getBalance({ address: address as `0x${string}` });
          return {
            identifier: chain.identifier,
            balances: [
              {
                amount: formatUnits(balance, 18),
                symbol: "USDC",
                name: "USD Coin",
                tokenId: "native-usdc",
                isNative: true,
              },
            ],
          };
        } else {
          // Other EVM chain: fetch native + USDC
          const [nativeBalance, usdcBalance] = await Promise.all([
            publicClient.getBalance({ address: address as `0x${string}` }),
            chain.usdcAddress
              ? publicClient.readContract({
                  address: chain.usdcAddress as `0x${string}`,
                  abi: erc20Abi,
                  functionName: "balanceOf",
                  args: [address as `0x${string}`],
                }).catch(() => 0n)
              : Promise.resolve(0n),
          ]);

          const balances: TokenBalance[] = [
            {
              amount: formatUnits(nativeBalance, 18),
              symbol: chain.nativeSymbol,
              name: chain.nativeSymbol,
              tokenId: "native",
              isNative: true,
            },
          ];

          if (chain.usdcAddress) {
            balances.unshift({
              amount: formatUnits(usdcBalance as bigint, chain.decimals),
              symbol: "USDC",
              name: "USD Coin",
              tokenId: chain.usdcAddress,
              isNative: false,
            });
          }

          return { identifier: chain.identifier, balances };
        }
      } catch (err) {
        console.error(`Failed to fetch balance for chain ${chain.name}:`, err);
        return { identifier: chain.identifier, balances: [] };
      }
    });

    const results = await Promise.all(balancePromises);
    const newBalancesMap: Record<string, TokenBalance[]> = {};
    results.forEach((r) => {
      newBalancesMap[r.identifier] = r.balances;
    });
    return newBalancesMap;
  }, []);

  // Use TanStack Query to auto-poll balances in the background
  const { data: balancesMap = {}, isLoading: queryLoading, refetch: refetchBalancesMap } = useQuery<Record<string, TokenBalance[]>>({
    queryKey: ["walletBalances", session?.walletAddress, selectedChain],
    queryFn: () => fetchBalances(selectedChain, session!.walletAddress),
    enabled: isReady && !!session?.walletAddress,
    refetchInterval: 3000, // Poll every 3 seconds
    refetchOnWindowFocus: true,
  });

  const allWallets = useMemo(() => {
    if (!session?.walletAddress) return [];
    return SUPPORTED_CHAINS.map((chain) => {
      const blockchainStr = chain.identifier === "Arc_Testnet" ? "ARC-TESTNET" : chain.identifier.replace("_", "-").toUpperCase();
      return {
        id: chain.identifier,
        address: session.walletAddress,
        blockchain: blockchainStr,
        accountType: "SCA",
        tokenBalances: balancesMap[chain.identifier] || [],
      };
    });
  }, [session?.walletAddress, balancesMap]);

  const wallet = useMemo(() => {
    return allWallets.find((w) => w.id === selectedChain) || allWallets[0] || null;
  }, [allWallets, selectedChain]);

  const userCircleId = session?.username || null;
  const sessionUserToken = session?.username || "";

  const refreshWallets = useCallback(async () => {
    await refetchBalancesMap();
  }, [refetchBalancesMap]);

  const selectWallet = useCallback((walletId: string) => {
    setSelectedChain(walletId);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!session) {
      router.replace("/login");
    }
  }, [isReady, session, router]);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const value = useMemo<DashboardContextValue | null>(() => {
    if (!session?.walletAddress) return null;
    return {
      sessionUserToken,
      wallet,
      allWallets,
      userCircleId,
      refreshWallets,
      selectWallet,
    };
  }, [session?.walletAddress, sessionUserToken, wallet, allWallets, userCircleId, refreshWallets, selectWallet]);

  const loading = !isReady || (queryLoading && !wallet);

  if (!isReady || !session || loading || !value) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-3">
        <Loader />
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-semibold text-foreground">Loading your wallet…</p>
          <p className="text-xs text-muted-foreground">Connecting to the network</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={value}>
      <div className="flex bg-background font-mulish">
        
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
            "fixed inset-y-0 left-0 z-[60] w-72 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:block overflow-y-auto no-scrollbar shadow-2xl lg:shadow-none",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Mobile Close Button - Only visible when open on mobile */}
          <div className="lg:hidden absolute top-5 right-5">
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-xl bg-muted/50 text-foreground hover:bg-muted transition-all border border-border"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col h-full p-6">
            <div className="flex items-center gap-2 mb-10 px-2 mt-4 lg:mt-0">
              <img src="/logo.png" alt="Mecha Pay" className="h-8 w-8" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground leading-none">Mecha Pay</span>
                <span className="text-base font-black italic uppercase tracking-tighter">Command</span>
              </div>
            </div>

            <nav className="flex flex-col gap-4 flex-1 overflow-y-auto no-scrollbar">
              {navGroups.map((group) => (
                <div key={group.label}>
                  <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1">{group.label}</p>
                  {group.items.map((item) => (
                    <NavLink 
                      key={item.href} 
                      href={item.href} 
                      label={item.label} 
                      icon={item.icon} 
                      onClick={() => setIsSidebarOpen(false)}
                    />
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden animate-in fade-in duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Desktop Top Bar */}
          <header className="hidden lg:flex h-16 items-center justify-between px-8 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-20">
            <h2 className="text-base font-semibold text-foreground">
              {navItems.find(item => item.href === pathname || (item.href !== "/dashboard" && pathname.startsWith(item.href)))?.label || "Overview"}
            </h2>
            
            <div className="flex items-center gap-3">
              {wallet && (
                <a
                  href={`https://testnet.arcscan.app/address/${wallet.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors"
                >
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-xs font-mono text-muted-foreground">{wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}</span>
                  <ExternalLink size={11} className="text-muted-foreground/40" />
                </a>
              )}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  clearSession();
                  router.push("/login");
                }}
                className="h-9 w-9 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all"
                title="Sign out"
              >
                <LogOut size={16} />
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 lg:p-10 duration-700 mt-16 lg:mt-0 overflow-y-auto">
            {children}
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
