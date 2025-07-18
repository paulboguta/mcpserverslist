import { db } from "@/lib/db";
import { servers } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const getServers = async ({
  page = 1,
  limit = 12,
}: {
  page?: number;
  limit?: number;
}) => {
  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Basic query - no sorting for now, just by created_at DESC
  const orderByClause = sql`servers.created_at DESC`;

  // Basic condition - no search for now
  const condition = sql`1 = 1`;

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