"use server";

import { revalidateTag } from "next/cache";
import { generateSlug } from "@/utils/slug";

/**
 * Server action to revalidate server-related cache tags
 */
export async function revalidateServerCache(slug: string, categoryNames: string[] = []) {
  try {
    // Invalidate Next.js cache tags
    revalidateTag("servers");
    revalidateTag(`server-${slug}`);
    
    // Invalidate category-related caches
    for (const categoryName of categoryNames) {
      revalidateTag(`category-${generateSlug(categoryName)}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Failed to invalidate caches:", error);
    return { success: false, error };
  }
}