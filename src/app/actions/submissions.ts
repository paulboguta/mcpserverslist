"use server";

import {
  createSubmission,
  checkIfSubmissionExists,
  checkIfServerExists,
} from "@/lib/data-access/submissions";
import { submitServerSchema } from "@/types/submission";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { createServerAction } from "zsa";
import { headers } from "next/headers";

export const submitServer = createServerAction()
  // biome-ignore lint/suspicious/noExplicitAny: <zod - zsa conflict>
  .input(submitServerSchema as any)
  .handler(async ({ input }) => {
    try {
      // Rate limiting check
      const headersList = await headers();
      const request = new Request("http://localhost", {
        headers: headersList,
      });
      const clientIP = getClientIP(request);
      
      const rateLimitResult = await checkRateLimit(clientIP, "submissions");
      
      if (!rateLimitResult.success) {
        return {
          success: false,
          message: `Rate limit exceeded. You can submit ${rateLimitResult.limit} servers per hour. Try again at ${rateLimitResult.resetTime.toLocaleTimeString()}.`,
        };
      }
      // Check if server already exists in the servers table
      const serverExists = await checkIfServerExists(input.repoUrl);
      
      if (serverExists) {
        return {
          success: false,
          message: "This MCP server already exists in our directory.",
        };
      }

      // Check if submission already exists
      const submissionExists = await checkIfSubmissionExists(input.repoUrl);
      
      if (submissionExists) {
        return {
          success: false,
          message: "This MCP server has already been submitted and is pending review.",
        };
      }

      // Create new submission
      const submission = await createSubmission(input);

      return {
        success: true,
        message: "MCP server submitted successfully! We'll review it shortly.",
        data: submission,
      };
    } catch (error) {
      console.error("Error submitting MCP server:", error);
      return {
        success: false,
        message: "An error occurred while submitting your MCP server.",
      };
    }
  });