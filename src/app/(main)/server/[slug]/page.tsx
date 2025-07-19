import { ServerContent } from '@/components/server/server-content';
import { RightSidebar } from '@/components/server/sidebars';
import { ServerStatsSkeleton } from '@/components/server/skeleton-server-page';
import { websiteConfig } from '@/config/website';
import { getServerBySlug, getAllServers } from '@/use-cases/servers';
import { generateServerJsonLd } from '@/lib/schema';
import { notFound } from 'next/navigation';
import { cache, Suspense } from 'react';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  const server = await getServerBySlug(slug);

  if (!server) {
    notFound();
  }

  const title = `${server.name} - MCP Server`;
  const description = server.shortDesc || `Explore ${server.name} - a Model Context Protocol server on MCPServersList`;

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: `${websiteConfig.url}/server/${slug}`,
      title,
      description,
      siteName: 'MCPServersList',
      images: [
        {
          url: websiteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `${server.name} - MCP Server`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [websiteConfig.ogImage],
    },
    alternates: {
      canonical: `${websiteConfig.url}/server/${slug}`,
    },
    keywords: [
      server.name,
      'MCP',
      'Model Context Protocol',
      'AI',
      'LLM',
      'server',
      `${server.name} MCP server`,
    ],
  };
}

// JSON-LD component for the server
async function ServerJsonLd({ server }: { server: Awaited<ReturnType<typeof findServer>> }) {
  const jsonLd = generateServerJsonLd(server);

  if (!jsonLd) return null;

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: <ltd schema>
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export async function generateStaticParams() {
  const servers = await getAllServers();

  return servers.map(server => ({
    slug: server.slug,
  }));
}

const findServer = cache(async (props: PageProps) => {
  const { slug } = await props.params;

  const server = await getServerBySlug(slug);

  if (!server) {
    notFound();
  }

  return server;
});

export default async function ServerPage(props: PageProps) {
  const server = await findServer(props);

  return (
    <>
      <ServerJsonLd server={server} />
      <div className="relative min-h-screen">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[auto_300px]">
          <main className="w-full min-w-0 px-8 py-8">
            <ServerContent server={server} />
          </main>

          <Suspense fallback={<ServerStatsSkeleton />}>
            <RightSidebar server={server} />
          </Suspense>
        </div>
      </div>
    </>
  );
}