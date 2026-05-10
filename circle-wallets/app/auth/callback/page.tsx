"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCircleSDK } from "@/context/CircleSDKContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { session, isReady, loginError } = useCircleSDK();
  const redirected = useRef(false);

  useEffect(() => {
    if (!isReady || redirected.current) return;
    if (session) {
      redirected.current = true;
      const redirectUrl = sessionStorage.getItem("circle_auth_redirect_url");
      if (redirectUrl) {
        sessionStorage.removeItem("circle_auth_redirect_url");
        router.replace(redirectUrl);
      } else {
        router.replace("/setup-pin");
      }
    }
  }, [session, isReady, router]);

  useEffect(() => {
    if (!loginError || redirected.current) return;
    redirected.current = true;
    router.replace(`/login?error=${encodeURIComponent(loginError)}`);
  }, [loginError, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (redirected.current) return;
      redirected.current = true;
      router.replace("/login?error=Login+timed+out.+Please+try+again.");
    }, 15_000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-5 text-center">
        <svg
          className="h-8 w-8 animate-spin text-primary"
          xmlns="http://www.w3.org/2000/svg"
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
        <div>
          <p className="text-sm font-medium text-foreground">Completing sign-in</p>
          <p className="mt-1 text-xs text-muted-foreground">Please wait a moment…</p>
        </div>
      </div>
    </div>
  );
}
