"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SuccessScreenProps {
  transactionHash: string;
  successUrl?: string;
  planName?: string;
}

export default function SuccessScreen({
  transactionHash,
  successUrl,
  planName,
}: SuccessScreenProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!successUrl) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = successUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [successUrl]);

  const handleRedirect = () => {
    if (successUrl) {
      window.location.href = successUrl;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="text-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-blue-500" strokeWidth={2.5} />
          </div>
          <Badge variant="outline" className="bg-blue-500/5 border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1 rounded-full">
            Protocol Settled
          </Badge>
          <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter leading-none">
            Subscription <br/> Activated
          </h1>
          <p className="text-sm font-medium text-muted-foreground/80 italic">
            {planName 
              ? `You are now subscribed to the ${planName} protocol.` 
              : "Your decentralized subscription has been successfully activated on Arc Testnet."}
          </p>
        </div>

        <Card className="border-border/80 bg-muted/5 shadow-none rounded-3xl overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Transaction Identifier</span>
                <ShieldCheck size={14} className="text-primary" />
              </div>
              <div className="p-4 rounded-xl bg-background border border-border/50 font-mono text-[10px] break-all leading-relaxed text-foreground/90">
                {transactionHash}
              </div>
              <Button asChild variant="ghost" className="w-full text-primary font-black uppercase tracking-widest text-[9px] hover:bg-primary/5">
                <a 
                  href={`https://testnet.arcscan.io/tx/${transactionHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Verify on Arc Explorer
                  <ExternalLink size={12} />
                </a>
              </Button>
            </div>

            {successUrl && (
              <div className="pt-6 border-t border-border/10 space-y-4">
                <p className="text-[10px] text-center font-bold text-muted-foreground uppercase tracking-widest">
                  Automatic Handoff in <span className="text-primary tabular-nums">{countdown}s</span>
                </p>
                <Button 
                  onClick={handleRedirect} 
                  className="w-full h-12 rounded-xl bg-foreground text-background font-black uppercase tracking-widest text-[10px] group"
                >
                  Return to Merchant Portal
                  <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <footer className="text-center pt-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
            Mecha Pay Protocol Infrastructure &copy; 2026
          </p>
        </footer>
      </div>
    </div>
  );
}
