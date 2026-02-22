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

  // If already authenticated, go straight to dashboard.
  useEffect(() => {
    if (session) {
      router.replace("/setup-pin");
    }
  }, [session, router]);

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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 p-8 shadow-lg ring-1 ring-zinc-200 dark:ring-zinc-800">
        {/* Logo / heading */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-6 w-6 text-white"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.86 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Mecha Pay
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Payment Protocol
          </p>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800">
            {errorMsg}
          </div>
        )}

        {/* Google login button */}
        <button
          onClick={handleGoogleLogin}
          disabled={!isReady || isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-200 shadow-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <svg
              className="h-5 w-5 animate-spin text-zinc-500"
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
          ) : (
            <GoogleIcon />
          )}
          {isLoading ? "Redirecting to Googleâ€¦" : "Continue with Google"}
        </button>

        <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
          By signing in you agree to Circle&apos;s{" "}
          <a
            href="https://www.circle.com/en/legal/user-terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-zinc-600 dark:hover:text-zinc-400"
          >
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
}
