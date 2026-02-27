import fs from "fs";
import path from "path";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import TableOfContents from "@/components/TableOfContents";
import { ModeToggle } from "@/components/ModeToggle";

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
            <span className="tracking-tight font-bold ml-1 hidden sm:inline-block">Mecha Pay Docs</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="font-semibold text-muted-foreground hover:text-foreground hidden md:flex">
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
      
      <main className="flex-1 container mx-auto px-4 py-8 md:px-8 md:py-12 w-full">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_250px] gap-8 xl:gap-16">
          <div className="w-full min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MarkdownRenderer content={content} />
          </div>
          
          <aside className="hidden lg:block w-full sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar">
            <TableOfContents headings={headings} />
          </aside>
        </div>
      </main>
    </div>
  );
}
