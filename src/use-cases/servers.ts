import { getServers } from "@/lib/data-access/servers";
import { ITEMS_PER_PAGE } from "@/lib/search-params";
import { unstable_cache } from "next/cache";

export const getServersUseCase = unstable_cache(
  async ({
    page = 1,
    limit = ITEMS_PER_PAGE,
  }: {
    page?: number;
    limit?: number;
  }) => {
    const performanceCheck = performance.now();

    const { servers: serversResult, pagination } = await getServers({
      page,
      limit,
    });

    console.log(`Servers fetched in ${performance.now() - performanceCheck}ms`);
    console.log(
      `Parameters: ${JSON.stringify({
        page,
        limit,
      })}`
    );

    return {
      servers: serversResult,
      pagination,
    };
  },
  ['servers'],
  {
    revalidate: 86400, // 24 hours
    tags: ['servers'],
  }
);