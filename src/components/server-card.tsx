import { Icons } from '@/components/icons';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Separator } from '@/components/ui/separator';
import { SVG_PLACEHOLDER, getFaviconUrl } from '@/lib/favicon';
import { format } from 'date-fns';
import Link from 'next/link';

type ServerCardProps = {
  slug: string;
  name: string;
  shortDesc: string;
  logoUrl?: string | null;
  homepageUrl?: string | null;
  stars?: number | null;
  license?: string | null;
  lastCommit?: Date | null;
  categories?: string[];
};

export function ServerCard({
  slug,
  name,
  shortDesc,
  logoUrl,
  homepageUrl,
  stars,
  license,
  lastCommit,
  categories,
}: ServerCardProps) {
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
  return (
    <Link href={`/server/${slug}`} className="block" prefetch={false}>
      <div className="border-border/50 bg-card hover:bg-muted/10 hover:border-ring/20 ring-ring/8 relative flex h-full flex-col rounded-lg border p-6 shadow-xs transition-all hover:ring-[3px]">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 leading-none font-semibold tracking-tight">
              <OptimizedImage
                src={displayLogo}
                alt={`${name} logo`}
                width={20}
                height={20}
                className="rounded-sm"
                isIcon
              />
              <span className="text-foreground">{name}</span>
            </h3>
            <p className="text-muted-foreground line-clamp-3 min-h-[60px] text-sm">{shortDesc}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {/* Categories */}
          {categories && categories.length > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Icons.tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground text-[13px]">
                {categories.slice(0, 2).join(', ')}
                {categories.length > 2 && ` +${categories.length - 2}`}
              </span>
            </div>
          )}
          
          {/* GitHub stats and metadata */}
          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            {stars !== null && stars !== undefined && (
              <div className="flex items-center gap-1">
                <Icons.gitHub className="h-4 w-4" />
                <span className="text-[13px]">{stars.toLocaleString()} stars</span>
              </div>
            )}
            
            {lastCommit && (
              <>
                {stars !== null && stars !== undefined && (
                  <Separator orientation="vertical" className="h-4" />
                )}
                <span className="text-[13px]">Last commit {format(lastCommit, 'MMM d, yyyy')}</span>
              </>
            )}
            
            {license && license !== 'other' && license !== 'unknown' && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <span className="uppercase text-[13px]">{license}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}