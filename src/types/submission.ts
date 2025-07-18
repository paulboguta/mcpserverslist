import { z } from "zod";

export const submitServerSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  serverName: z
    .string()
    .min(1, "Server name is required")
    .max(255, "Server name too long"),
  repoUrl: z.string().url("Invalid repository URL").max(255, "URL too long"),
  description: z.string().optional(),
});

export type SubmitServerInput = z.infer<typeof submitServerSchema>;