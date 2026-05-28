"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { encodeFunctionData, formatUnits, parseUnits } from "viem";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft,
  ExternalLink, 
  Activity, 
  RefreshCw,
  Copy,
  Check,
  ArrowRight
} from "lucide-react";

function truncateAddress(addr: string) {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

type Transaction = {
  id: string;
  state: string;
  transactionType: string;
  sourceAddress?: string;
  destinationAddress?: string;
  contractAddress?: string;
  amounts?: string[];
  tokenSymbol?: string;
  sourceType?: "normal" | "token" | "internal";
  tokenIds?: string[];
  networkFee?: string;
  firstConfirmDate?: string;
  createDate?: string;
  txHash?: string;
};

type ArcScanTx = {
  hash?: string;
  blockNumber?: string;
  nonce?: string;
  from?: string;
  to?: string;
  value?: string;
  timeStamp?: string;
  isError?: string;
  tokenDecimal?: string;
  tokenSymbol?: string;
  contractAddress?: string;
};

function normalizeAmount(value: string, decimals = 6) {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return "0.000000";
  return num.toFixed(decimals);
}

const ARC_SCAN_API = "https://testnet.arcscan.app/api";
const ARC_TX_PAGE_SIZE = 10;

function TxBadge({ state }: { state: string }) {
  const upper = state.toUpperCase();
  const classes =
    upper === "COMPLETE" || upper === "CONFIRMED"
      ? "bg-primary/10 text-primary border-primary/20"
      : upper === "FAILED" || upper === "CANCELLED"
        ? "bg-destructive/10 text-destructive border-destructive/20"
        : "bg-chart-4/10 text-chart-4 border-chart-4/20";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${classes}`}>
      {state}
    </span>
  );
}

export default function WalletPage() {
  const { wallet, refreshWallets } = useDashboardContext();
  const { executeTransaction, walletAddress: scaAddress } = useCircleSDK();

  // ── Send form state
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  // ── Copy state
  const [copied, setCopied] = useState(false);

  // ── Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [txHasMore, setTxHasMore] = useState(false);

  const tokenBalances = wallet?.tokenBalances ?? [];

  // 1) Exact match, 2) fuzzy match, 3) Arc native
  let usdcToken = tokenBalances.find((t) => t.symbol.toUpperCase() === "USDC");
  if (!usdcToken) {
    usdcToken = tokenBalances.find(
      (t) => t.symbol.toUpperCase().includes("USDC") || t.name.toUpperCase().includes("USD COIN")
    );
  }
  if (!usdcToken && wallet?.blockchain === "ARC-TESTNET") {
    usdcToken = tokenBalances.find((t) => t.isNative);
  }

  const nativeToken = tokenBalances.find(
    (t) => t.isNative || t.symbol.toUpperCase() === "ARC" || t.symbol.toUpperCase() === "ETH" || t.symbol.toUpperCase() === "MATIC"
  );

  const usdcBalance = usdcToken ? parseFloat(usdcToken.amount) || 0 : 0;
  const maxSendable = useMemo(() => usdcBalance, [usdcBalance]);
  const txAddress = scaAddress ?? wallet?.address;

  const mapArcTx = useCallback(
    (tx: ArcScanTx): Transaction => {
      const from = (tx.from ?? "").toLowerCase();
      const self = txAddress?.toLowerCase() ?? "";
      const isOut = self && from === self;

      const value = tx.value ? formatUnits(BigInt(tx.value), 18) : "0";
      const valueNorm = normalizeAmount(value, 6);
      const timestampMs = tx.timeStamp ? Number(tx.timeStamp) * 1000 : Date.now();
      const iso = new Date(timestampMs).toISOString();

      return {
        id: tx.hash ?? `${tx.blockNumber}-${tx.nonce}`,
        state: tx.isError === "1" ? "FAILED" : "CONFIRMED",
        transactionType: isOut ? "OUTBOUND" : "INBOUND",
        sourceAddress: tx.from,
        destinationAddress: tx.to,
        amounts: [valueNorm],
        tokenSymbol: "USDC",
        sourceType: "normal",
        createDate: iso,
        firstConfirmDate: iso,
        txHash: tx.hash,
      };
    },
    [txAddress]
  );

  const mapArcTokenTx = useCallback(
    (tx: ArcScanTx): Transaction => {
      const from = (tx.from ?? "").toLowerCase();
      const self = txAddress?.toLowerCase() ?? "";
      const isOut = self && from === self;

      const decimals = tx.tokenDecimal ? Number(tx.tokenDecimal) : 18;
      const value = tx.value ? formatUnits(BigInt(tx.value), decimals) : "0";
      const valueNorm = normalizeAmount(value, Math.min(decimals, 6));
      const timestampMs = tx.timeStamp ? Number(tx.timeStamp) * 1000 : Date.now();
      const iso = new Date(timestampMs).toISOString();

      return {
        id: tx.hash ?? `${tx.blockNumber}-${tx.nonce}`,
        state: tx.isError === "1" ? "FAILED" : "CONFIRMED",
        transactionType: isOut ? "OUTBOUND" : "INBOUND",
        sourceAddress: tx.from,
        destinationAddress: tx.to,
        contractAddress: tx.contractAddress,
        amounts: [valueNorm],
        tokenSymbol: tx.tokenSymbol ?? "TOKEN",
        sourceType: "token",
        createDate: iso,
        firstConfirmDate: iso,
        txHash: tx.hash,
      };
    },
    [txAddress]
  );

  const dedupeTransactions = useCallback((list: Transaction[]) => {
    const map = new Map<string, Transaction>();
    for (const tx of list) {
      const key = [
        (tx.txHash ?? tx.id).toLowerCase(),
        (tx.sourceAddress ?? "").toLowerCase(),
        (tx.destinationAddress ?? "").toLowerCase(),
        normalizeAmount(tx.amounts?.[0] ?? "0", 6),
        (tx.tokenSymbol ?? "").toLowerCase(),
        tx.transactionType?.toLowerCase() ?? "",
      ].join("|");

      if (!map.has(key)) {
        map.set(key, tx);
        continue;
      }

      const existing = map.get(key)!;
      const rank = (t?: Transaction) =>
        t?.sourceType === "token" ? 3 : t?.sourceType === "normal" ? 2 : 1;

      if (rank(tx) > rank(existing)) {
        map.set(key, tx);
      }
    }
    return Array.from(map.values());
  }, []);

  const sortTransactions = useCallback((list: Transaction[]) => {
    const unique = dedupeTransactions(list);
    return unique.sort((a, b) => {
      const aTime = new Date(a.firstConfirmDate ?? a.createDate ?? 0).getTime();
      const bTime = new Date(b.firstConfirmDate ?? b.createDate ?? 0).getTime();
      return bTime - aTime;
    });
  }, [dedupeTransactions]);

  const fetchArcTransactions = useCallback(
    async (page: number, append: boolean) => {
      if (!txAddress) return;

      await Promise.resolve();
      setTxLoading(true);
      setTxError(null);

      try {
        const buildUrl = (action: string) => {
          const url = new URL(ARC_SCAN_API);
          url.searchParams.set("module", "account");
          url.searchParams.set("action", action);
          url.searchParams.set("address", txAddress);
          url.searchParams.set("page", String(page));
          url.searchParams.set("offset", String(ARC_TX_PAGE_SIZE));
          url.searchParams.set("sort", "desc");
          return url.toString();
        };

        const [normalRes, tokenRes] = await Promise.all([
          fetch(buildUrl("txlist")),
          fetch(buildUrl("tokentx")),
        ]);

        if (!normalRes.ok || !tokenRes.ok) {
          throw new Error("ArcScan API error while fetching transactions");
        }

        const [normalData, tokenData] = await Promise.all([
          normalRes.json(),
          tokenRes.json(),
        ]);

        const normalList = Array.isArray(normalData?.result) ? normalData.result : [];
        const tokenList = Array.isArray(tokenData?.result) ? tokenData.result : [];

        const mapped = [
          ...normalList.map(mapArcTx),
          ...tokenList.map(mapArcTokenTx),
        ];

        setTransactions((prev) => {
          const base = append ? prev : [];
          return sortTransactions([...base, ...mapped]);
        });

        setTxPage(page);
        setTxHasMore(
          normalList.length === ARC_TX_PAGE_SIZE ||
          tokenList.length === ARC_TX_PAGE_SIZE
        );
      } catch (err) {
        setTxError(err instanceof Error ? err.message : "Unknown error");
        if (!append) setTransactions([]);
      } finally {
        setTxLoading(false);
      }
    },
    [mapArcTokenTx, mapArcTx, sortTransactions, txAddress]
  );

  const loadTransactions = useCallback(() => {
    void fetchArcTransactions(1, false);
  }, [fetchArcTransactions]);

  const loadMoreTransactions = useCallback(() => {
    void fetchArcTransactions(txPage + 1, true);
  }, [fetchArcTransactions, txPage]);

  useEffect(() => {
    const id = setTimeout(() => {
      void loadTransactions();
    }, 0);
    return () => clearTimeout(id);
  }, [loadTransactions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshWallets(), Promise.resolve(loadTransactions())]);
    setRefreshing(false);
  };

  const handleCopy = async () => {
    if (!wallet?.address) return;
    const address = wallet.address;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      const textArea = document.createElement("textarea");
      textArea.value = address;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleSend = async () => {
    if (!wallet?.address || !wallet?.id || !usdcToken || !recipient || !amount) {
      setSendError("Fill in all fields first");
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setSendError("Enter a valid amount");
      return;
    }
    if (numAmount > maxSendable) {
      setSendError(`Maximum sendable is ${maxSendable.toFixed(6)} USDC`);
      return;
    }
    if (!/^0x[0-9a-fA-F]{40}$/.test(recipient)) {
      setSendError("Invalid destination address");
      return;
    }

    setSendError(null);
    setSendSuccess(null);
    setSending(true);

    try {
      let calls: { to: `0x${string}`; data: `0x${string}`; value?: bigint }[] = [];

      if (wallet.id === "Arc_Testnet") {
        calls = [
          {
            to: recipient as `0x${string}`,
            data: "0x" as `0x${string}`,
            value: parseUnits(amount, 18),
          },
        ];
      } else {
        const erc20Abi = [
          {
            constant: false,
            inputs: [
              { name: "_to", type: "address" },
              { name: "_value", type: "uint256" },
            ],
            name: "transfer",
            outputs: [{ name: "", type: "bool" }],
            type: "function",
          },
        ] as const;

        calls = [
          {
            to: usdcToken.tokenId as `0x${string}`,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "transfer",
              args: [recipient as `0x${string}`, parseUnits(amount, 6)],
            }),
            value: 0n,
          },
        ];
      }

      const result = await executeTransaction(calls, true, wallet.id);

      setSendSuccess(`Sent ${numAmount.toFixed(6)} USDC to ${truncateAddress(recipient)} (Tx: ${result.txHash.slice(0, 10)}...)`);
      setRecipient("");
      setAmount("");

      await Promise.all([refreshWallets(), Promise.resolve(loadTransactions())]);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="space-y-10 text-foreground bg-background font-mulish pb-20">
      
      {/* ── HEADER SECTION (Flat, Borderless) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Mecha Pay · ARC Testnet
          </p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">My Wallet</h2>
        </div>
        
        <button
          onClick={() => void handleRefresh()}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2
            text-sm font-medium text-foreground transition hover:bg-muted shadow-sm
            disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Refreshing…" : "Refresh"}</span>
        </button>
      </div>

      {/* ── ADDRESS SECTION (Open, Cardless) ── */}
      <div className="pb-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Wallet Address
          </p>
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <div 
              onClick={() => void handleCopy()}
              className="inline-flex items-center gap-2.5 px-3 py-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors cursor-pointer text-xs"
            >
              <Wallet size={13} className="text-muted-foreground" />
              <code className="font-mono text-foreground text-xs select-all">
                {wallet?.address ?? "No wallet connected"}
              </code>
              <span className="text-muted-foreground hover:text-foreground ml-1">
                {copied ? <Check size={12} className="text-primary stroke-[2.5px]" /> : <Copy size={12} />}
              </span>
            </div>
            {copied && <p className="text-xs text-primary font-medium">Address copied!</p>}
          </div>
        </div>
      </div>

      {/* ── BALANCES SECTION (Spacious Stats Row, Cardless) ── */}
      <div className="grid gap-12 sm:grid-cols-2 pb-10 border-b border-border">
        {/* USDC Balance block */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">USDC Balance</p>
          <p className="text-4xl font-bold tracking-tight text-foreground">{usdcBalance.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">USDC · ARC Testnet</p>
          {maxSendable > 0 && (
            <p className="text-xs text-muted-foreground pt-1">Max sendable: {maxSendable.toFixed(6)} USDC</p>
          )}
        </div>
        
        {/* Native Balance block */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Native Balance</p>
          <p className="text-4xl font-bold tracking-tight text-foreground">
            {nativeToken ? parseFloat(nativeToken.amount).toFixed(4) : "0.0000"}
          </p>
          <p className="text-xs text-muted-foreground">{nativeToken?.symbol ?? "ARC"} · Gas Token</p>
          <p className="text-xs text-muted-foreground pt-1">Used for transaction fees</p>
        </div>
      </div>

      {/* ── WORKSPACE SPLIT (Left: Transactions List, Right: Send USDC & Token Allocations) ── */}
      <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr]">
        
        {/* ── LEFT COLUMN: TRANSACTIONS TIMELINE (Open & borderless) ── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h3 className="text-base font-semibold text-foreground">Transactions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Recent activity on this wallet</p>
            </div>
            
            <button
              onClick={() => void loadTransactions()}
              disabled={txLoading}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5
                text-xs font-medium text-muted-foreground transition hover:bg-muted disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className={`h-3.5 w-3.5 ${txLoading ? "animate-spin" : ""}`}
              >
                <path
                  fillRule="evenodd"
                  d="M13.836 2.477a.75.75 0 0 1 .75.75v3.182a.75.75 0 0 1-.75.75h-3.182a.75.75 0 0 1 0-1.5h1.37l-.84-.841a4.5 4.5 0 0 0-7.08.932.75.75 0 0 1-1.3-.75 6 6 0 0 1 9.44-1.242l.842.84V3.227a.75.75 0 0 1 .75-.75Zm-.911 7.5A.75.75 0 0 1 13.199 11a6 6 0 0 1-9.44 1.241l-.84-.84v1.371a.75.75 0 0 1-1.5 0V9.591a.75.75 0 0 1 .75-.75H5.35a.75.75 0 0 1 0 1.5H3.98l.841.841a4.5 4.5 0 0 0 7.08-.932.75.75 0 0 1 1.025-.273Z"
                  clipRule="evenodd"
                />
              </svg>
              {txLoading ? "Loading…" : "Reload"}
            </button>
          </div>

          <div>
            {txError && (
              <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                {txError}
              </p>
            )}

            {txLoading && !transactions.length ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
                No transactions found for this wallet.
              </p>
            ) : (
              <div>
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="pb-2 pr-4">Type</th>
                      <th className="pb-2 pr-4">Amount</th>
                      <th className="pb-2 pr-4 hidden sm:table-cell">To / From</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2 hidden md:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map((tx, idx) => {
                      const isOut = tx.transactionType?.toUpperCase() === "OUTBOUND";
                      const rawAmt = tx.amounts?.[0];
                      const symbol = tx.tokenSymbol ?? "USDC";
                      const amountStr =
                        rawAmt != null && rawAmt !== ""
                          ? `${parseFloat(rawAmt).toFixed(4)} ${symbol}`
                          : "—";
                      const counterpart = isOut
                        ? (tx.destinationAddress ?? tx.contractAddress)
                        : tx.sourceAddress;

                      const rowKey = [
                        tx.id,
                        tx.txHash,
                        tx.sourceAddress,
                        tx.destinationAddress,
                        tx.amounts?.[0],
                        tx.tokenSymbol,
                        tx.transactionType,
                        tx.sourceType,
                        idx,
                      ]
                        .filter(Boolean)
                        .join("|");

                      return (
                        <tr key={rowKey} className="hover:bg-muted/30">
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                                  isOut
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-primary/10 text-primary"
                                }`}
                              >
                                {isOut ? "↑" : "↓"}
                              </span>
                              <span className="font-medium text-foreground">
                                {isOut ? "Sent" : "Received"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 pr-4 font-semibold text-foreground">{amountStr}</td>
                          <td className="py-3.5 pr-4 hidden sm:table-cell font-mono text-xs text-muted-foreground">
                            {counterpart ? truncateAddress(counterpart) : "—"}
                          </td>
                          <td className="py-3.5 pr-4">
                            <TxBadge state={tx.state} />
                          </td>
                          <td className="py-3.5 hidden md:table-cell text-xs text-muted-foreground">
                            {formatDate(tx.firstConfirmDate ?? tx.createDate ?? "")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {txHasMore && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => void loadMoreTransactions()}
                      disabled={txLoading}
                      className="rounded-lg border border-border bg-muted px-4 py-2 text-xs font-medium text-muted-foreground transition hover:bg-border disabled:opacity-50"
                    >
                      {txLoading ? "Loading…" : "Load more"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: ACTIONS (Open & Borderless) ── */}
        <div className="space-y-12">
          
          {/* Send USDC Form (Cardless, sits directly on background) */}
          <div className="space-y-6">
            <div className="pb-4 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Send USDC</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Send USDC to any wallet address. Gas fees are covered.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="recipient" className="block text-xs font-medium text-muted-foreground">
                  Recipient Address
                </label>
                <input
                  id="recipient"
                  type="text"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2
                    font-mono text-xs text-foreground placeholder:text-muted-foreground/40
                    focus:border-primary focus:outline-none focus:ring-0 transition-colors"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <label htmlFor="amount" className="block text-xs font-medium text-muted-foreground">
                    Amount (USDC)
                  </label>
                  <button
                    type="button"
                    onClick={() => setAmount(maxSendable.toFixed(6))}
                    disabled={maxSendable <= 0}
                    className="text-[10px] font-bold uppercase text-primary hover:text-foreground transition-colors disabled:opacity-40"
                  >
                    Use Max
                  </button>
                </div>
                <input
                  id="amount"
                  type="number"
                  min="0.000001"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2
                    font-mono text-xs text-foreground placeholder:text-muted-foreground/40
                    focus:border-primary focus:outline-none focus:ring-0 transition-colors"
                />
                {maxSendable > 0 && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Available: {usdcBalance.toFixed(6)} USDC &nbsp;·&nbsp; Max: {maxSendable.toFixed(6)} USDC
                  </p>
                )}
              </div>

              {sendError && (
                <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {sendError}
                </p>
              )}
              {sendSuccess && (
                <p className="rounded-lg border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-xs text-sky-400">
                  {sendSuccess}
                </p>
              )}

              <button
                onClick={() => void handleSend()}
                disabled={sending || !wallet || !usdcToken || maxSendable <= 0}
                className="flex w-full items-center justify-center h-9 rounded-lg bg-foreground hover:opacity-90 text-background font-semibold text-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Processing…</span>
                  </span>
                ) : (
                  "Send USDC"
                )}
              </button>
            </div>
          </div>

          {/* All Tokens Section (Open and borderless) */}
          {tokenBalances.length > 0 && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-border">
                <h3 className="text-base font-semibold text-foreground">All Tokens</h3>
              </div>
              <div className="divide-y divide-border">
                {tokenBalances.map((token) => (
                  <div key={token.tokenId || `${token.symbol}-${token.name}`} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground font-sans">
                        {token.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{token.symbol}</p>
                        <p className="text-xs text-muted-foreground">{token.name}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-foreground font-mono select-all">
                      {parseFloat(token.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
        
      </div>
      
    </section>
  );
}
