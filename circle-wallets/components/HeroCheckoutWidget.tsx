"use client";

import { useState, useEffect } from "react";
import { Check, Wallet, Sparkles, Loader2 } from "lucide-react";

type CheckoutStep = "connecting" | "bridging" | "authorizing" | "success";

export default function HeroCheckoutWidget() {
  const [step, setStep] = useState<CheckoutStep>("connecting");
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (step === "success") return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 4000);
    return () => clearInterval(interval);
  }, [step]);

  // Automatic simulation runner loops automatically
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (step === "connecting") {
      timer = setTimeout(() => setStep("bridging"), 2000);
    } else if (step === "bridging") {
      timer = setTimeout(() => setStep("authorizing"), 2500);
    } else if (step === "authorizing") {
      timer = setTimeout(() => setStep("success"), 2200);
    } else if (step === "success") {
      timer = setTimeout(() => setStep("connecting"), 6000);
    }

    return () => clearTimeout(timer);
  }, [step]);

  return (
    <div className="w-full max-w-md bg-card/45 backdrop-blur-xl border border-border/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500 hover:border-primary/20 hover:shadow-primary/5">
      
      {/* Absolute top glowing line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-primary/30 to-transparent" />
      
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-border/30 pb-5 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground leading-tight">Mecha Pay</h3>
            <span className="text-[10px] text-muted-foreground font-semibold tracking-wide uppercase">Checkout Widget</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[9px] font-bold text-primary tracking-wide uppercase">Arc Testnet</span>
        </div>
      </div>

      {/* Subscription Summary Card */}
      <div className="bg-card/40 border border-border/20 rounded-2xl p-4 mb-5 flex justify-between items-center">
        <div>
          <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">Subscription Plan</span>
          <h4 className="text-base font-bold text-foreground mt-0.5">Developer Pro</h4>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">Price</span>
          <div className="text-lg font-extrabold text-foreground mt-0.5">
            29.00 <span className="text-xs font-semibold text-primary">USDC</span>
            <span className="text-xs text-muted-foreground font-medium">/mo</span>
          </div>
        </div>
      </div>

      {/* Simulation Steps (Connecting, Bridging, Authorizing) */}
      {step !== "success" && (
        <div className="flex flex-col gap-5 py-2">
          
          {/* Step 1: Connect Wallet */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                step === "connecting"
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-primary/20 border-primary text-primary"
              }`}>
                {step !== "connecting" ? <Check className="w-3.5 h-3.5" /> : <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              </div>
              <span className={`text-xs font-semibold ${step === "connecting" ? "text-foreground" : "text-muted-foreground"}`}>
                Initialize Smart Account via Circle SDK
              </span>
            </div>
            {step === "connecting" && (
              <span className="text-[10px] text-primary font-mono tracking-widest uppercase animate-pulse">Connecting</span>
            )}
          </div>

          {/* Step 2: CCTP Bridge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                step === "connecting"
                  ? "border-border/40 text-muted-foreground"
                  : step === "bridging"
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-primary/20 border-primary text-primary"
              }`}>
                {step === "connecting" ? "2" : step === "bridging" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              </div>
              <span className={`text-xs font-semibold ${step === "bridging" ? "text-foreground" : "text-muted-foreground"}`}>
                Bridge USDC using Circle CCTP
              </span>
            </div>
            {step === "bridging" && (
              <span className="text-[10px] text-primary font-mono tracking-widest uppercase animate-pulse">Bridging</span>
            )}
          </div>

          {/* Step 3: Authorize Auto-Pay */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                step === "connecting" || step === "bridging"
                  ? "border-border/40 text-muted-foreground"
                  : "bg-primary/10 border-primary text-primary"
              }`}>
                {step !== "authorizing" ? "3" : <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              </div>
              <span className={`text-xs font-semibold ${step === "authorizing" ? "text-foreground" : "text-muted-foreground"}`}>
                Authorize Gasless Auto-Pay on Arc
              </span>
            </div>
            {step === "authorizing" && (
              <span className="text-[10px] text-primary font-mono tracking-widest uppercase animate-pulse">Approving</span>
            )}
          </div>

          {/* Wallet Balance Overlay */}
          <div className="border border-border/30 rounded-2xl bg-card/10 p-3 mt-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground font-mono">circle-wallet-0x...</span>
            </div>
            <span className="text-[11px] text-foreground font-bold font-mono">
              {step === "connecting" ? "100.00 USDC" : "71.00 USDC"}
            </span>
          </div>

        </div>
      )}

      {/* Success state */}
      {step === "success" && (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/5 animate-bounce">
            <Check className="w-7 h-7 text-emerald-400 stroke-[3px]" />
          </div>
          
          <h4 className="text-lg font-bold text-foreground">Subscription Successful!</h4>
          <p className="text-xs text-muted-foreground max-w-xs mt-1.5 leading-relaxed">
            Your recurring subscription is active. Gasless monthly payments are securely authorized in USDC on the Arc network.
          </p>

          <div className="bg-card/25 border border-border/20 rounded-2xl p-3 w-full mt-5 flex items-center justify-between text-left">
            <div>
              <span className="text-[9px] text-muted-foreground font-bold uppercase block">Transaction Hash</span>
              <span className="text-[10px] text-foreground font-mono font-medium block">0x4a9d...2f8c</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-muted-foreground font-bold uppercase block">Gas Fee</span>
              <span className="text-[10px] text-emerald-400 font-bold block">0.00 USDC (Sponsored)</span>
            </div>
          </div>

          <button
            onClick={() => setStep("connecting")}
            className="w-full h-10 border border-border/50 bg-card/20 text-foreground font-semibold text-xs rounded-full flex items-center justify-center gap-1.5 hover:bg-muted/30 transition-colors mt-5"
          >
            <span>Restart Simulation</span>
          </button>
        </div>
      )}

    </div>
  );
}
