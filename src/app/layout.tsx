import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { websiteConfig } from "@/config/website";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { Metadata } from "next";
import "./globals.css";
import "highlight.js/styles/github-dark.css";
import { Analytics } from "@/components/analytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(websiteConfig.url),
  title: {
    default: websiteConfig.name,
    template: `%s | ${websiteConfig.name}`,
  },
  description: websiteConfig.description,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/site.webmanifest",
  other: {
    "google-site-verification": process.env.GOOGLE_SITE_VERIFICATION || "",
  },
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Analytics />
      </head>
      <body
        className={cn(
          "bg-background dark min-h-screen font-sans antialiased",
          inter.className,
        )}
      >
        <Toaster />
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
