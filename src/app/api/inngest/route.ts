import { inngest } from "@/inngest/client";
import { handleServerCreated } from "@/inngest/functions";

import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [handleServerCreated],
});
