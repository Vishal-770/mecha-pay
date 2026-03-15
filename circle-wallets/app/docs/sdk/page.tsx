import fs from "fs";
import path from "path";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import TableOfContents from "@/components/TableOfContents";
import { ModeToggle } from "@/components/ModeToggle";
import { CopyDocumentationButton as CopyBtn } from "@/components/CopyDocumentationButton";

export default function SDKDocsPage() {
  // Try to find the Mecha-Pay SDK Markdown file
  const possiblePaths = [
    path.join(process.cwd(), "..", "Mecha-pay", "README.md"),
    path.join(process.cwd(), "Mecha-pay", "README.md"),
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
    content = `# SDK Documentation Not Found
We couldn't locate the \`README.md\` file in \`Mecha-pay/\`. Please ensure it exists.`;
  }

  // Remove emojis from content as requested
  // This is a simple regex for most common emojis, can be improved.
  const emojiRegex =
    /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/gu;
  content = content.replace(emojiRegex, "");

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
    const originalId = id;
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
                className="font-semibold text-muted-foreground hover:text-foreground hidden md:flex"
              >
                GraphQL API
              </Button>
            </Link>
            <Link href="/docs/sdk">
              <Button
                variant="ghost"
                size="sm"
                className="font-semibold border-b-2 border-primary hidden md:flex"
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

      <main className="container mx-auto px-4 md:px-8 py-10 flex flex-col lg:flex-row justify-between gap-12 xl:gap-32 flex-grow">
        <div className="flex-1 max-w-3xl">
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-pre:bg-zinc-950 prose-pre:border-zinc-800">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                SDK Documentation
              </h1>
              <CopyBtn content={content} />
            </div>

            <p className="text-xl text-muted-foreground mb-8 border-b pb-8 border-border">
              Quickly integrate Mecha Pay into your application using our NPM
              package.
            </p>

            <MarkdownRenderer content={content} />
          </div>
        </div>

        <aside className="lg:w-64 xl:w-72 flex-shrink-0">
          <div className="sticky top-24 pl-4 border-l border-border/50">
            <TableOfContents headings={headings} />
          </div>
        </aside>
      </main>

      <footer className="border-t border-border py-8 bg-muted/30 mt-auto">
        <div className="container mx-auto px-4 md:px-8 text-center text-sm text-muted-foreground font-medium">
          &copy; {new Date().getFullYear()} Mecha Pay. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
