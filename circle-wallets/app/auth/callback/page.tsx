"use client";

/**
 * /auth/callback
 *
 * The Circle W3SSdk processes the Google OAuth result on this page.
 * This page is the destination of the /api/oauth redirect (which preserves
 * all query parameters that Google sent).
 *
 * On mount the SDK detects the OAuth authorisation code in the URL and calls
 * onLoginComplete (defined in CircleSDKContext) with the final session tokens.
 * We then redirect the user to /dashboard.
 *
 * No user-visible UI is needed here – just a loading spinner while the SDK
 * does its work.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCircleSDK } from "@/context/CircleSDKContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { session, isReady, loginError } = useCircleSDK();
  const [statusMsg] = useState("Completing sign-in…");
  const redirected = useRef(false);

  // Once the SDK has set the session (via onLoginComplete), go to dashboard.
  useEffect(() => {
    if (!isReady || redirected.current) return;

    if (session) {
      redirected.current = true;
      
      // Check for stored redirect URL from login flow
      const redirectUrl = sessionStorage.getItem("circle_auth_redirect_url");
      if (redirectUrl) {
        sessionStorage.removeItem("circle_auth_redirect_url"); // Clean up
        router.replace(redirectUrl);
      } else {
        router.replace("/setup-pin");
      }
      return;
    }
  }, [session, isReady, router]);

  // If the SDK fires an error, go back to login with the message.
  useEffect(() => {
    if (!loginError || redirected.current) return;
    redirected.current = true;
    router.replace(`/login?error=${encodeURIComponent(loginError)}`);
  }, [loginError, router]);

  // Safety timeout – if nothing happens in 15 s, bail out.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (redirected.current) return;
      redirected.current = true;
      router.replace("/login?error=Login+timed+out.+Please+try+again.");
    }, 15_000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950">
      <svg
        className="h-10 w-10 animate-spin text-indigo-600"
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
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{statusMsg}</p>
    </div>
  );
}
