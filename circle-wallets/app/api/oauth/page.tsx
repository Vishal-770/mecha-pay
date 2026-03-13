"use client";

/**
 * /api/oauth  (client page – NOT a Route Handler)
 *
 * This is the registered Google OAuth redirect URI.
 * Google redirects here after the user authenticates, appending the
 * id_token and access_token as URL **hash fragments**:
 *
 *   https://yourdomain.com/api/oauth#id_token=...&state=...&token_type=Bearer
 *
 * Hash fragments are never sent to the server, so this MUST be a client-side
 * page. The Circle W3SSdk (initialised by CircleSDKProvider in layout.tsx)
 * automatically detects the hash and calls onLoginComplete with the final
 * session tokens on mount via its execSocialLoginStatusCheck() routine.
 *
 * On success  → redirected to /dashboard.
 * On error    → redirected to /login?error=<message>.
 * On timeout  → redirected to /login?error=Login+timed+out.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCircleSDK } from "@/context/CircleSDKContext";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { session, isReady, loginError } = useCircleSDK();
  const [statusMsg] = useState("Completing sign-in…");
  const redirected = useRef(false);

  // Once the SDK has set the session (via onLoginComplete), go to dashboard.
  useEffect(() => {
    if (!isReady || redirected.current) return;
    if (session) {
      redirected.current = true;
      router.replace("/setup-pin");
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
