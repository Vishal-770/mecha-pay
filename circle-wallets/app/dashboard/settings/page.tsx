"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/ModeToggle";
import { useTheme } from "next-themes";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { cn } from "@/lib/utils";
import { Moon, Sun, Monitor, Bell, Shield, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { clearSession } = useCircleSDK();
  const router = useRouter();

  const handleSignOut = () => {
    clearSession();
    router.replace("/login");
  };

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Settings</h1>
        <p className="text-muted-foreground font-bold italic uppercase tracking-widest text-[10px]">Command Center Preferences</p>
      </div>

      <div className="grid gap-8">
        {/* Appearance Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sun className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">Appearance</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base font-bold">Display Mode</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Customize the interface look</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                      theme === "light" ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <Sun className={cn("h-6 w-6", theme === "light" ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-[10px] font-black uppercase">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                      theme === "dark" ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <Moon className={cn("h-6 w-6", theme === "dark" ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-[10px] font-black uppercase">Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={cn(
                      "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                      theme === "system" ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <Monitor className={cn("h-6 w-6", theme === "system" ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-[10px] font-black uppercase">System</span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold">Quick Toggle</p>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground/60">Switch current theme</p>
                  </div>
                  <ModeToggle />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold">Interface Polish</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Control visual density</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-transparent">
                   <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background border border-border">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-bold">Notifications</span>
                   </div>
                   <div className="h-5 w-9 rounded-full bg-primary/20 p-1 flex items-center justify-end">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                   </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-transparent">
                   <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background border border-border">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-bold">Privacy Mode</span>
                   </div>
                   <div className="h-5 w-9 rounded-full bg-muted p-1 flex items-center justify-start">
                      <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Security Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">Account & Security</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-red-500/20 bg-red-500/[0.02] shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold text-red-500">Logout</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Securely end your session</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  className="w-full h-12 font-black uppercase italic tracking-widest text-xs"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out from Command
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm border-dashed flex flex-col justify-center">
              <CardContent className="flex flex-col items-center justify-center py-6 text-center gap-2">
                <p className="font-black text-[10px] uppercase italic text-muted-foreground/40">Mecha Pay Protocol v1.0.4</p>
                <div className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/20" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
