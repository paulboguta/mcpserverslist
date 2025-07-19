"use server";

import { adminProcedure } from "@/lib/safe-action";
import { uploadLogo } from "@/lib/r2-upload";
import { z } from "zod";

export const uploadLogoAction = adminProcedure
  .createServerAction()
  // biome-ignore lint/suspicious/noExplicitAny: <zod - zsa conflict>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .input(z.object({ file: z.instanceof(File) }) as any)
  .handler(async ({ input }) => {
    const logoUrl = await uploadLogo(input.file);
    return { logoUrl };
  });
