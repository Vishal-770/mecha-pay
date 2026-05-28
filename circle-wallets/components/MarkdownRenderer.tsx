"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";
import { vs, vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { CopyCodeButton } from "./CopyCodeButton";
import { RequestCodeTabs } from "./RequestCodeTabs";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme === "dark";
  const highlightStyle = (isDark ? vscDarkPlus : vs) as any;

  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none 
      prose-headings:scroll-m-20
      prose-h1:text-4xl prose-h1:font-extrabold prose-h1:tracking-tight prose-h1:mb-8
      prose-h2:text-2xl prose-h2:font-semibold prose-h2:tracking-tight prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
      prose-h3:text-xl prose-h3:font-semibold prose-h3:tracking-tight prose-h3:mt-8 prose-h3:mb-4
      prose-p:leading-7 prose-p:mb-6 prose-p:text-muted-foreground
      prose-a:text-primary prose-a:font-medium prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-primary/80
      prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-1 prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-sm prose-blockquote:my-6
      prose-table:w-full prose-table:my-8 prose-table:overflow-hidden prose-table:rounded-xl prose-table:border prose-table:border-border
      prose-th:border-b prose-th:border-border prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-semibold prose-th:bg-muted/50 prose-th:text-xs prose-th:uppercase prose-th:tracking-wider
      prose-td:border-b prose-td:border-border prose-td:px-4 prose-td:py-3 prose-td:text-sm
      prose-tr:last:border-0
      prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-ul:text-muted-foreground
      prose-li:mb-2
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={{
          pre: ({ children }) => <>{children}</>,
          // For blockquotes containing [!IMPORTANT] GitHub alerts
          blockquote: ({ node, children, ...props }) => {
            const rawText = String(children);
            if (rawText.includes("[!IMPORTANT]")) {
              const cleanText = rawText.replace("[!IMPORTANT]", "").trim();
              return (
                <blockquote className="border-l-4 border-blue-500 bg-blue-500/10 pl-4 py-3 rounded-r-lg my-6 text-blue-600 dark:text-blue-400 text-sm">
                  <div className="font-bold flex items-center gap-2 mb-1.5 uppercase tracking-widest text-[11px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    Important Note
                  </div>
                  <div>{cleanText}</div>
                </blockquote>
              );
            }
            return <blockquote {...props}>{children}</blockquote>;
          },
          // Custom Code Renderer for Syntax Highlighting and Badges
          code: ({ node, className, children, ref, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const rawCode = String(children).replace(/\n$/, "");
            
            // Check if it's an inline HTTP verb like `GET /api/v1/xyz`
            const isHttpMethod = /^(GET|POST|PUT|DELETE|PATCH)\s+/.test(rawCode);

            if (!className && isHttpMethod) {
              const method = rawCode.split(" ")[0];
              const path = rawCode.slice(method.length).trim();
              
              let methodColor = "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";
              if (method === "GET") methodColor = "bg-zinc-100 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50";
              if (method === "POST") methodColor = "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50";
              if (method === "PUT" || method === "PATCH") methodColor = "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50";
              if (method === "DELETE") methodColor = "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800/50";

              return (
                <span className="inline-flex items-center gap-2 font-mono text-[13px] tracking-tight bg-muted/40 px-2 py-1 rounded-md border border-border/50">
                  <span className={`px-1.5 py-0.5 rounded-[4px] font-bold text-[10px] uppercase tracking-wider ${methodColor}`}>
                    {method}
                  </span>
                  <span className="font-semibold text-foreground">{path}</span>
                </span>
              );
            }

            // Standard inline code
            if (!match) {
              return (
                <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-mono text-sm font-bold" {...props}>
                  {children}
                </code>
              );
            }

            // Syntax Highlighted block
            if (match[1] === "bash" && rawCode.trim().startsWith("curl")) {
              return <RequestCodeTabs bashCode={rawCode} />;
            }

            return (
              <div className="relative group rounded-xl overflow-hidden my-6 border border-border shadow-sm">
                <div className={cn(
                  "flex items-center justify-between px-4 py-2 border-b text-xs font-mono uppercase tracking-wider transition-colors duration-200",
                  isDark
                    ? "bg-zinc-900 border-zinc-800 text-zinc-400"
                    : "bg-zinc-100 border-zinc-200 text-zinc-600"
                )}>
                  <span>{match[1]}</span>
                  <CopyCodeButton text={rawCode} />
                </div>
                <SyntaxHighlighter
                  style={highlightStyle}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: "1.25rem",
                    background: isDark ? "#09090b" : "#fbfbfb",
                    fontSize: "0.875rem",
                    lineHeight: "1.5",
                    transition: "background 0.2s ease",
                  }}
                  {...props}
                >
                  {rawCode}
                </SyntaxHighlighter>
              </div>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
