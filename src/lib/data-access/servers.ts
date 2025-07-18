import { db } from "@/lib/db";
import { servers } from "@/lib/db/schema";
import { sql, or, ilike } from "drizzle-orm";
import { DEFAULT_SORT_SERVERS } from "@/config/sorting";

export const getServers = async ({
  searchQuery = '',
  page = 1,
  limit = 12,
  sortField = DEFAULT_SORT_SERVERS.field,
  sortDirection = DEFAULT_SORT_SERVERS.direction,
}: {
  searchQuery?: string;
  page?: number;
  limit?: number;
  sortField?: string;
  sortDirection?: string;
}) => {
  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Build the ORDER BY clause
  const orderByClause = (() => {
    if (sortField === 'name') {
      return sortDirection === 'asc' ? sql`servers.name ASC` : sql`servers.name DESC`;
    }

    if (sortField === 'stars') {
      return sortDirection === 'asc' ? sql`servers.stars ASC` : sql`servers.stars DESC`;
    }

    if (sortField === 'lastCommit') {
      return sortDirection === 'asc'
        ? sql`servers.last_commit ASC`
        : sql`servers.last_commit DESC`;
    }

    return sortDirection === 'asc' ? sql`servers.created_at ASC` : sql`servers.created_at DESC`;
  })();

  // Build the WHERE condition
  let condition = sql`1 = 1`;

  // Apply search if query exists
  if (searchQuery && searchQuery.trim()) {
    // For full-text search using the tsv column
    const searchCondition = sql`servers.tsv @@ plainto_tsquery('english', ${searchQuery})`;

    // Fallback to ILIKE search for partial matches
    const fallbackCondition = or(
      ilike(servers.name, `%${searchQuery}%`),
      ilike(servers.shortDesc, `%${searchQuery}%`),
      ilike(servers.longDesc, `%${searchQuery}%`)
    );

    // Combine both conditions with OR
    condition = sql`${condition} AND (${or(searchCondition, fallbackCondition)})`;
  }

  // Select fields
  const selectFields = {
    id: servers.id,
    name: servers.name,
    slug: servers.slug,
    shortDesc: servers.shortDesc,
    homepageUrl: servers.homepageUrl,
    repoUrl: servers.repoUrl,
    logoUrl: servers.logoUrl,
    stars: servers.stars,
    license: servers.license,
    createdAt: servers.createdAt,
  };

  // Add rank field for search queries
  if (searchQuery && searchQuery.trim()) {
    Object.assign(selectFields, {
      rank: sql<number>`ts_rank(servers.tsv, plainto_tsquery('english', ${searchQuery}))`,
    });
  }

  // Optimize query execution by running count and data fetch in parallel
  const resultsPromise = db
    .select(selectFields)
    .from(servers)
    .where(condition)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  const totalCountPromise = db.$count(servers, condition);

  // Execute both queries in parallel for better performance
  const [results, totalCount] = await Promise.all([resultsPromise, totalCountPromise]);

  return {
    servers: results,
    pagination: {
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  };
};