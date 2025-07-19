import { Metadata } from "next";
import { websiteConfig } from "@/config/website";

export const metadata: Metadata = {
  title: `Submit Your MCP Server - ${websiteConfig.name}`,
  description:
    "Share your Model Context Protocol server with the community. Help others discover great MCP servers.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${websiteConfig.url}/submit`,
    title: `Submit Your MCP Server - ${websiteConfig.name}`,
    description:
      "Share your Model Context Protocol server with the community. Help others discover great MCP servers.",
    siteName: websiteConfig.name,
    images: [
      {
        url: websiteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Submit Your MCP Server",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Submit Your MCP Server - ${websiteConfig.name}`,
    description:
      "Share your Model Context Protocol server with the community. Help others discover great MCP servers.",
    images: [websiteConfig.ogImage],
  },
  alternates: {
    canonical: `${websiteConfig.url}/submit`,
  },
  keywords: [
    "submit MCP server",
    "add MCP server",
    "Model Context Protocol",
    "MCP submission",
    "AI server directory",
    "contribute MCP",
  ],
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
