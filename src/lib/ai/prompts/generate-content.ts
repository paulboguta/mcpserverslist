import { z } from "zod";
import {
  type ObjectPromptTemplate,
  PromptResponseType,
  ObjectOutputStrategy,
} from "../types";

// JSON Schema for Claude Sonnet 4 compatibility (AI SDK v4 bug workaround)
export const generateContentJsonSchema = {
  type: "object" as const,
  properties: {
    summary: {
      type: "string" as const,
      description: "A brief, one-sentence overview of the MCP server (max 160 characters for SEO)"
    }
  },
  required: ["summary"] as const
};

// Keep Zod schema for type inference
export const generateContentSchema = z.object({
  summary: z
    .string()
    .describe("A brief, one-sentence overview of the MCP server (max 160 characters for SEO)"),
});

export type GenerateContentResponse = z.infer<typeof generateContentSchema>;

export const generateContentTemplate: ObjectPromptTemplate = {
  id: "generate-content",
  name: "Generate MCP Server Summary",
  description: "Generate a concise summary for MCP servers",
  category: "content-generation",
  version: "1.0.0",
  responseType: PromptResponseType.OBJECT,
  outputStrategy: ObjectOutputStrategy.OBJECT,
  schema: generateContentSchema,
  jsonSchema: generateContentJsonSchema,
  schemaName: "GenerateContentResponse",
  schemaDescription: "Generated summary for MCP server",
  systemPrompt: "You are an expert at summarizing MCP (Model Context Protocol) servers. Create concise, engaging summaries that explain what the server does.",
  template: `Given the following inputs about an MCP server, generate a concise summary.

**Server Name:** {{serverName}}
**Homepage URL:** {{homepageUrl}}
**Repository URL:** {{repoUrl}}
**Repository README:** {{repoReadme}}

Generate a summary that:
- Is under 160 characters for SEO
- Clearly explains what the server does
- Focuses on the primary function/capability
- Is engaging and clear
- Doesn't start with "MCP Server that" or "This MCP Server provides" 
- Goes straight to describing what it does (e.g. "Manages cloud infrastructure", "Provides weather data", etc.)

Keep it simple and focused on the core value proposition.`,
};

export interface GenerateContentInput {
  serverName: string;
  homepageUrl?: string;
  repoUrl?: string;
  docsUrl?: string;
  additionalContext?: string;
  repoReadme?: string;
  repoStats?: {
    stars: number;
    forks: number;
    license: string;
    lastCommit: Date;
  };
}

