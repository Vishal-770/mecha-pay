import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Shield, Sparkles, Database, Lock, Key, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 text-foreground font-sans">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl -z-10" />

      <main className="w-full max-w-4xl flex flex-col items-center text-center space-y-12 py-20 z-10">
        {/* Top pill badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-primary">
          <Sparkles className="h-4 w-4" />
          Full-Stack Next.js 16 Auth Demo
        </div>

        {/* Hero Section */}
        <div className="space-y-6 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground">
            Secure Authentication, Made Simple
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            A premium full-stack demonstration combining the performance of Next.js 16, the security of Better Auth, and the scale of MongoDB Atlas.
          </p>
        </div>

        {/* Dynamic CTA Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          {session ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Logged in as <span className="text-primary font-semibold">{session.user.name}</span>
              </p>
              <div className="flex items-center justify-center">
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "flex items-center gap-2 font-semibold px-6 py-4 rounded-xl shadow-lg shadow-primary/15 cursor-pointer text-sm"
                  )}
                >
                  Enter Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full sm:w-auto flex items-center justify-center gap-2 font-semibold px-6 py-4 rounded-xl shadow-lg shadow-primary/15 cursor-pointer text-sm"
                )}
              >
                Create Account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full sm:w-auto flex items-center justify-center font-semibold px-6 py-4 rounded-xl cursor-pointer text-sm"
                )}
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full pt-8 text-left">
          <Card className="border border-border bg-card/30 backdrop-blur-sm p-6 hover:bg-card/50 transition-colors">
            <CardContent className="p-0 space-y-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Key className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground">Better Auth</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fully loaded with secure hashing (scrypt), session cookie control, and pre-built REST endpoints.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card/30 backdrop-blur-sm p-6 hover:bg-card/50 transition-colors">
            <CardContent className="p-0 space-y-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Database className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground">MongoDB Atlas</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                State-of-the-art serverless persistence utilizing native mongo database mapping without configuration schema layers.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card/30 backdrop-blur-sm p-6 hover:bg-card/50 transition-colors">
            <CardContent className="p-0 space-y-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Lock className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground">Strict Guards</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Highly secure, async server-side page session checks to reliably block unauthorized requests.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
