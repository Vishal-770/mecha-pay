"use client";

interface PaymentButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  planPrice: string;
}

export default function PaymentButton({
  onClick,
  disabled,
  isLoading,
  planPrice,
}: PaymentButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full py-4 px-6 bg-[#676FFF] hover:bg-[#5660E8] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Processing...
        </>
      ) : (
        <>
          Subscribe Now
          {planPrice && (
            <span className="opacity-80">• {planPrice} USDC</span>
          )}
        </>
      )}
    </button>
  );
}
