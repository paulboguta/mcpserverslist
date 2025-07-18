import { createServerActionProcedure } from "zsa";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const publicProcedure = createServerActionProcedure().handler(async () => {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });
  
  return session?.user || null;
});

export const adminProcedure = createServerActionProcedure()
  .handler(async () => {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      throw new Error("Not authenticated");
    }

    if (session.user.role !== "admin") {
      throw new Error("Not authorized - admin role required");
    }

    return { user: session.user };
  });