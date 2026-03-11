import fs from "fs";
import path from "path";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import TableOfContents from "@/components/TableOfContents";
import { ModeToggle } from "@/components/ModeToggle";
import { Badge } from "@/components/ui/badge";
import { CopyDocumentationButton } from "@/components/CopyDocumentationButton";

export default function DocsPage() {
  // Try to find the Markdown file in standard locations
  const possiblePaths = [
    path.join(process.cwd(), "..", "docs", "developer", "api-reference.md"),
    path.join(process.cwd(), "docs", "developer", "api-reference.md"),
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
    content = `# Documentation Not Found
We couldn't locate the \`api-reference.md\` file. Please ensure it exists in \`docs/developer/\`.`;
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
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-'); // Replace multiple - with single -
  };

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length; // ## is 2, ### is 3
    const text = match[2].trim();
    // remove markdown links and formatting for slug
    const cleanTextForSlug = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/[*_`]/g, '');
    const id = slugify(cleanTextForSlug);
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
              <Button variant="ghost" size="sm" className="font-semibold border-b-2 border-primary hidden md:flex">
                REST API
              </Button>
            </Link>
            <Link href="/docs/graphql">
              <Button variant="ghost" size="sm" className="font-semibold text-muted-foreground hover:text-foreground hidden md:flex">
                GraphQL API
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="font-semibold text-muted-foreground hover:text-foreground hidden lg:flex">
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
      <div className="w-full border-b border-border bg-gradient-to-br from-[#b6f09c]/5 via-background to-background">
        <div className="container mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                  REST API Reference
                </h1>
                <Badge className="bg-[#b6f09c]/10 text-[#b6f09c] border-[#b6f09c]/20 text-xs font-black uppercase tracking-wider">
                  Developer Beta
                </Badge>
              </div>
              <p className="text-muted-foreground text-base md:text-lg max-w-3xl">
                Integrate Mecha Pay into your platform with our robust JSON API. Handle subscriptions, manage keys, and track revenue programmatically.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <CopyDocumentationButton content={content} />
              <Link href="/dashboard/developer">
                <Button className="bg-[#b6f09c] text-[#000000] hover:bg-[#b6f09c]/90 font-black text-[10px] uppercase tracking-widest w-full border-none shadow-xl shadow-[#b6f09c]/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  Get API Keys
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="w-full border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 md:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#b6f09c]/10 border border-[#b6f09c]/20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#b6f09c]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">Secure Authentication</h3>
                <p className="text-xs text-muted-foreground">Standardized header-based API key validation for all requests</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#b6f09c]/10 border border-[#b6f09c]/20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#b6f09c]"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><polyline points="16 16 12 12 8 16"/></svg>
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">State Hydration</h3>
                <p className="text-xs text-muted-foreground">Real-time status updates synced across blockchain and metadata layers</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#b6f09c]/10 border border-[#b6f09c]/20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#b6f09c]"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">Developer Focused</h3>
                <p className="text-xs text-muted-foreground">Clean JSON responses and robust error handling for easy integration</p>
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
                <h4 className="font-bold text-sm mb-3 uppercase tracking-widest text-muted-foreground">Also Available</h4>
                <div className="space-y-2 text-sm">
                  <Link href="/docs/graphql" className="flex items-center gap-2 text-primary hover:underline group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-[#b6f09c] transition-colors"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                    GraphQL API Reference
                  </Link>
                  <Link href="/dashboard/developer" className="flex items-center gap-2 text-muted-foreground hover:text-primary hover:underline group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-[#b6f09c] transition-colors"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    Generate API Keys
                  </Link>
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
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <Link href="/docs/graphql" className="hover:text-foreground transition-colors">GraphQL API</Link>
              <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
