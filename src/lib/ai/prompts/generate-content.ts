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
    },
    longDescription: {
      type: "string" as const,
      description: "A detailed description of the MCP server's capabilities and use cases"
    },
    features: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "Key features or highlights of the MCP server"
    }
  },
  required: ["summary", "longDescription", "features"] as const
};

// Keep Zod schema for type inference
export const generateContentSchema = z.object({
  summary: z
    .string()
    .describe("A brief, one-sentence overview of the MCP server (max 160 characters for SEO)"),
  longDescription: z
    .string()
    .describe("A detailed description of the MCP server's capabilities and use cases"),
  features: z
    .array(z.string())
    .describe("Key features or highlights of the MCP server"),
});

export type GenerateContentResponse = z.infer<typeof generateContentSchema>;

export const generateContentTemplate: ObjectPromptTemplate = {
  id: "generate-content",
  name: "Generate MCP Server Content",
  description: "Generate summary, description, and features for MCP servers",
  category: "content-generation",
  version: "1.0.0",
  responseType: PromptResponseType.OBJECT,
  outputStrategy: ObjectOutputStrategy.OBJECT,
  schema: generateContentSchema,
  jsonSchema: generateContentJsonSchema,
  schemaName: "GenerateContentResponse",
  schemaDescription: "Generated content for MCP server including summary, description, and features",
  systemPrompt: "You are an expert at summarizing and extracting key features from MCP (Model Context Protocol) servers. Focus on what the server does and its core value proposition, the specific capabilities it provides to AI models, and real-world use cases.",
  template: `Given the following inputs about an MCP server, generate a concise summary, detailed description, and key features.

**Server Name:** {{serverName}}
**Homepage URL:** {{homepageUrl}}
**Repository URL:** {{repoUrl}}
**Documentation URL:** {{docsUrl}}
**Additional Context:** {{additionalContext}}
**Repository Stats:** {{repoStats}}
**Repository README:** {{repoReadme}}

Focus on:
- What the MCP server does and its core value proposition
- The specific capabilities it provides to AI models
- The APIs, tools, or resources it exposes
- Real-world use cases and applications
- Technical capabilities without getting into implementation details

Summary Guidelines:
- Keep it under 160 characters for SEO
- Make it engaging and clear
- Focus on the server's primary function
- Treat it as a tagline that would appear in search results
- Don't start with "MCP Server that" or "This MCP Server provides" just go straight away to "Does XYZ"

Long Description Guidelines:
- Provide comprehensive details about the server's capabilities
- Explain what problems it solves
- Describe the main features and functionality
- Keep it focused on the product, not installation or setup
- Make it informative for users deciding whether to use this server

Features Guidelines:
- List 3-6 key features or capabilities
- Each feature should be concise and specific
- Focus on what the server can do, not how it works internally
- Use clear, non-technical language when possible

Requirements:
- You don't mention installation steps or other setup-related information
- You focus on the MCP server's capabilities and use cases
- Summary must be under 160 characters for SEO optimization
- Remember: these are MCP servers that provide capabilities to AI models`,
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

