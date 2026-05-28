"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { useDashboardContext } from "../_components/DashboardShell";
import { cn } from "@/lib/utils";
import { Moon, Sun, Monitor, LogOut, Copy, Check, AlertTriangle, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { session, clearSession } = useCircleSDK();
  const router = useRouter();

  const { wallet } = useDashboardContext();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);

  const handleSignOut = () => {
    clearSession();
    router.replace("/login");
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const appId = process.env.NEXT_PUBLIC_CIRCLE_APP_ID;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 pt-4">
      {/* Page Header */}
      <div className="border-b border-border/40 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your developer environment, credentials, and preferences.</p>
      </div>

      {/* Your Account Section */}
      {session && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Your Account</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Your saved login credentials.</p>
          </div>

          <div className="divide-y divide-border/30 border-t border-b border-border/30">
            {/* Username Row */}
            {session.username && (
              <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-0.5 max-w-sm">
                  <div className="text-sm font-medium text-foreground">Registered Username</div>
                  <div className="text-xs text-muted-foreground">The username linked to your account.</div>
                </div>
                <div className="flex items-center gap-3 bg-muted/40 px-3 py-2 rounded-lg border border-border/20 max-w-lg w-full justify-between">
                  <div className="flex items-center gap-2">
                    <User className="size-3.5 text-muted-foreground" />
                    <span className="text-xs font-mono font-medium text-foreground/80">{session.username}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(session.username, "username")}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    {copiedKey === "username" ? <Check className="h-4 w-4 text-blue-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Smart Wallet Address Row */}
            {session.walletAddress && (
              <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-0.5 max-w-sm">
                  <div className="text-sm font-medium text-foreground">Wallet Address</div>
                  <div className="text-xs text-muted-foreground">The address of your secure smart wallet.</div>
                </div>
                <div className="flex items-center gap-3 bg-muted/40 px-3 py-2 rounded-lg border border-border/20 max-w-lg w-full justify-between">
                  <span className="text-xs font-mono font-medium truncate text-foreground/80">{session.walletAddress}</span>
                  <button
                    onClick={() => copyToClipboard(session.walletAddress, "walletAddress")}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    {copiedKey === "walletAddress" ? <Check className="h-4 w-4 text-blue-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Credential ID Row */}
            {session.credential?.id && (
              <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-0.5 max-w-sm">
                  <div className="text-sm font-medium text-foreground">Security Key ID</div>
                  <div className="text-xs text-muted-foreground">Your device's saved login key identifier.</div>
                </div>
                <div className="flex items-center gap-3 bg-muted/40 px-3 py-2 rounded-lg border border-border/20 max-w-lg w-full justify-between">
                  <span className="text-xs font-mono font-medium truncate text-foreground/80">{session.credential.id}</span>
                  <button
                    onClick={() => copyToClipboard(session.credential.id, "credentialId")}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    {copiedKey === "credentialId" ? <Check className="h-4 w-4 text-blue-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Wallet Account Type Row */}
            {wallet && (
              <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-0.5 max-w-sm">
                  <div className="text-sm font-medium text-foreground">Wallet Type</div>
                  <div className="text-xs text-muted-foreground">The active capabilities of your smart wallet.</div>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-lg max-w-lg w-full md:w-auto justify-center md:justify-start shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {wallet.accountType || "Smart Wallet"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Developer API & SDK Configurations */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">API & SDK Environment</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Configuration details linked with the Circle environment.</p>
        </div>

        <div className="divide-y divide-border/30 border-t border-b border-border/30">
          {/* Application ID - Render only if exists */}
          {appId && (
            <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-0.5 max-w-sm">
                <div className="text-sm font-medium text-foreground">Circle Application ID</div>
                <div className="text-xs text-muted-foreground">Unique identifier for this wallet integration application.</div>
              </div>
              <div className="flex items-center gap-3 bg-muted/40 px-3 py-2 rounded-lg border border-border/20 max-w-lg w-full justify-between">
                <span className="text-xs font-mono font-medium truncate text-foreground/80">{appId}</span>
                <button
                  onClick={() => copyToClipboard(appId, "appId")}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  {copiedKey === "appId" ? <Check className="h-4 w-4 text-blue-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preferences Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Preferences</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Customize interface theme behavior.</p>
        </div>

        <div className="py-4 border-t border-b border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-sm font-medium text-foreground">Appearance Mode</div>
            <div className="text-xs text-muted-foreground">Select how the dashboard theme should be displayed.</div>
          </div>

          {/* Segmented Control Selector */}
          <div className="flex bg-muted/60 p-1 rounded-xl border border-border/30 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all",
                theme === "light" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sun className="h-3.5 w-3.5" />
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all",
                theme === "dark" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Moon className="h-3.5 w-3.5" />
              Dark
            </button>
            <button
              onClick={() => setTheme("system")}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all",
                theme === "system" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Monitor className="h-3.5 w-3.5" />
              System
            </button>
          </div>
        </div>
      </div>

      {/* Security Actions Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Security</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage your account access.</p>
        </div>

        <div className="py-6 border-t border-b border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-sm font-medium text-foreground">Sign Out</div>
            <div className="text-xs text-muted-foreground">Log out of your current session on this device.</div>
          </div>
          <Button
            variant="ghost"
            className="w-full sm:w-auto px-5 py-2 font-bold text-xs rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/20 hover:border-red-500/30 shadow-sm transition-all shrink-0"
            onClick={() => setIsSignOutConfirmOpen(true)}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Sign Out Confirmation Dialog */}
      <Dialog
        open={isSignOutConfirmOpen}
        onOpenChange={(open) => setIsSignOutConfirmOpen(open)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="size-4 text-destructive" />
              Confirm Sign Out
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Are you sure you want to sign out? This will instantly invalidate your current developer and wallet tokens on this device, and you will need to re-authenticate to gain access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setIsSignOutConfirmOpen(false)}
              className="font-bold text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="font-bold text-xs rounded-xl bg-red-600 hover:bg-red-500 text-white border-none transition-all px-4"
            >
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
