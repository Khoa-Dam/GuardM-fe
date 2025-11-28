import "../styles/globals.css";

import React from "react";
import type { Metadata, Viewport } from "next";

import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site.config";
import { fontHandwriting, fontHeading, fontMono, fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { SessionProvider } from "@/providers/session-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "next-themes";

export const viewport: Viewport = {
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: {
    name: siteConfig.author.name,
    url: siteConfig.author.url,
  },
  creator: siteConfig.author.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: siteConfig.author.x,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <React.StrictMode>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            fontSans.variable,
            fontMono.variable,
            fontHeading.variable,
            fontHandwriting.variable,
            "min-h-screen scroll-smooth font-sans antialiased selection:bg-foreground selection:text-background"
          )}
        >
          <QueryProvider>
            <SessionProvider>
              <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
              <main className="container mx-auto">
                {children}
              </main>
              <Toaster />
            </ThemeProvider>
            </SessionProvider>
          </QueryProvider>

        </body>
      </html>
    </React.StrictMode>
  );
}
