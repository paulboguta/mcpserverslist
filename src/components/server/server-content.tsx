import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { SVG_PLACEHOLDER, getFaviconUrl } from '@/lib/favicon';
import { Server } from '@/lib/db/schema';
import { ArrowRightIcon, Command, HomeIcon } from 'lucide-react';
import Link from 'next/link';
import { Icons } from '../icons';
import ReactMarkdown from 'react-markdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ServerContentProps = {
  server: Server;
};

function ServerBreadcrumb({ serverName }: { serverName: string }) {
  return (
    <Breadcrumb className="hidden md:block">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/" className="inline-flex items-center gap-1.5">
            <HomeIcon size={16} aria-hidden="true" />
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/" className="inline-flex items-center gap-1.5">
            <Command size={16} aria-hidden="true" />
            MCP Servers
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{serverName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function ServerHeader({
  name,
  homepageUrl,
  repoUrl,
  docsUrl,
  logoUrl,
}: {
  name: string;
  homepageUrl: string | null;
  repoUrl: string | null;
  docsUrl: string | null;
  logoUrl: string | null;
}) {
  // Determine the best logo to use
  const displayLogo = (() => {
    if (logoUrl && !logoUrl.includes('favicons?domain=')) {
      return logoUrl;
    }
    if (homepageUrl) {
      return getFaviconUrl(homepageUrl);
    }
    if (logoUrl) {
      return logoUrl;
    }
    return SVG_PLACEHOLDER;
  })();

  const primaryUrl = homepageUrl || repoUrl;

  return (
    <div className="space-y-4 lg:flex lg:items-start lg:justify-between lg:space-y-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-300/10 p-1.5">
          <OptimizedImage
            src={displayLogo}
            alt={`${name} logo`}
            width={32}
            height={32}
            className="rounded-sm"
            isIcon
          />
        </div>
        <h1 className="text-3xl font-bold">{name}</h1>
      </div>
      <div className="flex gap-4">
        {primaryUrl && (
          <Button className="group" variant="secondary" asChild>
            <a href={primaryUrl} target="_blank" rel="noopener noreferrer">
              Visit {name}
              <ArrowRightIcon
                className="-me-1 opacity-60 transition-transform group-hover:translate-x-0.5"
                size={16}
                aria-hidden="true"
              />
            </a>
          </Button>
        )}
        {docsUrl && (
          <Button variant="outline" asChild>
            <a href={docsUrl} target="_blank" rel="noopener noreferrer">
              <Icons.book className="mr-2 h-4 w-4" />
              Documentation
            </a>
          </Button>
        )}
        {/* Mobile only */}
        {repoUrl && (
          <Button variant="outline" asChild className="lg:hidden">
            <Link href={repoUrl} target="_blank" rel="noopener noreferrer">
              <Icons.gitHub className="mr-2 h-4 w-4" />
              View Repository
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function UniversalInstallGuide({ serverName }: { serverName: string }) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-6">
      <h3 className="text-lg font-semibold">Universal Installation Guide</h3>
      <p className="text-sm text-muted-foreground">
        This MCP server works with Claude Desktop, Cursor, Windsurf, Cline, and other MCP-compatible clients.
      </p>
      <div className="space-y-3">
        <div className="space-y-2">
          <h4 className="font-medium">1. Install via NPM (recommended)</h4>
          <pre className="rounded bg-black/80 p-3 text-sm">
            <code className="text-green-400">npm install -g {serverName}</code>
          </pre>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium">2. Configure your MCP client</h4>
          <p className="text-sm text-muted-foreground">
            Add the server to your MCP client configuration. The exact steps depend on your client:
          </p>
          <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
            <li>Claude Desktop: Edit claude_desktop_config.json</li>
            <li>Cursor/Windsurf: Add to MCP settings</li>
            <li>Cline: Configure in extension settings</li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium">3. Restart your client</h4>
          <p className="text-sm text-muted-foreground">
            Restart your MCP client to load the new server configuration.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ServerContent({ server }: ServerContentProps) {
  return (
    <div className="space-y-8">
      <ServerBreadcrumb serverName={server.name} />
      <ServerHeader
        name={server.name}
        homepageUrl={server.homepageUrl}
        repoUrl={server.repoUrl}
        docsUrl={server.docsUrl}
        logoUrl={server.logoUrl}
      />
      <p className="text-muted-foreground text-lg">{server.shortDesc}</p>
      
      <Tabs defaultValue="installation" className="w-full">
        <TabsList className="w-fit max-w-[200px] grid grid-cols-2">
          <TabsTrigger value="installation">Installation</TabsTrigger>
          <TabsTrigger value="readme">README</TabsTrigger>
        </TabsList>
        
        <TabsContent value="installation" className="mt-6">
          <UniversalInstallGuide serverName={server.name} />
        </TabsContent>
        
        <TabsContent value="readme" className="mt-6">
          {server.readmeContent ? (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <ReactMarkdown>{server.readmeContent}</ReactMarkdown>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">README content not available yet.</p>
              {server.repoUrl && (
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <a href={`${server.repoUrl}#readme`} target="_blank" rel="noopener noreferrer">
                    View on GitHub
                  </a>
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}