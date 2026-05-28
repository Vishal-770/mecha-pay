"use client";

import { formatUnits } from "ethers";

interface PlanDetailsProps {
  plan: {
    price: string;
    duration: string;
    metadata: {
      name?: string;
      brand?: {
        name?: string;
        website?: string;
      };
      features?: Array<{
        title: string;
        description: string;
      }>;
    } | null;
  };
  isLoading?: boolean;
}

export default function PlanDetails({ plan, isLoading }: PlanDetailsProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  const priceInUSDC = formatUnits(plan.price, 6);
  const durationInDays = Math.floor(Number(plan.duration) / 86400);

  return (
    <div className="bg-gray-800/50 rounded-lg p-6">
      {/* Plan header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          {plan.metadata?.name || "Subscription Plan"}
        </h3>
        {plan.metadata?.brand && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>by</span>
            {plan.metadata.brand.website ? (
              <a
                href={plan.metadata.brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#676FFF] hover:text-[#5660E8] font-medium"
              >
                {plan.metadata.brand.name}
              </a>
            ) : (
              <span className="font-medium">{plan.metadata.brand.name}</span>
            )}
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="mb-6 pb-6 border-b border-gray-700">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">{priceInUSDC}</span>
          <span className="text-lg text-gray-400">USDC</span>
        </div>
        <div className="text-sm text-gray-400 mt-1">
          per {durationInDays} {durationInDays === 1 ? "day" : "days"}
        </div>
      </div>

      {/* Features */}
      {plan.metadata?.features && plan.metadata.features.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            What&apos;s included
          </h4>
          <ul className="space-y-3">
            {plan.metadata.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div>
                  <div className="text-white font-medium">{feature.title}</div>
                  {feature.description && (
                    <div className="text-sm text-gray-400 mt-1">
                      {feature.description}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
