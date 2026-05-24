"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { KeyRound, Wallet, Loader2, ShieldAlert } from "lucide-react";

/**
 * Minimalist professional background with grid and subtle gradient
 */
function BackgroundPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      {/* Subtle Depth Gradients */}
      <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] opacity-50" />
      <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-chart-2/5 rounded-full blur-[120px] opacity-30" />
      
      {/* Stationery Watermark (Static) */}
      <div className="absolute top-12 left-12 w-32 h-32 opacity-[0.02] grayscale contrast-200">
        <img 
          src="/favicon.ico" 
          alt="" 
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm font-semibold uppercase italic tracking-wider text-muted-foreground animate-pulse">
          Loading Wallet Matrix...
        </span>
      </div>
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    session,
    isReady,
    registerPasskey,
    loginWithPasskey,
  } = useCircleSDK();

  const [usernameInput, setUsernameInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<"register" | "login" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extract redirect URL from query params
  const redirectTo = searchParams.get("redirect");

  // If already authenticated, go to redirect URL or default to dashboard
  useEffect(() => {
    if (session) {
      const destination = redirectTo || "/dashboard";
      router.replace(destination);
    }
  }, [session, router, redirectTo]);

  // Pre-fill username from local storage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("circle_username");
      if (stored) {
        setUsernameInput(stored);
      }
    }
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setErrorMsg("Please enter a username.");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    setActiveAction("register");

    try {
      await registerPasskey(usernameInput);
      router.replace(redirectTo || "/dashboard");
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("already")) {
        setErrorMsg("Username taken on this device. Try unlocking instead.");
      } else {
        setErrorMsg(msg || "Failed to register passkey. Try again.");
      }
      setIsLoading(false);
      setActiveAction(null);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setErrorMsg("Please enter a username.");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    setActiveAction("login");

    try {
      await loginWithPasskey(usernameInput);
      router.replace(redirectTo || "/dashboard");
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || "Biometrics unlock failed. Make sure your passkey is registered.");
      setIsLoading(false);
      setActiveAction(null);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 overflow-hidden">
      <BackgroundPattern />
      
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center font-mulish">
        {/* Left side - Branding */}
        <div className="hidden lg:block space-y-10 px-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-foreground/5 border border-border p-2">
              <img 
                src="/favicon.ico" 
                alt="Mecha Pay Logo" 
                className="w-full h-full object-contain grayscale"
              />
            </div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">
              MECHA PAY
            </h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-5xl font-black uppercase italic text-foreground leading-[1.1] tracking-tight">
              The Protocol for <br />
              <span className="text-muted-foreground not-italic font-bold">Modern Payments.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              An engineering-grade infrastructure for USDC-native memberships, powered by Circle and the Arc blockchain.
            </p>
          </div>

          <div className="space-y-6 pt-8 border-t border-border/50 max-w-sm">
            <div className="flex items-center gap-4 group">
              <div className="flex-shrink-0 w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center transition-colors group-hover:border-primary/50">
                <svg className="w-4 h-4 text-muted-foreground transition-colors group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Bank-grade passkeys</p>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="flex-shrink-0 w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center transition-colors group-hover:border-primary/50">
                <svg className="w-4 h-4 text-muted-foreground transition-colors group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Gas-sponsored execution</p>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="flex-shrink-0 w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center transition-colors group-hover:border-primary/50">
                <svg className="w-4 h-4 text-muted-foreground transition-colors group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Unified multi-chain balance</p>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border p-8 md:p-12 backdrop-blur-md">
            {/* Mobile logo */}
            <div className="lg:hidden mb-10 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-foreground/5 border border-border mb-4 p-2">
                <img 
                  src="/favicon.ico" 
                  alt="Mecha Pay Logo" 
                  className="w-full h-full object-contain grayscale"
                />
              </div>
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-card-foreground">MECHA PAY</h2>
            </div>

            <div className="space-y-6">
              <div className="text-center lg:text-left space-y-2">
                <h2 className="text-2xl font-bold text-card-foreground">Secure Access</h2>
                <p className="text-muted-foreground text-sm">
                  Register or unlock your smart account with biometric passkeys
                </p>
              </div>

              {/* Error banner */}
              {errorMsg && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3.5 text-xs text-destructive flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">{errorMsg}</span>
                </div>
              )}

              {/* Username Input */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="e.g. alice, merchant.mecha"
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  disabled={isLoading}
                  autoComplete="username"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                {/* Unlock Account (Login) */}
                <button
                  onClick={handleLogin}
                  disabled={!isReady || isLoading || !usernameInput.trim()}
                  className="group relative w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-background px-6 py-4 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading && activeAction === "login" ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span>Unlock Smart Account</span>
                </button>

                <div className="relative my-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                    <span className="bg-card px-3 text-muted-foreground">New Device?</span>
                  </div>
                </div>

                {/* Create Account (Register) */}
                <button
                  onClick={handleRegister}
                  disabled={!isReady || isLoading || !usernameInput.trim()}
                  className="w-full flex items-center justify-center gap-3 rounded-xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-200 hover:bg-primary/95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading && activeAction === "register" ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" />
                  ) : (
                    <KeyRound className="h-5 w-5 text-primary-foreground" />
                  )}
                  <span>Register Device Passkey</span>
                </button>
              </div>

              <div className="relative pt-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.15em]">
                  <span className="bg-card px-4 text-muted-foreground/60">
                    Sponsorized & Secured by Circle MSCA
                  </span>
                </div>
              </div>

              <p className="text-center text-[10px] text-muted-foreground leading-relaxed">
                By entering and unlocking you agree to Mecha Pay&apos;s{" "}
                <a
                  href="https://www.circle.com/en/legal/user-terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-primary hover:underline transition-colors"
                >
                  User Terms
                </a>
                {" "}and{" "}
                <a
                  href="https://www.circle.com/en/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-primary hover:underline transition-colors"
                >
                  Privacy Rules
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
