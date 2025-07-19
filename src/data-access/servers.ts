"use server";

import { db } from "@/lib/db";
import { servers, categories, serversToCategories } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { generateSlug } from "@/utils/slug";

export interface CreateServerInput {
  name: string;
  homepageUrl: string;
  repoUrl?: string;
  docsUrl?: string;
  logoUrl?: string;
}

export interface UpdateServerStatsInput {
  serverId: string;
  stars: number;
  lastCommit: Date;
  license: string;
}

export interface UpdateServerContentInput {
  serverId: string;
  shortDesc: string;
  longDesc: string;
}

/**
 * Create a new server record in the database
 */
export async function createServer(input: CreateServerInput) {
  let slug = generateSlug(input.name);
  
  // Check if slug exists and generate unique one
  const existingServer = await db.select({ id: servers.id }).from(servers).where(eq(servers.slug, slug)).limit(1);
  if (existingServer.length > 0) {
    let counter = 1;
    let uniqueSlug = `${slug}-${counter}`;
    while (true) {
      const existing = await db.select({ id: servers.id }).from(servers).where(eq(servers.slug, uniqueSlug)).limit(1);
      if (existing.length === 0) {
        slug = uniqueSlug;
        break;
      }
      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }
  }
  
  const [newServer] = await db
    .insert(servers)
    .values({
      name: input.name,
      slug,
      shortDesc: "Processing...", // Temporary description
      homepageUrl: input.homepageUrl,
      repoUrl: input.repoUrl || null,
      docsUrl: input.docsUrl || null,
      logoUrl: input.logoUrl || null,
      stars: 0,
      lastCommit: new Date(),
      license: "unknown",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return newServer;
}

/**
 * Update server with GitHub repository stats
 */
export async function updateServerStats(input: UpdateServerStatsInput) {
  await db
    .update(servers)
    .set({
      stars: input.stars,
      lastCommit: input.lastCommit,
      license: input.license,
      updatedAt: new Date(),
    })
    .where(eq(servers.id, input.serverId));
}

/**
 * Update server with AI-generated content
 */
export async function updateServerContent(input: UpdateServerContentInput) {
  await db
    .update(servers)
    .set({
      shortDesc: input.shortDesc,
      longDesc: input.longDesc,
      updatedAt: new Date(),
    })
    .where(eq(servers.id, input.serverId));
}

/**
 * Get all existing categories
 */
export async function getAllCategories() {
  return await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories);
}

/**
 * Create new categories
 */
export async function createCategories(categoryNames: string[]) {
  if (categoryNames.length === 0) {
    return [];
  }

  const categoryValues = categoryNames.map(name => ({
    name,
    slug: generateSlug(name),
    sortOrder: 0,
  }));

  return await db
    .insert(categories)
    .values(categoryValues)
    .returning();
}

/**
 * Assign categories to a server
 */
export async function assignCategoriesToServer(serverId: string, categoryNames: string[]) {
  // First, remove existing category assignments
  await db.delete(serversToCategories).where(eq(serversToCategories.serverId, serverId));
  
  if (categoryNames.length === 0) {
    return [];
  }
  
  // Get category IDs
  const categoryRecords = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(inArray(categories.name, categoryNames));
  
  // Create new assignments
  const categoryAssignments = categoryRecords.map(cat => ({
    serverId,
    categoryId: cat.id,
  }));
  
  await db.insert(serversToCategories).values(categoryAssignments);
  
  return categoryRecords.map(cat => cat.name);
}

/**
 * Get server by ID
 */
export async function getServerById(serverId: string) {
  const [server] = await db
    .select()
    .from(servers)
    .where(eq(servers.id, serverId))
    .limit(1);
    
  return server;
}