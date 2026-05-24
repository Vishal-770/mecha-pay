import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BillingSection } from "../dashboard/billing-section";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function BillingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 font-sans">
      {/* Top-Left Back Button */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8">
        <Link 
          href="/dashboard" 
          className={cn(
            buttonVariants({ variant: "ghost" }), 
            "flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs font-semibold cursor-pointer border border-border/40 hover:border-border bg-card/20 hover:bg-muted/30 px-3 py-2 rounded-xl transition-all shadow-sm"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
      </div>

      <div className="w-full max-w-4xl">
        <BillingSection userId={user.id} />
      </div>
    </div>
  );
}
