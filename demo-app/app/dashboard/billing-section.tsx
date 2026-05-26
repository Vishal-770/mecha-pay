"use client";

import { MechaProvider, MechaPricingTable } from "mechapay-react";

const PLAN_ID = process.env.NEXT_PUBLIC_MECHA_PLAN_ID || "";
const API_KEY = process.env.NEXT_PUBLIC_MECHA_API_KEY || "";

export function BillingSection({ userId }: { userId: string }) {
  type PlanLike = { name?: string };

  const cleanAppearance = {
    theme: "dark" as const,
    variables: {
      colorPrimary: "var(--primary)",
      borderRadius: "var(--radius)",
      cardPadding: "28px",
      gap: "24px",
      backgroundColor: "var(--card)",
      textColor: "var(--card-foreground)"
    }
  };

  const customRenderHeader = (plan: PlanLike) => (
    <div className="text-center mb-10">
      <h2 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
        {plan.name && !plan.name.startsWith("0x") ? plan.name : "Protocol Subscriptions"}
      </h2>
      <p className="text-sm text-muted-foreground mt-2.5 max-w-sm mx-auto">
        Select a membership plan below to configure your secure contract access.
      </p>
    </div>
  );

  return (
    <MechaProvider apiKey={API_KEY}>
      <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <MechaPricingTable
          planId={PLAN_ID}
          userId={userId}
          recommendedTierId="1"
          appearance={cleanAppearance}
          classNames={{
            card: "bg-muted/20 backdrop-blur-sm rounded-2xl p-8 hover:bg-muted/30 transition-all",
            button: "bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md py-3 cursor-pointer",
            tierLabel: "text-foreground font-black tracking-tight",
            priceAmount: "text-foreground font-extrabold tracking-tight",
            priceMuted: "text-muted-foreground font-medium",
            featureTitle: "text-foreground font-bold",
            featureDescription: "text-muted-foreground font-medium",
          }}
          customLabels={{
            activeSubscription: "Subscribed Member",
            upgrade: "Upgrade Tier",
            downgrade: "Downgrade Tier",
            getTier: "Join {{tierLabel}}",
            selectPlanDescription: "Select an active plan to register your subscription details."
          }}
          renderHeader={customRenderHeader}
        />
      </div>
    </MechaProvider>
  );
}
