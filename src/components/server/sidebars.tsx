import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Server } from '@/lib/db/schema';
import { ServerStats } from './server-stats';

export async function RightSidebar({ server }: { server: Server }) {
  return (
    <aside className="hidden space-y-4 px-4 py-8 lg:block">
      <div className="space-y-6 pb-8 md:sticky md:top-24">
        <ServerStats
          stars={server.stars ?? 0}
          lastCommit={server.lastCommit ?? null}
          license={server.license}
          createdAt={server.createdAt}
        />
        {server.repoUrl && (
          <Button variant="outline" size="lg" className="w-full" asChild>
            <a href={server.repoUrl} target="_blank" rel="noopener noreferrer">
              <Icons.gitHub />
              View Repository
            </a>
          </Button>
        )}
        {/* Ad spot can be added here later */}
      </div>
    </aside>
  );
}