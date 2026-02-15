"use client";

import { useState } from "react";
import { useCircleSDK } from "@/context/CircleSDKContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

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

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const { isReady, getDeviceId, setLoginTokens, performLogin, loginError } =
    useCircleSDK();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Circle wallet login
  const handleCircleLogin = async () => {
    if (!isReady) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const deviceId = await getDeviceId();
      const response = await fetch("/api/create-device-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error || "Failed to create device token");
      }

      const { deviceToken, deviceEncryptionKey } = (await response.json()) as {
        deviceToken: string;
        deviceEncryptionKey: string;
      };

      setLoginTokens(deviceToken, deviceEncryptionKey);
      performLogin();
      
      // Wait for session to be established
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      console.error("[AuthModal] Circle login error:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to connect Circle wallet",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-8 m-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Login to Continue
          </h2>
          <p className="text-gray-400">
            Sign in with your Circle wallet to complete payment
          </p>
        </div>

        {/* Error message */}
        {(errorMsg || loginError) && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{errorMsg || loginError}</p>
          </div>
        )}

        {/* Circle Wallet button */}
        <button
          onClick={handleCircleLogin}
          disabled={isLoading || !isReady}
          className="w-full py-4 px-6 bg-[#676FFF] hover:bg-[#5660E8] text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GoogleIcon />
          {isLoading ? "Connecting..." : "Continue with Circle Wallet"}
        </button>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Circle wallet is required to complete payment securely
          </p>
        </div>
      </div>
    </div>
  );
}
