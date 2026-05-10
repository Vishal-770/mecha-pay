"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { useCircleSDK } from "@/context/CircleSDKContext";

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
  tokenIds?: string[];
  networkFee?: string;
  firstConfirmDate?: string;
  createDate?: string;
  txHash?: string;
};

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
  const { wallet, sessionUserToken, refreshWallets } = useDashboardContext();
  const { executeChallenge } = useCircleSDK();

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

  const usdcToken = useMemo(() => {
    if (!wallet?.tokenBalances) return undefined;
    
    // 1. Try exact match
    let token = wallet.tokenBalances.find((t) => t.symbol.toUpperCase() === "USDC");
    if (token) return token;

    // 2. Try fuzzy match (USDC.e, USD Coin, etc)
    token = wallet.tokenBalances.find((t) => 
      t.symbol.toUpperCase().includes("USDC") || 
      t.name.toUpperCase().includes("USD COIN")
    );
    if (token) return token;

    // 3. If on Arc, the native token IS USDC
    if (wallet.blockchain === "ARC-TESTNET") {
      token = wallet.tokenBalances.find(t => t.isNative);
      if (token) return token;
    }

    return undefined;
  }, [wallet?.tokenBalances, wallet?.blockchain]);

  const nativeToken = useMemo(
    () =>
      wallet?.tokenBalances.find(
        (t) => t.isNative || t.symbol.toUpperCase() === "ARC" || t.symbol.toUpperCase() === "ETH" || t.symbol.toUpperCase() === "MATIC"
      ),
    [wallet?.tokenBalances],
  );

  const usdcBalance = useMemo(() => {
    if (!usdcToken) return 0;
    return parseFloat(usdcToken.amount) || 0;
  }, [usdcToken]);

  const maxSendable = useMemo(() => Math.max(usdcBalance - 1, 0), [usdcBalance]);

  // ── Load transactions
  const loadTransactions = useCallback(async () => {
    if (!wallet?.id || !sessionUserToken) return;
    setTxLoading(true);
    setTxError(null);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken: sessionUserToken, walletIds: [wallet.id] }),
      });
      const json = (await res.json()) as { transactions?: Transaction[]; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to load transactions");
      setTransactions(json.transactions ?? []);
    } catch (err) {
      setTxError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setTxLoading(false);
    }
  }, [wallet?.id, sessionUserToken]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  // ── Refresh everything
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshWallets(), loadTransactions()]);
    setRefreshing(false);
  };

  const handleCopy = async () => {
    if (!wallet?.address) return;
    const address = wallet.address;

    try {
      // Modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      // Fallback for older browsers or non-secure contexts
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
    if (!wallet?.id || !usdcToken?.tokenId || !recipient || !amount) {
      setSendError("Fill in all fields first");
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setSendError("Enter a valid amount");
      return;
    }
    if (numAmount > maxSendable) {
      setSendError(`Maximum sendable is ${maxSendable.toFixed(6)} USDC (keeping 1 USDC for gas)`);
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
      const res = await fetch("/api/send-usdc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userToken: sessionUserToken,
          walletId: wallet.id,
          tokenId: usdcToken.tokenId,
          destinationAddress: recipient,
          amount: numAmount.toFixed(6),
        }),
      });
      const json = (await res.json()) as { challengeId?: string; error?: string };
      if (!res.ok || !json.challengeId) throw new Error(json.error ?? "Transfer failed");

      await executeChallenge(json.challengeId);
      setSendSuccess(`Sent ${numAmount.toFixed(6)} USDC to ${truncateAddress(recipient)}`);
      setRecipient("");
      setAmount("");
      await Promise.all([refreshWallets(), loadTransactions()]);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header + Refresh */}
      <div className="rounded-3xl border border-border bg-gradient-to-br from-card to-muted p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
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
              text-sm font-medium text-card-foreground shadow-sm transition hover:bg-accent
              disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            >
              <path
                fillRule="evenodd"
                d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z"
                clipRule="evenodd"
              />
            </svg>
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Address card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Wallet Address
        </p>
        <div className="mt-3 flex items-center gap-3">
          <code className="flex-1 break-all rounded-xl bg-muted px-4 py-3 font-mono text-sm text-foreground">
            {wallet?.address ?? "No wallet connected"}
          </code>
          <button
            onClick={() => void handleCopy()}
            disabled={!wallet?.address}
            title="Copy address"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border
              bg-card text-muted-foreground transition hover:bg-accent hover:text-accent-foreground disabled:opacity-40"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-primary">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
                <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
              </svg>
            )}
          </button>
        </div>
        {copied && <p className="mt-2 text-xs text-primary">Address copied!</p>}
      </div>

      {/* Balances */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-chart-2 p-6 text-primary-foreground shadow-lg">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-primary-foreground/5" />
          <div className="absolute -bottom-8 -right-2 h-24 w-24 rounded-full bg-primary-foreground/5" />
          <p className="text-xs font-medium uppercase tracking-widest opacity-90">USDC Balance</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{usdcBalance.toFixed(2)}</p>
          <p className="mt-1 text-sm opacity-80">USDC · ARC Testnet</p>
          {maxSendable > 0 && (
            <p className="mt-3 text-xs opacity-70">Max sendable: {maxSendable.toFixed(6)} USDC</p>
          )}
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary to-muted p-6 text-secondary-foreground shadow-lg">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-foreground/5" />
          <div className="absolute -bottom-8 -right-2 h-24 w-24 rounded-full bg-foreground/5" />
          <p className="text-xs font-medium uppercase tracking-widest opacity-90">Native Balance</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">
            {nativeToken ? parseFloat(nativeToken.amount).toFixed(4) : "0.0000"}
          </p>
          <p className="mt-1 text-sm opacity-80">{nativeToken?.symbol ?? "ARC"} · Gas Token</p>
          <p className="mt-3 text-xs opacity-70">Used for transaction fees</p>
        </div>
      </div>

      {/* Send USDC */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-base font-semibold text-card-foreground">Send USDC</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Transfer USDC to any address on ARC Testnet. 1 USDC is reserved for gas.
        </p>
        <div className="mt-5 space-y-4">
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
              className="mt-1.5 w-full rounded-xl border border-border bg-muted px-4 py-3
                font-mono text-sm text-foreground placeholder:text-muted-foreground
                focus:border-ring focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-xs font-medium text-muted-foreground">
              Amount (USDC)
            </label>
            <div className="relative mt-1.5">
              <input
                id="amount"
                type="number"
                min="0.000001"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted px-4 py-3 pr-20
                  text-sm text-foreground placeholder:text-muted-foreground
                  focus:border-ring focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
              <button
                type="button"
                onClick={() => setAmount(maxSendable.toFixed(6))}
                disabled={maxSendable <= 0}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-primary/10 px-2.5 py-1
                  text-xs font-semibold text-primary transition hover:bg-primary/20
                  disabled:cursor-not-allowed disabled:opacity-40"
              >
                MAX
              </button>
            </div>
            {maxSendable > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                Available: {usdcBalance.toFixed(6)} USDC &nbsp;·&nbsp; Max: {maxSendable.toFixed(6)} USDC
              </p>
            )}
          </div>

          {sendError && (
            <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {sendError}
            </p>
          )}
          {sendSuccess && (
            <p className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-sm text-primary">
              ✓ {sendSuccess}
            </p>
          )}

          <button
            onClick={() => void handleSend()}
            disabled={sending || !wallet || !usdcToken || maxSendable <= 0}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow
              transition hover:bg-primary/90 active:bg-primary/80
              disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            {sending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing…
              </span>
            ) : (
              "Send USDC"
            )}
          </button>
        </div>
      </div>

      {/* ── Transactions ── */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-card-foreground">Transactions</h3>
            <p className="text-xs text-muted-foreground">Recent activity on this wallet</p>
          </div>
          <button
            onClick={() => void loadTransactions()}
            disabled={txLoading}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5
              text-xs font-medium text-muted-foreground transition hover:bg-accent disabled:opacity-50"
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

        <div className="mt-4">
          {txError && (
            <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {txError}
            </p>
          )}

          {txLoading && !transactions.length ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No transactions found for this wallet.
            </p>
          ) : (
            <div className="overflow-x-auto">
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
                  {transactions.map((tx) => {
                    const isOut = tx.transactionType?.toUpperCase() === "OUTBOUND";
                    // amounts is string[] from Circle API
                    const rawAmt = tx.amounts?.[0];
                    const amountStr =
                      rawAmt != null && rawAmt !== ""
                        ? `${parseFloat(rawAmt).toFixed(4)} USDC`
                        : "—";
                    // For contract interactions (subscriptions, approvals) destinationAddress
                    // may be absent — fall back to contractAddress
                    const counterpart = isOut
                      ? (tx.destinationAddress ?? tx.contractAddress)
                      : tx.sourceAddress;

                    return (
                      <tr key={tx.id} className="hover:bg-accent/50">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                isOut
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {isOut ? "↑" : "↓"}
                            </span>
                            <span className="font-medium text-foreground capitalize">
                              {tx.transactionType?.toLowerCase() ?? "tx"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 font-semibold text-foreground">{amountStr}</td>
                        <td className="py-3 pr-4 hidden sm:table-cell font-mono text-xs text-muted-foreground">
                          {counterpart ? truncateAddress(counterpart) : "—"}
                        </td>
                        <td className="py-3 pr-4">
                          <TxBadge state={tx.state} />
                        </td>
                        <td className="py-3 hidden md:table-cell text-xs text-muted-foreground">
                          {formatDate(tx.firstConfirmDate ?? tx.createDate ?? "")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* All token balances */}
      {(wallet?.tokenBalances?.length ?? 0) > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-card-foreground">All Tokens</h3>
          <div className="mt-3 divide-y divide-border">
            {wallet!.tokenBalances.map((token) => (
              <div key={token.symbol} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {token.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{token.symbol}</p>
                    <p className="text-xs text-muted-foreground">{token.name}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">
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
    </section>
  );
}
