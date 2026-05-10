"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { cn } from "@/lib/utils";

type Status = "loading" | "setting-up" | "done" | "error";

const STEPS: { key: Status | "setting-up"; label: string; description: string }[] = [
  { key: "loading",     label: "Verifying session",     description: "Checking your account status" },
  { key: "setting-up", label: "Creating wallet",        description: "Setting up your secure wallet" },
  { key: "done",        label: "Ready",                  description: "Redirecting to dashboard" },
];

function Step({
  label,
  description,
  state,
}: {
  label: string;
  description: string;
  state: "pending" | "active" | "done";
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex-shrink-0">
        {state === "done" ? (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
            <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : state === "active" ? (
          <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
            <svg className="h-3 w-3 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : (
          <div className="h-5 w-5 rounded-full border-2 border-border bg-background" />
        )}
      </div>
      <div className={cn("flex flex-col", state === "pending" && "opacity-40")}>
        <span className={cn("text-sm font-medium", state === "active" ? "text-foreground" : "text-muted-foreground")}>
          {label}
        </span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </div>
  );
}

export default function SetupPinPage() {
  const router = useRouter();
  const { session, isReady, clearSession, executeChallenge } = useCircleSDK();

  const [status, setStatus] = useState<Status>("loading");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const initiated = useRef(false);

  const runSetup = useCallback(async () => {
    if (!session) return;
    try {
      setStatus("loading");

      const statusRes = await fetch("/api/user-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken: session.userToken }),
      });
      const statusJson = await statusRes.json();

      if (!statusRes.ok) throw new Error(statusJson.error ?? "Failed to check user status");

      if (statusJson.pinStatus === "ENABLED") {
        router.replace("/dashboard");
        return;
      }

      setStatus("setting-up");

      const pinRes = await fetch("/api/create-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken: session.userToken }),
      });
      const pinJson = await pinRes.json();

      if (!pinRes.ok) throw new Error(pinJson.error ?? "Failed to create PIN challenge");

      await executeChallenge(pinJson.challengeId);

      setStatus("done");
      router.replace("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("[setup-pin]", msg);
      setStatus("error");
      setErrorDetail(msg);
    }
  }, [session, executeChallenge, router]);

  useEffect(() => {
    if (!isReady) return;
    if (!session) { router.replace("/login"); return; }
    if (initiated.current) return;
    initiated.current = true;
    runSetup();
  }, [isReady, session, router, runSetup]);

  function getStepState(stepKey: string): "pending" | "active" | "done" {
    if (status === "error") return "pending";
    const order = ["loading", "setting-up", "done"];
    const currentIdx = order.indexOf(status);
    const stepIdx = order.indexOf(stepKey);
    if (stepIdx < currentIdx) return "done";
    if (stepIdx === currentIdx) return "active";
    return "pending";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground">Setting up your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This only takes a moment. You&apos;ll be redirected automatically.
          </p>
        </div>

        {/* Steps */}
        {status !== "error" && (
          <div className="mb-8 flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
            {STEPS.map((step) => (
              <Step
                key={step.key}
                label={step.label}
                description={step.description}
                state={getStepState(step.key)}
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-destructive">Setup failed</p>
            {errorDetail && (
              <p className="mt-1 text-xs text-muted-foreground">{errorDetail}</p>
            )}
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  initiated.current = false;
                  setStatus("loading");
                  setErrorDetail(null);
                  runSetup();
                }}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Try again
              </button>
              <button
                onClick={() => { clearSession(); router.replace("/login"); }}
                className="w-full rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Back to login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
