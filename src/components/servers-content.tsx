import { getServersUseCase } from "@/use-cases/servers";
import { ITEMS_PER_PAGE, loadSearchParams } from "@/lib/search-params";
import { DEFAULT_SORT_SERVERS } from "@/config/sorting";
import type { SearchParams } from "nuqs/server";
import { Pagination } from "./pagination";
import { ServerCard } from "./server-card";

export async function ServersContent({
  searchParams,
}: { searchParams: SearchParams }) {
  const { q, sort, dir, page } = await loadSearchParams(searchParams);

  const currentPage = page ? Number(page) : 1;

  const result = await getServersUseCase({
    searchQuery: q as string,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    sortField: sort ?? DEFAULT_SORT_SERVERS.field,
    sortDirection: dir ?? DEFAULT_SORT_SERVERS.direction,
  });

  const { servers: paginatedServers, pagination } = result;

  return (
    <>
      {paginatedServers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedServers.map((server) => (
            <ServerCard
              key={server.id}
              name={server.name}
              slug={server.slug}
              shortDesc={server.shortDesc}
              logoUrl={server.logoUrl}
              homepageUrl={server.homepageUrl}
              stars={server.stars}
              license={server.license}
            />
          ))}
        </div>
      ) : (
        <div className="col-span-2 py-8 text-center mx-auto">
          <h3 className="text-muted-foreground text-lg font-medium">
            No servers found
          </h3>
          <p className="text-muted-foreground mt-1">
            Check back later for new MCP servers
          </p>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination totalPages={pagination.totalPages} />
        </div>
      )}
    </>
  );
}
