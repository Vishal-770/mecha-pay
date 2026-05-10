import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono, Mulish } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const mulish = Mulish({ 
  subsets: ["latin"],
  variable: "--font-mulish",
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mecha Pay",
  description: "Mecha Pay Payment Protocol",
};

import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(jetbrainsMono.variable)} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${mulish.variable} antialiased`}
      >
         <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange
          >
        <Providers>
          {children}
        </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
