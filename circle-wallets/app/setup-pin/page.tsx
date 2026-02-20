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

/**
 * Animated background pattern
 */
function BackgroundPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/10 rounded-full blur-3xl animate-pulse opacity-20" />
      <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-chart-2/10 rounded-full blur-3xl animate-pulse opacity-20" style={{ animationDelay: "1s" }} />
      
      {/* Large favicon watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.03]">
        <img 
          src="/favicon.ico" 
          alt="" 
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}

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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 overflow-hidden">
      <BackgroundPattern />
      
      <div className="relative z-10 w-full max-w-lg">
        <div className="rounded-3xl bg-card p-8 md:p-10 shadow-2xl shadow-primary/5 border border-border backdrop-blur-sm">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg shadow-primary/20 p-3">
              <img 
                src="/favicon.ico" 
                alt="Mecha Pay Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Icon */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            {status === "error" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-7 w-7 text-destructive"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-7 w-7 text-primary"
                fill="currentColor"
              >
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
              </svg>
            )}
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-card-foreground mb-2 text-center">
            {status === "error" ? "Setup Failed" : "Account Setup"}
          </h1>

          {/* Status message */}
          <p className="text-sm text-muted-foreground mb-8 text-center">
            {message}
          </p>

          {/* Spinner (while loading / setting-up) */}
          {(status === "loading" || status === "setting-up") && (
            <div className="flex justify-center mb-8">
              <svg
                className="h-10 w-10 animate-spin text-primary"
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
            </div>
          )}

          {/* Error details + retry */}
          {status === "error" && (
            <div className="space-y-4 mb-8">
              {errorDetail && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3.5 text-sm text-destructive flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errorDetail}</span>
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
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Retry
                </button>

                <button
                  onClick={() => {
                    clearSession();
                    router.replace("/login");
                  }}
                  className="rounded-xl border border-border bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}

          {/* Progress steps */}
          {status !== "error" && (
            <div className="space-y-4 bg-muted/30 rounded-xl p-6 border border-border/50">
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

        {/* Footer info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Secured by Circle's User-Controlled Wallets
          </p>
        </div>
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
    <div className="flex items-center gap-4">
      {done ? (
        <div className="flex items-center justify-center h-8 w-8 shrink-0 rounded-full bg-primary/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-5 w-5 text-primary"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
      ) : active ? (
        <div className="flex items-center justify-center h-8 w-8 shrink-0">
          <svg
            className="h-6 w-6 animate-spin text-primary"
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
        </div>
      ) : (
        <div className="h-8 w-8 shrink-0 rounded-full border-2 border-border bg-muted/50" />
      )}
      <span
        className={`text-sm font-medium ${
          done
            ? "text-foreground"
            : active
              ? "text-primary"
              : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
