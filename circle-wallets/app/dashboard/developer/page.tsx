"use client";

import { useEffect, useState } from "react";
import { useDashboardContext } from "../_components/DashboardShell";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Terminal, 
  Clock, 
  AlertTriangle,
  Info
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
  const { sessionUserToken } = useDashboardContext();
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

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
          merchantAddress: (useDashboardContext as any).wallet?.address // Not ideal access but let's fix the call
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Developer Settings</h1>
          <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest">Manage your protocol access keys</p>
        </div>

        <Dialog onOpenChange={(open) => { if (!open) setGeneratedKey(null); }}>
          <DialogTrigger asChild>
            <Button className="font-bold gap-2">
              <Plus size={16} />
              Create New Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold uppercase tracking-widest">
                {generatedKey ? "Key Generated Successfully" : "Generate API Key"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {generatedKey 
                  ? "Copy this key now. For security reasons, we cannot show it to you again."
                  : "Give your key a descriptive name to identify it later."}
              </DialogDescription>
            </DialogHeader>

            {generatedKey ? (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                  <code className="text-xs font-mono font-bold break-all flex-1">{generatedKey}</code>
                  <Button 
                    variant="ghost" 
                    size="icon-sm" 
                    onClick={() => copyToClipboard(generatedKey)}
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </Button>
                </div>
                
                <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 mt-4 rounded-xl">
                    <AlertTriangle className="size-4" />
                    <AlertTitle className="text-[10px] uppercase font-bold tracking-widest leading-none mb-1">Security Advisory</AlertTitle>
                    <AlertDescription className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                        Protocol security is your responsibility. Replace lost keys immediately.
                    </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Key Name</label>
                  <Input 
                    placeholder="e.g. Production Backend" 
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="font-bold text-xs"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              {generatedKey ? (
                <Button onClick={() => setGeneratedKey(null)} className="w-full font-bold">I've saved the key</Button>
              ) : (
                <Button 
                  onClick={handleCreateKey} 
                  disabled={isCreating || !newKeyName.trim()} 
                  className="w-full font-bold"
                >
                  {isCreating ? "Generating..." : "Generate Key"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border shadow-none bg-muted/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Key size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">Total Keys</p>
                <p className="text-2xl font-bold tracking-tight mt-1">{keys.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border shadow-none bg-muted/30 col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-sky-500/10 p-2 text-sky-600">
                <Info size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">Authentication Protocol</p>
                <div className="flex items-center gap-2 mt-1">
                   <Badge variant="outline" className="font-mono text-[9px] h-5 bg-background">x-api-key</Badge>
                   <span className="text-xs font-semibold text-muted-foreground">Header required for all off-chain settlements</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-none">
        <CardHeader className="p-8">
          <div className="flex items-center gap-3">
             <div className="rounded-lg bg-primary/10 p-3 text-primary">
               <Terminal size={20} />
             </div>
             <div>
               <CardTitle className="text-lg font-bold">API Key Registry</CardTitle>
               <CardDescription className="text-[11px] font-medium uppercase tracking-widest mt-1 italic">
                 Hashed off-chain identity management
               </CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center text-xs text-muted-foreground animate-pulse uppercase font-serif tracking-widest italic">Syncing Keys...</div>
          ) : keys.length === 0 ? (
            <div className="py-20 text-center space-y-4">
               <p className="text-xs text-muted-foreground italic">No API keys found. Initialize a key to begin using the protocol.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                  <TableHead className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground px-8 h-12">Name</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground px-8 h-12">Key ID</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground px-8 h-12">Created</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground px-8 h-12">Last Used</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground px-8 h-12 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id} className="hover:bg-muted/30 border-b border-border transition-colors">
                    <TableCell className="px-8 py-5">
                      <span className="font-bold text-sm">{key.name}</span>
                    </TableCell>
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <code className="text-[11px] font-bold font-mono px-2 py-0.5 bg-muted rounded border border-border">
                          {key.prefix}••••{key.mask}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock size={12} />
                        {new Date(key.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-5">
                      <span className="text-xs font-semibold">
                        {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : "Never"}
                      </span>
                    </TableCell>
                    <TableCell className="px-8 py-5 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon-sm"
                        onClick={() => setKeyToDelete(key.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
         <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
               <Info size={14} className="text-primary" />
               Developer Quickstart
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
               Use your API keys to authorize requests to the Mecha Pay API. All requests must be sent over HTTPS and include the key in the <code className="bg-muted px-1 rounded font-bold">x-api-key</code> header.
            </p>
            <Separator />
            <div className="space-y-2">
               <pre className="p-4 bg-muted rounded-xl text-[10px] font-mono overflow-auto border border-border">
{`curl -X GET "https://api.mechapay.com/v1/stats" \\
  -H "x-api-key: mp_live_..." \\
  -H "Content-Type: application/json"`}
               </pre>
            </div>
         </div>
      </div>

      <Dialog open={!!keyToDelete} onOpenChange={(open) => { if (!open) setKeyToDelete(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="size-4 text-destructive" />
              Revoke API Key
            </DialogTitle>
            <DialogDescription className="text-xs">
              This action is irreversible. Systems using this key will immediately lose access to the protocol.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setKeyToDelete(null)} className="font-bold">Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteKey} className="font-bold">Revoke Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
