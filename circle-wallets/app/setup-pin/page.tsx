"use client";

/**
 * /setup-pin
 *
 * Intermediate page shown after social login.
 * – If the user has NOT yet set a PIN → creates a combined PIN + wallet
 *   challenge and executes it via the Circle SDK (shows PIN / security
 *   question UI).
 * – If the user already HAS a PIN → immediately redirects to /dashboard.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCircleSDK } from "@/context/CircleSDKContext";

type Status = "loading" | "setting-up" | "done" | "error";

export default function SetupPinPage() {
  const router = useRouter();
  const { session, isReady, clearSession, executeChallenge } = useCircleSDK();

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Checking account status…");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const initiated = useRef(false);

  // ── Main flow ────────────────────────────────────────────────────────────
  const runSetup = useCallback(async () => {
    if (!session) return;

    try {
      // 1. Check current PIN status
      setStatus("loading");
      setMessage("Checking account status…");

      const statusRes = await fetch("/api/user-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken: session.userToken }),
      });
      const statusJson = await statusRes.json();

      if (!statusRes.ok) {
        throw new Error(statusJson.error ?? "Failed to check user status");
      }

      // Already initialised – skip straight to dashboard.
      if (statusJson.pinStatus === "ENABLED") {
        router.replace("/dashboard");
        return;
      }

      // 2. Create the combined PIN + wallet challenge.
      setStatus("setting-up");
      setMessage("Setting up your PIN & security questions…");

      const pinRes = await fetch("/api/create-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken: session.userToken }),
      });
      const pinJson = await pinRes.json();

      if (!pinRes.ok) {
        throw new Error(pinJson.error ?? "Failed to create PIN challenge");
      }

      // 3. Execute the challenge – Circle SDK shows the PIN UI.
      await executeChallenge(pinJson.challengeId);

      // 4. Done! Go to dashboard.
      setStatus("done");
      setMessage("All set! Redirecting to dashboard…");
      router.replace("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("[setup-pin]", msg);
      setStatus("error");
      setMessage("Something went wrong.");
      setErrorDetail(msg);
    }
  }, [session, executeChallenge, router]);

  // Kick off setup once the session is ready.
  useEffect(() => {
    if (!isReady) return;

    if (!session) {
      router.replace("/login");
      return;
    }

    if (initiated.current) return;
    initiated.current = true;
    runSetup();
  }, [isReady, session, router, runSetup]);

  // ── UI ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-8 shadow-lg ring-1 ring-zinc-200 dark:ring-zinc-800 text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
          {status === "error" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-7 w-7 text-red-500"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-7 w-7 text-indigo-600"
              fill="currentColor"
            >
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
            </svg>
          )}
        </div>

        {/* Heading */}
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          {status === "error" ? "Setup Failed" : "Account Setup"}
        </h1>

        {/* Status message */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          {message}
        </p>

        {/* Spinner (while loading / setting-up) */}
        {(status === "loading" || status === "setting-up") && (
          <svg
            className="mx-auto h-8 w-8 animate-spin text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}

        {/* Error details + retry */}
        {status === "error" && (
          <div className="space-y-4">
            {errorDetail && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800 text-left">
                {errorDetail}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  initiated.current = false;
                  setStatus("loading");
                  setErrorDetail(null);
                  runSetup();
                }}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition"
              >
                Retry
              </button>

              <button
                onClick={() => {
                  clearSession();
                  router.replace("/login");
                }}
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* Progress steps */}
        {status !== "error" && (
          <div className="mt-8 space-y-3 text-left">
            <StepIndicator
              label="Verify account"
              done={status !== "loading"}
              active={status === "loading"}
            />
            <StepIndicator
              label="Set PIN & security questions"
              done={status === "done"}
              active={status === "setting-up"}
            />
            <StepIndicator
              label="Create wallet"
              done={status === "done"}
              active={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function StepIndicator({
  label,
  done,
  active,
}: {
  label: string;
  done: boolean;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {done ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 text-emerald-500"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ) : active ? (
        <svg
          className="h-5 w-5 shrink-0 animate-spin text-indigo-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : (
        <div className="h-5 w-5 shrink-0 rounded-full border-2 border-zinc-300 dark:border-zinc-600" />
      )}
      <span
        className={`text-sm ${
          done
            ? "text-zinc-900 dark:text-zinc-100"
            : active
              ? "text-indigo-600 font-medium"
              : "text-zinc-400 dark:text-zinc-600"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
