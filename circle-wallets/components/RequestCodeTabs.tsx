"use client";

import { useMemo, useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";
import { vs, vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { CopyCodeButton } from "./CopyCodeButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface RequestCodeTabsProps {
  bashCode: string;
}

export function RequestCodeTabs({ bashCode }: RequestCodeTabsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://local.mechapay.com";
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme === "dark";
  const highlightStyle = (isDark ? vscDarkPlus : vs) as any;

  // Substitute the base URL into the raw bash code to fix the original cURL tab as well
  const runtimeBashCode = bashCode.replace(/https:\/\/pay\.mechapay\.com/g, baseUrl);

  const { url, method, headers } = useMemo(() => {
    let extractedMethod = "GET";
    let extractedUrl = "";
    const extractedHeaders: Record<string, string> = {};

    // Remove backslash line continuations for easier parsing
    const curlClean = runtimeBashCode.replace(/\\\n/g, " ");

    const methodMatch = curlClean.match(/-X\s+([A-Z]+)/);
    if (methodMatch) extractedMethod = methodMatch[1];

    const urlMatch = curlClean.match(/"(https?:\/\/[^"]+)"/);
    if (urlMatch) {
      extractedUrl = urlMatch[1];
    } else {
      // Fallback if URL is not in quotes
      const urlMatchNoQuotes = curlClean.match(/(https?:\/\/[^\s]+)/);
      if (urlMatchNoQuotes) extractedUrl = urlMatchNoQuotes[1];
    }

    const headerRegex = /-H\s+"([^:]+):\s*(.+?)"/g;
    let match;
    while ((match = headerRegex.exec(curlClean)) !== null) {
      extractedHeaders[match[1]] = match[2];
    }

    // Default headers if not specified but implies JSON
    if (!extractedHeaders['Accept'] && !extractedHeaders['accept']) {
        extractedHeaders['Accept'] = 'application/json';
    }

    return { method: extractedMethod, url: extractedUrl, headers: extractedHeaders };
  }, [runtimeBashCode]);

  const fetchCode = useMemo(() => {
    return `const options = {
  method: '${method}',
  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, "\n  ")}
};

fetch('${url}', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));`;
  }, [method, url, headers]);

  const axiosCode = useMemo(() => {
    return `const axios = require('axios');

const options = {
  method: '${method}',
  url: '${url}',
  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, "\n  ")}
};

axios.request(options)
  .then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.error(error);
  });`;
  }, [method, url, headers]);

  const pythonCode = useMemo(() => {
    return `import requests

url = "${url}"

headers = ${JSON.stringify(headers, null, 4)}

response = requests.request("${method}", url, headers=headers)

print(response.json())`;
  }, [method, url, headers]);

  const goCode = useMemo(() => {
    const headerLines = Object.entries(headers)
      .map(([key, value]) => `\treq.Header.Add("${key}", "${value}")`)
      .join("\n");

    return `package main

import (
\t"fmt"
\t"io"
\t"net/http"
)

func main() {
\turl := "${url}"

\treq, _ := http.NewRequest("${method}", url, nil)

${headerLines}

\tres, _ := http.DefaultClient.Do(req)
\tdefer res.Body.Close()

\tbody, _ := io.ReadAll(res.Body)
\tfmt.Println(string(body))
}`;
  }, [method, url, headers]);

  const rustCode = useMemo(() => {
    const headerLines = Object.entries(headers)
      .map(([key, value]) => `    headers.insert("${key}", "${value}".parse().unwrap());`)
      .join("\n");

    return `use reqwest;
use reqwest::header::HeaderMap;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut headers = HeaderMap::new();
${headerLines}

    let client = reqwest::Client::new();
    let res = client.request(reqwest::Method::${method === 'GET' ? 'GET' : method === 'POST' ? 'POST' : method === 'PUT' ? 'PUT' : method === 'DELETE' ? 'DELETE' : 'GET'}, "${url}")
        .headers(headers)
        .send()
        .await?
        .text()
        .await?;

    println!("{}", res);
    Ok(())
}`;
  }, [method, url, headers]);

  const renderHighlight = (code: string, lang: string, titleLabel: string) => (
    <div className="relative group rounded-xl overflow-hidden my-4 border border-border shadow-sm">
      <div className={cn(
        "flex items-center justify-between px-4 py-2 border-b text-xs font-mono uppercase tracking-wider transition-colors duration-200",
        isDark
          ? "bg-zinc-900 border-zinc-800 text-zinc-400"
          : "bg-zinc-100 border-zinc-200 text-zinc-600"
      )}>
        <span>{titleLabel}</span>
        <CopyCodeButton text={code} />
      </div>
      <SyntaxHighlighter
        style={highlightStyle}
        language={lang}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "1.25rem",
          background: isDark ? "#09090b" : "#fbfbfb",
          fontSize: "0.875rem",
          lineHeight: "1.5",
          transition: "background 0.2s ease",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );

  return (
    <Tabs defaultValue="curl" className="w-full mt-8 mb-6">
      <TabsList className="bg-muted/50 p-1 h-9 flex space-x-1 border border-border rounded-lg inline-flex w-auto overflow-x-auto justify-start">
        <TabsTrigger value="curl" className="text-[11px] font-medium px-4 p-1 rounded-md">cURL</TabsTrigger>
        <TabsTrigger value="js" className="text-[11px] font-medium px-4 p-1 rounded-md">JS (Fetch)</TabsTrigger>
        <TabsTrigger value="node" className="text-[11px] font-medium px-4 p-1 rounded-md">Node (Axios)</TabsTrigger>
        <TabsTrigger value="python" className="text-[11px] font-medium px-4 p-1 rounded-md">Python</TabsTrigger>
        <TabsTrigger value="go" className="text-[11px] font-medium px-4 p-1 rounded-md">Go</TabsTrigger>
        <TabsTrigger value="rust" className="text-[11px] font-medium px-4 p-1 rounded-md">Rust</TabsTrigger>
      </TabsList>
      
      <TabsContent value="curl" className="mt-0">
        {renderHighlight(runtimeBashCode, "bash", "bash")}
      </TabsContent>
      <TabsContent value="js" className="mt-0">
        {renderHighlight(fetchCode, "javascript", "javascript")}
      </TabsContent>
      <TabsContent value="node" className="mt-0">
        {renderHighlight(axiosCode, "javascript", "javascript")}
      </TabsContent>
      <TabsContent value="python" className="mt-0">
        {renderHighlight(pythonCode, "python", "python")}
      </TabsContent>
      <TabsContent value="go" className="mt-0">
        {renderHighlight(goCode, "go", "go")}
      </TabsContent>
      <TabsContent value="rust" className="mt-0">
        {renderHighlight(rustCode, "rust", "rust")}
      </TabsContent>
    </Tabs>
  );
}
