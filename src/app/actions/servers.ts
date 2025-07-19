"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { servers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { adminProcedure } from "@/lib/safe-action";

const createServerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  shortDesc: z.string().min(1, "Short description is required").max(160),
  longDesc: z.string().optional(),
  homepageUrl: z.string().url().optional().or(z.literal("")),
  repoUrl: z.string().url().optional().or(z.literal("")),
  docsUrl: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  stars: z.number().int().min(0).optional(),
  license: z.string().optional(),
});

const updateServerSchema = createServerSchema.extend({
  id: z.string().uuid("Invalid server ID"),
});

const deleteServerSchema = z.object({
  id: z.string().uuid("Invalid server ID"),
});

// Server function to list servers (for server components)
export async function getServers() {
  const allServers = await db.select().from(servers);
  return allServers;
}

// Admin actions
export const createServerAction = adminProcedure
  .createServerAction()
  // biome-ignore lint/suspicious/noExplicitAny: <zod - zsa conflict>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .input(createServerSchema as any)
  .handler(async ({ input }) => {
    const [newServer] = await db.insert(servers).values(input).returning();

    // Revalidate cache
    revalidateTag("servers");

    return newServer;
  });

export const updateServerAction = adminProcedure
  .createServerAction()
  // biome-ignore lint/suspicious/noExplicitAny: <zod - zsa conflict>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .input(updateServerSchema as any)
  .handler(async ({ input }) => {
    const { id, ...data } = input;

    const [updatedServer] = await db
      .update(servers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(servers.id, id))
      .returning();

    if (!updatedServer) {
      throw new Error("Server not found");
    }

    // Revalidate cache
    revalidateTag("servers");

    return updatedServer;
  });

export const deleteServerAction = adminProcedure
  .createServerAction()
  // biome-ignore lint/suspicious/noExplicitAny: <zod - zsa conflict>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .input(deleteServerSchema as any)
  .handler(async ({ input }) => {
    const deleted = await db
      .delete(servers)
      .where(eq(servers.id, input.id))
      .returning();

    if (!deleted.length) {
      throw new Error("Server not found");
    }

    // Revalidate cache
    revalidateTag("servers");

    return { success: true };
  });

export const revalidateCacheAction = adminProcedure
  .createServerAction()
  // biome-ignore lint/suspicious/noExplicitAny: <zod - zsa conflict>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .input(z.object({ tag: z.string() }) as any)
  .handler(async ({ input }) => {
    revalidateTag(input.tag);
    return { success: true };
  });
