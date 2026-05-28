"use client";

interface TransactionStatusProps {
  status: "idle" | "approving" | "subscribing" | "success" | "error";
  error?: string | null;
  transactionHash?: string | null;
}

export default function TransactionStatus({
  status,
  error,
  transactionHash,
}: TransactionStatusProps) {
  if (status === "idle") return null;

  if (status === "error" && error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <div className="text-red-500 font-semibold mb-1">
              Transaction Failed
            </div>
            <div className="text-sm text-red-400">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success" && transactionHash) {
    return (
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <div className="text-blue-500 font-semibold mb-1">
              Payment Successful!
            </div>
            <div className="text-sm text-gray-400 font-mono break-all">
              {transactionHash}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "approving") {
    return (
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-blue-400 font-medium">
            Approving USDC spending...
          </div>
        </div>
      </div>
    );
  }

  if (status === "subscribing") {
    return (
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-blue-400 font-medium">
            Processing subscription payment...
          </div>
        </div>
      </div>
    );
  }

  return null;
}
