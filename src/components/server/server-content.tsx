import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { SVG_PLACEHOLDER, getFaviconUrl } from "@/lib/favicon";
import type { Server } from "@/lib/db/schema";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Icons } from "../icons";

type ServerContentProps = {
  server: Server;
};

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
    // Priority 1: If logoUrl is provided (already a favicon URL), use it directly
    if (logoUrl) {
      return logoUrl;
    }
    // Priority 2: If we have a homepage URL, generate favicon from it
    if (homepageUrl) {
      return getFaviconUrl(homepageUrl);
    }
    // Finally, use placeholder
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

function UniversalInstallGuide({
  serverName,
  repoUrl,
}: { serverName: string; repoUrl?: string | null }) {
  return (
    <div className="space-y-6 rounded-lg border border-border bg-muted/30 p-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Install in Cursor</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Go to: Settings → Cursor Settings → MCP → Add new global MCP server
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Pasting the following configuration into your Cursor
          ~/.cursor/mcp.json file is the recommended approach. You may also
          install in a specific project by creating .cursor/mcp.json in your
          project folder. See Cursor MCP docs for more info.
        </p>
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Example using context7 MCP. For direct
            installation guide of <strong>{serverName}</strong>,
            {repoUrl ? (
              <>
                {" "}
                go to their{" "}
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline font-medium"
                >
                  repository
                </a>
              </>
            ) : (
              " check their documentation"
            )}
            .
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Cursor Remote Server Connection</h4>
          <pre className="rounded bg-black/80 p-3 text-sm overflow-x-auto">
            <code className="text-green-400">{`{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/mcp"
    }
  }
}`}</code>
          </pre>
        </div>

        <div>
          <h4 className="font-medium mb-2">Cursor Local Server Connection</h4>
          <pre className="rounded bg-black/80 p-3 text-sm overflow-x-auto">
            <code className="text-green-400">{`{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export function ServerContent({ server }: ServerContentProps) {
  return (
    <div className="space-y-8">
      <ServerHeader
        name={server.name}
        homepageUrl={server.homepageUrl}
        repoUrl={server.repoUrl}
        docsUrl={server.docsUrl}
        logoUrl={server.logoUrl}
      />
      <p className="text-muted-foreground text-lg">{server.shortDesc}</p>

      <div className="mt-8">
        <UniversalInstallGuide
          serverName={server.name}
          repoUrl={server.repoUrl}
        />
      </div>
    </div>
  );
}
