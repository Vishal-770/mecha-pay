"use client";

import { formatUnits } from "ethers";

interface WalletBalanceProps {
  balance: string; // in wei (6 decimals for USDC)
  isLoading?: boolean;
}

export default function WalletBalance({
  balance,
  isLoading,
}: WalletBalanceProps) {
  const balanceInUSDC = formatUnits(balance, 6);
  const balanceNum = parseFloat(balanceInUSDC);

  if (isLoading) {
    return (
      <div className="bg-gray-800/30 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
        <div className="h-6 bg-gray-700 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/30 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-400 mb-1">Your Balance</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {balanceNum.toFixed(2)}
            </span>
            <span className="text-gray-400">USDC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
