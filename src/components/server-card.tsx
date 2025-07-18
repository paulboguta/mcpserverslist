import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ServerCardProps {
  name: string;
  slug: string;
  shortDesc: string;
  homepageUrl?: string | null;
  logoUrl?: string | null;
  stars?: number | null;
  license?: string | null;
  createdAt: Date;
}

export function ServerCard({
  name,
  slug,
  shortDesc,
  homepageUrl,
  logoUrl,
  stars,
  license,
  createdAt,
}: ServerCardProps) {
  return (
    <Card className="h-full transition-shadow hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {logoUrl && (
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
                <Image
                  src={logoUrl}
                  alt={`${name} logo`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg leading-tight">{name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {stars && (
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Star className="h-3 w-3" />
                    <span>{stars}</span>
                  </div>
                )}
                {license && (
                  <Badge variant="secondary" className="text-xs">
                    {license}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            {homepageUrl && (
              <Link
                href={homepageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {shortDesc}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{createdAt.toLocaleDateString()}</span>
          </div>
          <Link
            href={`/server/${slug}`}
            className="text-primary hover:underline font-medium"
          >
            View details
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}