"use client";

import BridgeUSDC from "@/components/BridgeUSDC";

export default function BridgePage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bridge Assets</h1>
        <p className="text-muted-foreground">
          Move your USDC across 15+ testnet chains instantly using Circle CCTP.
        </p>
      </div>
      <div className="w-full">
        <BridgeUSDC />
      </div>
    </div>
  );
}
