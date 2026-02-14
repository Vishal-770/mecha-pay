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
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : upper === "FAILED" || upper === "CANCELLED"
        ? "bg-rose-50 text-rose-700 border-rose-100"
        : "bg-amber-50 text-amber-700 border-amber-100";
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

  const usdcToken = useMemo(
    () => wallet?.tokenBalances.find((t) => t.symbol.toUpperCase() === "USDC"),
    [wallet?.tokenBalances],
  );

  const nativeToken = useMemo(
    () =>
      wallet?.tokenBalances.find(
        (t) => t.isNative || t.symbol.toUpperCase() === "ARC",
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
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
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
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Mecha Pay · ARC Testnet
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">My Wallet</h2>
          </div>
          <button
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2
              text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50
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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Wallet Address
        </p>
        <div className="mt-3 flex items-center gap-3">
          <code className="flex-1 break-all rounded-xl bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800">
            {wallet?.address ?? "No wallet connected"}
          </code>
          <button
            onClick={() => void handleCopy()}
            disabled={!wallet?.address}
            title="Copy address"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200
              bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-500">
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
        {copied && <p className="mt-2 text-xs text-emerald-600">Address copied!</p>}
      </div>

      {/* Balances */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-900 to-indigo-900 p-6 text-white shadow-lg">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -right-2 h-24 w-24 rounded-full bg-white/5" />
          <p className="text-xs font-medium uppercase tracking-widest text-sky-200">USDC Balance</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{usdcBalance.toFixed(2)}</p>
          <p className="mt-1 text-sm text-sky-300">USDC · ARC Testnet</p>
          {maxSendable > 0 && (
            <p className="mt-3 text-xs text-sky-300/70">Max sendable: {maxSendable.toFixed(6)} USDC</p>
          )}
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white shadow-lg">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -right-2 h-24 w-24 rounded-full bg-white/5" />
          <p className="text-xs font-medium uppercase tracking-widest text-slate-300">Native Balance</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">
            {nativeToken ? parseFloat(nativeToken.amount).toFixed(4) : "0.0000"}
          </p>
          <p className="mt-1 text-sm text-slate-400">{nativeToken?.symbol ?? "ARC"} · Gas Token</p>
          <p className="mt-3 text-xs text-slate-500/70">Used for transaction fees</p>
        </div>
      </div>

      {/* Send USDC */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Send USDC</h3>
        <p className="mt-0.5 text-xs text-slate-400">
          Transfer USDC to any address on ARC Testnet. 1 USDC is reserved for gas.
        </p>
        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="recipient" className="block text-xs font-medium text-slate-500">
              Recipient Address
            </label>
            <input
              id="recipient"
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3
                font-mono text-sm text-slate-800 placeholder:text-slate-400
                focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-xs font-medium text-slate-500">
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-20
                  text-sm text-slate-800 placeholder:text-slate-400
                  focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
              <button
                type="button"
                onClick={() => setAmount(maxSendable.toFixed(6))}
                disabled={maxSendable <= 0}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-sky-50 px-2.5 py-1
                  text-xs font-semibold text-sky-700 transition hover:bg-sky-100
                  disabled:cursor-not-allowed disabled:opacity-40"
              >
                MAX
              </button>
            </div>
            {maxSendable > 0 && (
              <p className="mt-1 text-xs text-slate-400">
                Available: {usdcBalance.toFixed(6)} USDC &nbsp;·&nbsp; Max: {maxSendable.toFixed(6)} USDC
              </p>
            )}
          </div>

          {sendError && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
              {sendError}
            </p>
          )}
          {sendSuccess && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
              ✓ {sendSuccess}
            </p>
          )}

          <button
            onClick={() => void handleSend()}
            disabled={sending || !wallet || !usdcToken || maxSendable <= 0}
            className="w-full rounded-xl bg-sky-900 py-3 text-sm font-semibold text-white shadow
              transition hover:bg-sky-800 active:bg-sky-950
              disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Transactions</h3>
            <p className="text-xs text-slate-400">Recent activity on this wallet</p>
          </div>
          <button
            onClick={() => void loadTransactions()}
            disabled={txLoading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5
              text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
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
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
              {txError}
            </p>
          )}

          {txLoading && !transactions.length ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-slate-50 animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No transactions found for this wallet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4">Amount</th>
                    <th className="pb-2 pr-4 hidden sm:table-cell">To / From</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
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
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                isOut
                                  ? "bg-rose-50 text-rose-600"
                                  : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              {isOut ? "↑" : "↓"}
                            </span>
                            <span className="font-medium text-slate-700 capitalize">
                              {tx.transactionType?.toLowerCase() ?? "tx"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 font-semibold text-slate-900">{amountStr}</td>
                        <td className="py-3 pr-4 hidden sm:table-cell font-mono text-xs text-slate-500">
                          {counterpart ? truncateAddress(counterpart) : "—"}
                        </td>
                        <td className="py-3 pr-4">
                          <TxBadge state={tx.state} />
                        </td>
                        <td className="py-3 hidden md:table-cell text-xs text-slate-400">
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
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">All Tokens</h3>
          <div className="mt-3 divide-y divide-slate-100">
            {wallet!.tokenBalances.map((token) => (
              <div key={token.symbol} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {token.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{token.symbol}</p>
                    <p className="text-xs text-slate-400">{token.name}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-900">
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
