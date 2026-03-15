import fs from "fs";
import path from "path";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import TableOfContents from "@/components/TableOfContents";
import { ModeToggle } from "@/components/ModeToggle";
import { Badge } from "@/components/ui/badge";

import { CopyDocumentationButton as CopyBtn } from "@/components/CopyDocumentationButton";

export default function GraphQLDocsPage() {
  // Try to find the GraphQL API Reference Markdown file
  const possiblePaths = [
    path.join(
      process.cwd(),
      "..",
      "docs",
      "developer",
      "graphql-api-reference.md",
    ),
    path.join(process.cwd(), "docs", "developer", "graphql-api-reference.md"),
  ];

  let content = "";
  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        content = fs.readFileSync(filePath, "utf-8");
        break;
      }
    } catch {
      // Continue searching
    }
  }

  if (!content) {
    content = `# GraphQL API Documentation Not Found
We couldn't locate the \`graphql-api-reference.md\` file. Please ensure it exists in \`docs/developer/\`.`;
  }

  // Extract headings for the Table of Contents
  const headings: { id: string; text: string; level: number }[] = [];
  const headingRegex = /^(##|###)\s+(.*)$/gm;
  let match;

  // Custom slugifier to match rehype-slug output
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-"); // Replace multiple - with single -
  };

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length; // ## is 2, ### is 3
    const text = match[2].trim();
    // remove markdown links and formatting for slug
    const cleanTextForSlug = text
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .replace(/[*_`]/g, "");

    let id = slugify(cleanTextForSlug);

    // Ensure unique IDs for headings with the same text
    let originalId = id;
    let counter = 1;
    while (headings.some((h) => h.id === id)) {
      id = `${originalId}-${counter}`;
      counter++;
    }

    headings.push({ id, text, level });
  }

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20 flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Mecha Pay Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="tracking-tight font-bold ml-1 hidden sm:inline-block">
              Mecha Pay Docs
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/docs">
              <Button
                variant="ghost"
                size="sm"
                className="font-semibold text-muted-foreground hover:text-foreground hidden md:flex"
              >
                REST API
              </Button>
            </Link>
            <Link href="/docs/graphql">
              <Button
                variant="ghost"
                size="sm"
                className="font-semibold border-b-2 border-primary hidden md:flex"
              >
                GraphQL API
              </Button>
            </Link>
            <Link href="/docs/sdk">
              <Button
                variant="ghost"
                size="sm"
                className="font-semibold text-muted-foreground hover:text-foreground hidden md:flex"
              >
                SDK
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="font-semibold text-muted-foreground hover:text-foreground hidden lg:flex"
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button size="sm" className="shadow-none font-bold">
                Home
              </Button>
            </Link>
            <ModeToggle />
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="w-full border-b border-border bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                  GraphQL API Reference
                </h1>
                <Badge className="bg-[#b6f09c]/10 text-[#b6f09c] border-[#b6f09c]/20 text-xs font-black uppercase tracking-wider">
                  The Graph
                </Badge>
              </div>
              <p className="text-muted-foreground text-base md:text-lg max-w-3xl">
                Query subscription data with The Graph protocol. Real-time
                indexing, powerful filtering, and flexible aggregations.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <a
                  href="https://api.studio.thegraph.com/query/1704298/mecha-pay/v0.0.3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="bg-[#b6f09c] text-[#000000] hover:bg-[#b6f09c]/90 font-black text-xs uppercase tracking-widest w-full border-none shadow-xl shadow-[#b6f09c]/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    Open Playground
                  </Button>
                </a>
              </div>
              <div className="flex gap-2 w-full">
                <CopyBtn content={content} />
                <a
                  href="https://thegraph.com/studio/subgraph/mecha-pay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-bold text-[10px] uppercase tracking-widest w-full text-[#a1a1aa] hover:text-[#b6f09c] hover:bg-[#b6f09c]/5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    Studio
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="w-full border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 md:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#b6f09c]/10 border border-[#b6f09c]/20 flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#b6f09c]"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">Real-time Indexing</h3>
                <p className="text-xs text-muted-foreground">
                  Events indexed within seconds of emission
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#b6f09c]/10 border border-[#b6f09c]/20 flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#b6f09c]"
                >
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">Flexible Queries</h3>
                <p className="text-xs text-muted-foreground">
                  Filter, sort, and paginate any entity
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#b6f09c]/10 border border-[#b6f09c]/20 flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#b6f09c]"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">Aggregated Stats</h3>
                <p className="text-xs text-muted-foreground">
                  Pre-computed revenue, counts, and metrics
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#b6f09c]/10 border border-[#b6f09c]/20 flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#b6f09c]"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">Decentralized</h3>
                <p className="text-xs text-muted-foreground">
                  No centralized database or backend needed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 md:px-8 md:py-12 w-full">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_280px] gap-8 xl:gap-16">
          <div className="w-full min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MarkdownRenderer content={content} />
          </div>

          <aside className="hidden lg:block w-full sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar">
            <div className="space-y-6">
              <TableOfContents headings={headings} />

              {/* Quick Links */}
              <div className="border border-border rounded-lg p-4 bg-muted/30">
                <h4 className="font-bold text-sm mb-3 uppercase tracking-widest text-muted-foreground">
                  Quick Links
                </h4>
                <div className="space-y-2 text-sm">
                  <a
                    href="https://api.studio.thegraph.com/query/1704298/mecha-pay/v0.0.2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    GraphQL Playground
                  </a>
                  <a
                    href="https://thegraph.com/studio/subgraph/mecha-pay"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Subgraph Studio
                  </a>
                  <a
                    href="https://testnet.arcscan.net/address/0x2BC2f391fca4144f708eEa918d94348684Bdb544"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Contract Explorer
                  </a>
                  <Link
                    href="/docs"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary hover:underline"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    REST API Docs
                  </Link>
                </div>
              </div>

              {/* Endpoint Info */}
              <div className="border border-border rounded-lg p-4 bg-muted/30">
                <h4 className="font-bold text-sm mb-3 uppercase tracking-widest text-muted-foreground">
                  Endpoint
                </h4>
                <div className="space-y-2">
                  <code className="text-xs bg-background border border-border rounded px-2 py-1 block break-all">
                    https://api.studio.thegraph.com/query/1704298/mecha-pay/v0.0.3
                  </code>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>Arc Testnet</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                    <span>Version v0.0.3</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Mecha Pay Logo"
                width={20}
                height={20}
                className="object-contain opacity-70"
              />
              <span>© 2026 Mecha Pay. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                href="/docs"
                className="hover:text-foreground transition-colors"
              >
                REST API
              </Link>
              <Link
                href="/dashboard"
                className="hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
