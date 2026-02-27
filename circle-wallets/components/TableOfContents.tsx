"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Configure Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible headings
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Generally take the first visible one
          setActiveId(visibleEntries[0].target.id);
        }
      },
      { rootMargin: "0px 0px -80% 0px", threshold: 1.0 }
    );

    // Observe all heading elements
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Small offset for sticky header
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth"
      });
      // Optionally sync active id instantly on click
      setActiveId(id);
    }
  };

  return (
    <div className="pr-4 pb-12">
      <h4 className="text-sm font-semibold mb-4 text-foreground/80 tracking-tight">On this page</h4>
      <nav className="border-l border-border relative flex flex-col gap-1 w-full pl-0">
        <div 
          className="absolute left-[-1px] w-[2px] bg-primary transition-all duration-300 rounded" 
          style={{
            height: activeId ? "24px" : "0px",
            top: "0px",
            // We manually compute the top offset for the active indicator or just use border-l on the active link
            opacity: 0
          }}
        />
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={cn(
                "block text-sm py-1.5 transition-colors pl-4 border-l-2 -ml-[1px]",
                isActive 
                  ? "border-primary text-foreground font-medium" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
              style={{
                marginLeft: heading.level === 3 ? "0px" : "-1px",
                paddingLeft: heading.level === 3 ? "1.5rem" : "1rem", // Indent <h3>s slightly more
              }}
            >
              {heading.text}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
