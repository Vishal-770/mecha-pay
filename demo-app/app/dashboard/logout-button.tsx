"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    setIsPending(true);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
            router.refresh();
          },
          onError: () => {
            setIsPending(false);
          }
        }
      });
    } catch (err) {
      console.error("Signout error", err);
      setIsPending(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isPending}
      variant="outline"
      className="flex items-center gap-2 border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      Sign Out
    </Button>
  );
}
