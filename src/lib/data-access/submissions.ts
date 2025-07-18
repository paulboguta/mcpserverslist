import { eq, or } from "drizzle-orm";
import { db } from "../db";
import { submissions, servers, type NewSubmission } from "../db/schema";

export async function createSubmission(data: NewSubmission) {
  const [submission] = await db.insert(submissions).values(data).returning();
  return submission;
}

export async function checkIfSubmissionExists(repoUrl: string) {
  const [existingSubmission] = await db
    .select()
    .from(submissions)
    .where(eq(submissions.repoUrl, repoUrl))
    .limit(1);

  return !!existingSubmission;
}

export async function checkIfServerExists(repoUrl: string) {
  const [existingServer] = await db
    .select()
    .from(servers)
    .where(eq(servers.repoUrl, repoUrl))
    .limit(1);

  return !!existingServer;
}