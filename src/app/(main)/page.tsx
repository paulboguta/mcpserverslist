import { Suspense } from "react";
import { ServersContent } from "@/components/servers-content";
import { SkeletonServersContent } from "@/components/skeletons";
import { Toolbar } from "@/components/toolbar/toolbar";
import { ToolbarSkeleton } from "@/components/toolbar/toolbar-skeleton";
import { SERVERS_SORT_OPTIONS, DEFAULT_SORT_SERVERS } from "@/config/sorting";
import { websiteConfig } from "@/config/website";
import { generateHomepageJsonLd } from "@/lib/schema";
import type { ServerSortField } from "@/types/sorting";
import type { SearchParams } from "nuqs/server";
import type { Metadata } from "next";

export const revalidate = 3600; // 1 hour

export const metadata: Metadata = {
  title: `${websiteConfig.name} - Discover 500+ Model Context Protocol Servers`,
  description: websiteConfig.description,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: websiteConfig.url,
    title: `${websiteConfig.name} - Discover 500+ Model Context Protocol Servers`,
    description: websiteConfig.description,
    siteName: websiteConfig.name,
    images: [
      {
        url: websiteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${websiteConfig.name} - MCP Servers Directory`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${websiteConfig.name} - Discover 500+ Model Context Protocol Servers`,
    description: websiteConfig.description,
    images: [websiteConfig.ogImage],
  },
  alternates: {
    canonical: websiteConfig.url,
  },
  keywords: [
    "MCP",
    "Model Context Protocol",
    "AI servers",
    "LLM tools",
    "AI directory",
    "Claude MCP",
    "OpenAI MCP",
    "AI integration",
    "developer tools",
  ],
};

export async function generateStaticParams() {
  // Return empty array for root page - it will be statically generated
  return [];
}

function HomepageJsonLd() {
  const jsonLd = generateHomepageJsonLd();

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function HomePage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;

  return (
    <>
      <HomepageJsonLd />
      <div>
      <section className="mx-auto mb-6 flex flex-col gap-3 px-8 py-12 lg:py-20">
        <h1 className="text-3xl leading-[1.1] font-bold tracking-tight">
          Explore MCP Servers
        </h1>
        <p className="text-muted-foreground text-lg">
          A public directory for AI-curious engineers and CTOs to discover Model
          Context Protocol servers
        </p>
        <h3 className="text-sm text-muted-foreground/70 mt-2">
          New to MCPs? Learn more{" "}
          <a
            href="https://modelcontextprotocol.io/introduction"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-muted-foreground transition-colors"
          >
           here
          </a>
        </h3>
      </section>

      <Suspense fallback={<ToolbarSkeleton />}>
        <Toolbar<ServerSortField>
          sortOptions={SERVERS_SORT_OPTIONS}
          defaultSort={DEFAULT_SORT_SERVERS}
          searchPlaceholder="Search servers..."
        />
      </Suspense>

      <section className="px-8 pb-24">
        <Suspense fallback={<SkeletonServersContent />}>
          <ServersContent searchParams={searchParams} />
        </Suspense>
      </section>
      </div>
    </>
  );
}
