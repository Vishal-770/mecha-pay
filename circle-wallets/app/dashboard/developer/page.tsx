"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDashboardContext } from "../_components/DashboardShell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

type ApiKeyInfo = {
  id: string;
  name: string;
  prefix: string;
  mask: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export default function DeveloperPage() {
  const { sessionUserToken, wallet } = useDashboardContext();
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchKeys = async () => {
    try {
      const res = await fetch(`/api/keys?userToken=${sessionUserToken}`);
      const data = await res.json();
      if (data.keys) setKeys(data.keys);
    } catch (err) {
      console.error("Failed to fetch keys", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [sessionUserToken]);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userToken: sessionUserToken,
          name: newKeyName,
          merchantAddress: wallet?.address,
        }),
      });
      const data = await res.json();
      if (data.rawKey) {
        setGeneratedKey(data.rawKey);
        setNewKeyName("");
        fetchKeys();
      }
    } catch (err) {
      console.error("Failed to create key", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!keyToDelete) return;
    try {
      await fetch(`/api/keys/${keyToDelete}?userToken=${sessionUserToken}`, {
        method: "DELETE",
      });
      setKeyToDelete(null);
      fetchKeys();
    } catch (err) {
      console.error("Failed to delete key", err);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      // Modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="space-y-12">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            API Keys
          </p>
          <h1 className="text-4xl font-bold tracking-tight">API Keys</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Create and manage your API keys to authenticate with Mecha Pay services. Keys are securely hashed and never shown again once generated.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/docs">
            <Button variant="outline" size="sm" className="font-bold gap-1.5 h-9">
              API Docs
              <ArrowUpRight size={13} />
            </Button>
          </Link>

          <Dialog
            open={createOpen}
            onOpenChange={(open) => {
              setCreateOpen(open);
              if (!open) setGeneratedKey(null);
            }}
          >
            <DialogTrigger asChild>
              <Button className="font-bold gap-2 h-9">
                <Plus size={14} />
                New Key
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold uppercase tracking-widest">
                {generatedKey ? "Key Generated" : "Create API Key"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {generatedKey
                  ? "This is the only time you will see this key. Store it somewhere safe immediately."
                  : "Give your key a name that describes where it will be used."}
              </DialogDescription>
            </DialogHeader>

            {generatedKey ? (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                  <code className="text-xs font-mono font-bold break-all flex-1 text-foreground">
                    {generatedKey}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => copyToClipboard(generatedKey)}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check size={14} className="text-blue-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </Button>
                </div>
                <Alert
                  variant="destructive"
                  className="bg-destructive/5 border-destructive/20 rounded-xl"
                >
                  <AlertTriangle className="size-4" />
                  <AlertTitle className="text-[10px] uppercase font-bold tracking-widest leading-none mb-1">
                    One-time display
                  </AlertTitle>
                  <AlertDescription className="text-[10px] font-medium leading-relaxed">
                    We cannot recover this key. If lost, revoke and generate a new one.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="space-y-3 py-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Key Name
                  </label>
                  <Input
                    placeholder="e.g. Production Backend"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="font-mono text-xs"
                    onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              {generatedKey ? (
                <Button
                  onClick={() => {
                    setGeneratedKey(null);
                    setCreateOpen(false);
                  }}
                  className="w-full font-bold"
                >
                  Done — I've saved this key
                </Button>
              ) : (
                <Button
                  onClick={handleCreateKey}
                  disabled={isCreating || !newKeyName.trim()}
                  className="w-full font-bold"
                >
                  {isCreating ? "Generating…" : "Generate Key"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Meta Strip ──────────────────────────────────────────── */}
      <div className="flex items-center gap-8 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Key size={12} />
          <span>
            <strong className="text-foreground font-bold">{keys.length}</strong>{" "}
            {keys.length === 1 ? "key" : "keys"} active
          </span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-2">
          <ShieldCheck size={12} />
          <span>Use the</span>
          <Badge
            variant="outline"
            className="font-mono text-[9px] h-4 px-1.5 bg-muted rounded-md"
          >
            x-api-key
          </Badge>
          <span>header over secure HTTPS connections.</span>
        </div>
      </div>

      {/* ── Keys Table ──────────────────────────────────────────── */}
      <div>
        {loading ? (
          <div className="py-24 text-center">
            <p className="text-xs text-muted-foreground animate-pulse uppercase tracking-widest font-mono">
              Syncing…
            </p>
          </div>
        ) : keys.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <div className="inline-flex items-center justify-center size-12 rounded-full bg-muted mx-auto">
              <Key size={18} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No API keys yet
            </p>
            <p className="text-xs text-muted-foreground/70">
              Generate your first key to start authenticating requests.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_40px] gap-4 px-0 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Name</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Key</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Created</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Last Used</span>
              <span />
            </div>

            {/* Table Rows */}
            {keys.map((key) => (
              <div
                key={key.id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_40px] gap-4 items-center py-4 group"
              >
                <span className="font-semibold text-sm truncate">{key.name}</span>

                <code className="font-mono text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border w-fit">
                  {key.prefix}••••{key.mask}
                </code>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock size={11} />
                  {new Date(key.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>

                <span className="text-xs text-muted-foreground">
                  {key.lastUsedAt
                    ? new Date(key.lastUsedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : <span className="italic opacity-50">Never</span>}
                </span>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setKeyToDelete(key.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>



      {/* ── Delete Confirmation Dialog ───────────────────────────── */}
      <Dialog
        open={!!keyToDelete}
        onOpenChange={(open) => {
          if (!open) setKeyToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="size-4 text-destructive" />
              Revoke API Key
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              This is permanent and cannot be undone. Any service currently using this key will immediately lose access to the protocol.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setKeyToDelete(null)}
              className="font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteKey}
              className="font-bold"
            >
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
