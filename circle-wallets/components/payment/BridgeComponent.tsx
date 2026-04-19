"use client";

import BridgeUSDC from "@/components/BridgeUSDC";

interface BridgeComponentProps {
  circleWalletAddress?: string;
  onBridgeComplete?: () => void;
  hideCard?: boolean;
}

export default function BridgeComponent({
  circleWalletAddress: _circleWalletAddress,
  onBridgeComplete: _onBridgeComplete,
  hideCard = false,
}: BridgeComponentProps) {
  return <BridgeUSDC isCompact={hideCard} />;
}
