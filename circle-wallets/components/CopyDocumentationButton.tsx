"use client";
import { useState } from "react";
import { Check, Copy, ClipboardCheck } from "lucide-react";
import { Button } from "./ui/button";

interface CopyDocumentationButtonProps {
  content: string;
}

export function CopyDocumentationButton({ content }: CopyDocumentationButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={`font-black text-[10px] uppercase tracking-widest transition-all duration-300 border-2 ${
        copied 
          ? "border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6] shadow-lg shadow-[#3b82f6]/5" 
          : "border-border hover:border-[#3b82f6]/40 hover:bg-[#3b82f6]/5 text-muted-foreground hover:text-[#3b82f6]"
      }`}
    >
      {copied ? (
        <>
          <ClipboardCheck size={14} className="mr-2 stroke-[3px]" />
          Copied Docs
        </>
      ) : (
        <>
          <Copy size={14} className="mr-2 stroke-[3px]" />
          Copy Page
        </>
      )}
    </Button>
  );
}
