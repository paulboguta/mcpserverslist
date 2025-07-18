import { getServers } from "@/lib/data-access/servers";
import { ITEMS_PER_PAGE } from "@/lib/search-params";
import { DEFAULT_SORT_SERVERS } from "@/config/sorting";
import { unstable_cache } from "next/cache";

export const getServersUseCase = unstable_cache(
  async ({
    searchQuery = '',
    page = 1,
    limit = ITEMS_PER_PAGE,
    sortField = DEFAULT_SORT_SERVERS.field,
    sortDirection = DEFAULT_SORT_SERVERS.direction,
  }: {
    searchQuery?: string;
    page?: number;
    limit?: number;
    sortField?: string;
    sortDirection?: string;
  }) => {
    const performanceCheck = performance.now();

    const { servers: serversResult, pagination } = await getServers({
      searchQuery,
      page,
      limit,
      sortField,
      sortDirection,
    });

    console.log(`Servers fetched in ${performance.now() - performanceCheck}ms`);
    console.log(
      `Parameters: ${JSON.stringify({
        searchQuery,
        page,
        limit,
        sortField,
        sortDirection,
      })}`
    );

    return {
      servers: serversResult,
      pagination,
      sorting: {
        field: sortField,
        direction: sortDirection,
      },
    };
  },
  ['servers'],
  {
    revalidate: 86400, // 24 hours
    tags: ['servers'],
  }
);