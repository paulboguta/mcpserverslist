import { Suspense } from "react";
import { ServersContent } from "@/components/servers-content";
import { SkeletonServersContent } from "@/components/skeletons";
import { Toolbar } from "@/components/toolbar/toolbar";
import { ToolbarSkeleton } from "@/components/toolbar/toolbar-skeleton";
import { SERVERS_SORT_OPTIONS, DEFAULT_SORT_SERVERS } from "@/config/sorting";
import type { ServerSortField } from "@/types/sorting";
import type { SearchParams } from "nuqs/server";

export const revalidate = 3600; // 1 hour

export async function generateStaticParams() {
  // Return empty array for root page - it will be statically generated
  return [];
}

export default async function HomePage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div>
      <section className="mx-auto mb-6 flex flex-col gap-3 px-8 py-12 lg:py-20">
        <h1 className="text-3xl leading-[1.1] font-bold tracking-tight">
          Discover All MCP Servers
        </h1>
        <p className="text-muted-foreground text-lg">
          A public directory for AI-curious engineers and CTOs to discover Model
          Context Protocol servers
        </p>
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
  );
}
