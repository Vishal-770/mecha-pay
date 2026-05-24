import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LogoutButton } from "./logout-button";
import { ShieldCheck } from "lucide-react";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl -z-10" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/10">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="font-bold tracking-tight text-lg text-foreground">
                Mecha Pay
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full text-center space-y-2 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Welcome, {user.name}!
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Authorized session established. View your active protocol parameters below.
          </p>
        </div>

        {/* Dynamic Gated Dashboard Status Card */}
        <div className="w-full">
          <DashboardContent userId={user.id} />
        </div>
      </main>
    </div>
  );
}
