"use server";

import { inngest } from "@/inngest/client";
import type { CreateServerData } from "@/inngest/functions";

export async function triggerServerCreation(data: CreateServerData) {
  try {
    const result = await inngest.send({
      name: "server/created",
      data
    });
    return { success: true, result };
  } catch (error) {
    console.error("Failed to trigger server creation:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}