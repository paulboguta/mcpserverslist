"use server";

import { authClient } from "@/lib/auth-client";
import { publicProcedure } from "@/lib/safe-action";


export const getCurrentUserAction = publicProcedure
  .createServerAction()
  .handler(async () => {
    const session = await authClient.getSession();
    return session.data?.user || null;
  });

export const signOutAction = publicProcedure
  .createServerAction()
  .handler(async () => {
    await authClient.signOut();
    return { success: true };
  });