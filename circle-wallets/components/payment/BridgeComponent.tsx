"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Wallet, CheckCircle2, ArrowDownUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface BridgeComponentProps {
  circleWalletAddress?: string;
  onBridgeComplete?: () => void;
  hideCard?: boolean; // New prop to hide the Card wrapper for sheet/modal use
}

export default function BridgeComponent({
  circleWalletAddress,
  onBridgeComplete,
  hideCard = false,
}: BridgeComponentProps) {
  const { login, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [privyAddress, setPrivyAddress] = useState<string | null>(null);

  useEffect(() => {
    if (authenticated && wallets.length > 0) {
      setPrivyAddress(wallets[0].address);
    }
  }, [authenticated, wallets]);

  const handleConnectPrivy = async () => {
    try {
      await login();
    } catch (err) {
      console.error("Failed to connect Privy:", err);
    }
  };

  const Content = (
    <div className="space-y-6">
      {!authenticated ? (
        <div className="space-y-4">
          <Alert className="border-border/50 bg-muted/20">
            <div className="flex items-start gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                <span className="font-black">1</span>
              </div>
              <AlertDescription>
                <div className="font-black uppercase tracking-widest text-[10px] mb-1">Connect Your EOA Wallet</div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Connect your MetaMask or other EOA wallet that has USDC on another chain.
                </p>
              </AlertDescription>
            </div>
          </Alert>

          <Button onClick={handleConnectPrivy} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px]" size="lg">
            <Wallet className="size-4 mr-2" />
            Connect EOA Wallet
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <Alert className="border-emerald-500/20 bg-emerald-500/5">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <AlertDescription>
              <div className="font-black uppercase tracking-widest text-[10px] text-emerald-500">EOA Wallet Connected</div>
              <div className="text-muted-foreground font-mono text-[10px] mt-1 break-all">{privyAddress}</div>
            </AlertDescription>
          </Alert>

          {circleWalletAddress && (
            <div className="p-4 rounded-xl bg-muted/20 border border-border/80">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Bridge destination:</div>
              <div className="text-foreground font-mono text-xs break-all leading-relaxed">
                {circleWalletAddress}
              </div>
              <Badge variant="secondary" className="mt-3 bg-primary/5 text-primary border-primary/10 text-[9px] font-black uppercase tracking-widest py-0.5">
                Arc Testnet Wallet
              </Badge>
            </div>
          )}

          <div className="space-y-4">
            <Alert className="border-border/50 bg-muted/20">
              <div className="flex items-start gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                  <span className="font-black">2</span>
                </div>
                <AlertDescription className="flex-1">
                  <div className="font-black uppercase tracking-widest text-[10px] mb-2 leading-tight">Use Full Bridge Dashboard</div>
                  <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
                    Access our full bridge interface for cross-chain USDC (CCTP) transfers.
                  </p>
                  <Button asChild size="sm" className="bg-foreground text-background font-black uppercase tracking-widest text-[9px] h-8 rounded-lg">
                    <a href="/dashboard/bridge" target="_blank" rel="noopener noreferrer">
                      Open Controller
                      <ExternalLink className="size-3.5 ml-1.5" />
                    </a>
                  </Button>
                </AlertDescription>
              </div>
            </Alert>

            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">— Or Manual Transfer —</span>
            </div>

            <div className="p-4 rounded-xl bg-muted/10 border border-border/50">
              <ol className="space-y-3">
                {[
                  "Send USDC from EOA to the address above.",
                  "Wait for transaction confirmation.",
                  "Refresh your balance completion."
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[10px] font-black text-muted-foreground/50 mt-0.5">{i+1}.</span>
                    <span className="text-xs text-foreground font-medium">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {onBridgeComplete && (
            <Button onClick={onBridgeComplete} className="w-full h-12 rounded-xl border border-border hover:bg-muted transition-all font-black uppercase tracking-[0.2em] text-[10px]" variant="outline" size="lg">
              Refresh Payload
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (hideCard) return Content;

  return (
    <Card className="w-full bg-background border-border/80 shadow-none rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-border/10 pb-6">
        <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
          <ArrowDownUp className="size-4 text-primary" />
          Bridge Controller
        </CardTitle>
        <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/90">
          Sync USDC from external chains
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8 bg-muted/5">
        {Content}
      </CardContent>
    </Card>
  );
}
