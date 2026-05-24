"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
}: AuthModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative max-w-md w-full bg-background border border-border rounded-xl shadow-2xl p-8 m-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
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
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Login Required
          </h2>
          <p className="text-muted-foreground text-sm">
            Sign in with your secure biometric Modular Smart Account to continue.
          </p>
        </div>

        {/* Continue Button */}
        <Button
          onClick={() => router.push("/login")}
          className="w-full py-6 font-bold"
        >
          Go to Sign-In
        </Button>
      </div>
    </div>
  );
}
