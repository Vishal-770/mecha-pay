"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCircleSDK } from "@/context/CircleSDKContext";
import Loader from "@/components/Loader";

export default function SetupPinPage() {
  const router = useRouter();
  const { session, isReady } = useCircleSDK();

  useEffect(() => {
    if (!isReady) return;
    if (!session) {
      router.replace("/login");
    } else {
      router.replace("/dashboard");
    }
  }, [isReady, session, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
      <Loader />
      <div className="flex flex-col items-center gap-2 animate-pulse">
        <p className="text-sm font-black uppercase italic">Establishing Biometric Session...</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">Resolving Circle Modular Account</p>
      </div>
    </div>
  );
}
