"use server";

import { adminProcedure } from "@/lib/safe-action";
import { uploadLogo } from "@/lib/r2-upload";
import { z } from "zod";

export const uploadLogoAction = adminProcedure
  .createServerAction()
  .input(z.object({
    file: z.instanceof(File),
  }))
  .handler(async ({ input }) => {
    const logoUrl = await uploadLogo(input.file);
    return { logoUrl };
  });