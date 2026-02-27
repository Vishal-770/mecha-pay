"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyCodeButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors z-10"
      aria-label="Copy code to clipboard"
    >
      {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
    </button>
  );
}
