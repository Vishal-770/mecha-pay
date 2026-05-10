"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCircleSDK } from "@/context/CircleSDKContext";

/**
 * Google "G" SVG icon (inline, no external dependency required).
 */
function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

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
  // useSearchParams requires a Suspense boundary in the Next.js App Router.
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}

import Loader from "@/components/Loader";

function LoginSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader />
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    session,
    isReady,
    getDeviceId,
    setLoginTokens,
    performLogin,
    loginError,
  } = useCircleSDK();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extract redirect URL from query params
  const redirectTo = searchParams.get("redirect");

  // If already authenticated, go to redirect URL or default to setup-pin
  useEffect(() => {
    if (session) {
      const destination = redirectTo || "/setup-pin";
      router.replace(destination);
    }
  }, [session, router, redirectTo]);

  // Surface errors coming back from the /auth/callback or /api/oauth redirect.
  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setErrorMsg(decodeURIComponent(err));
  }, [searchParams]);

  // Surface errors from the SDK onLoginComplete callback.
  useEffect(() => {
    if (loginError) setErrorMsg(loginError);
  }, [loginError]);

  async function handleGoogleLogin() {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      // Store redirect URL in sessionStorage before OAuth flow (survives navigation)
      if (redirectTo) {
        sessionStorage.setItem("circle_auth_redirect_url", redirectTo);
      }

      // Step 1 â€“ Get the browser-unique device ID from the Circle SDK.
      const deviceId = await getDeviceId();

      // Step 2 â€“ Ask our server to create device tokens bound to this device.
      const res = await fetch("/api/create-device-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });

      if (!res.ok) {
        const { error } = (await res.json()) as { error?: string };
        throw new Error(error ?? "Failed to create device token");
      }

      const { deviceToken, deviceEncryptionKey } = (await res.json()) as {
        deviceToken: string;
        deviceEncryptionKey: string;
      };

      // Step 3 – Give the SDK the device tokens so it can complete the OAuth flow.
      setLoginTokens(deviceToken, deviceEncryptionKey);

      // Step 4 â€“ Redirect to Google OAuth.  The browser will navigate away.
      performLogin();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setErrorMsg(msg);
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 overflow-hidden">
      <BackgroundPattern />
      
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
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
            <h1 className="text-3xl font-bold text-foreground tracking-tighter">
              MECHA PAY
            </h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-foreground leading-[1.1] tracking-tight">
              The Protocol for <br />
              <span className="text-muted-foreground">Modern Payments.</span>
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
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Bank-grade encryption</p>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="flex-shrink-0 w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center transition-colors group-hover:border-primary/50">
                <svg className="w-4 h-4 text-muted-foreground transition-colors group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Sub-second confirmation</p>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="flex-shrink-0 w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center transition-colors group-hover:border-primary/50">
                <svg className="w-4 h-4 text-muted-foreground transition-colors group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Multi-chain liquidity</p>
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
              <h2 className="text-xl font-bold text-card-foreground tracking-tighter uppercase">Mecha Pay</h2>
            </div>

            <div className="space-y-6">
              <div className="text-center lg:text-left space-y-2">
                <h2 className="text-2xl font-bold text-card-foreground">Welcome back</h2>
                <p className="text-muted-foreground">
                  Sign in to access your payment dashboard
                </p>
              </div>

              {/* Error banner */}
              {errorMsg && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3.5 text-sm text-destructive flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Google login button */}
              <button
                onClick={handleGoogleLogin}
                disabled={!isReady || isLoading}
                className="group relative w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-background px-6 py-4 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-chart-2/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                {isLoading ? (
                  <svg
                    className="h-5 w-5 animate-spin text-muted-foreground"
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
                  <GoogleIcon />
                )}
                <span className="relative">
                  {isLoading ? "Redirecting to Google..." : "Continue with Google"}
                </span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-4 text-muted-foreground">
                    Secure authentication powered by Circle
                  </span>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground leading-relaxed">
                By signing in you agree to Circle&apos;s{" "}
                <a
                  href="https://www.circle.com/en/legal/user-terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline transition-colors"
                >
                  Terms of Service
                </a>
                {" "}and{" "}
                <a
                  href="https://www.circle.com/en/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline transition-colors"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
