import { z } from "zod";
import {
  type ObjectPromptTemplate,
  PromptResponseType,
  ObjectOutputStrategy,
} from "../types";

// JSON Schema for Claude Sonnet 4 compatibility (AI SDK v4 bug workaround)
export const categorizeServerJsonSchema = {
  type: "object" as const,
  properties: {
    categories: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "Existing categories that match the MCP server",
    },
    categoriesToAdd: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "New categories to be created if none exist",
    },
  },
  required: ["categories", "categoriesToAdd"] as const,
};

// Keep Zod schema for type inference
export const categorizeServerSchema = z.object({
  categories: z
    .array(z.string())
    .describe("Existing categories that match the MCP server"),
  categoriesToAdd: z
    .array(z.string())
    .describe("New categories to be created if none exist"),
});

export type CategorizeServerResponse = z.infer<typeof categorizeServerSchema>;

export const categorizeServerTemplate: ObjectPromptTemplate = {
  id: "categorize-server",
  name: "Categorize MCP Server",
  description: "Categorize MCP servers into relevant categories",
  category: "categorization",
  responseType: PromptResponseType.OBJECT,
  outputStrategy: ObjectOutputStrategy.OBJECT,
  schema: categorizeServerSchema,
  jsonSchema: categorizeServerJsonSchema,
  schemaName: "CategorizeServerResponse",
  schemaDescription:
    "Categorization result with existing categories and new categories to add",
  systemPrompt:
    "You are an expert at categorizing MCP (Model Context Protocol) servers. Focus on what the MCP server does functionally, not the technology stack. Remember: these are MCP servers, not general open source projects.",
  template: `You are tasked to assign the following MCP server to the most relevant category/categories.

You are given the server details and current list of categories in the database. You should assign the server to the relevant categories, but if none of them are relevant, you should add a new category.

**Server Name:** {{serverName}}
**Existing Categories:** {{categories}}
**Additional Context:** {{additionalContext}}
**Short Description:** {{shortDescription}}
**Long Description:** {{longDescription}}

Examples of good MCP server categories: "API Tools", "File Management", "Database", "Web Scraping", "AI/ML", "Development Tools", "System Monitoring", "Data Processing", "Communication", "Authentication".

**IMPORTANT OUTPUT FORMAT:**
You MUST return a JSON object with exactly these two properties:
- "categories": array of existing category names that match this server
- "categoriesToAdd": array of new category names to create if no existing ones fit

**Example Output:**
{
  "categories": ["API Tools", "Development Tools"],
  "categoriesToAdd": ["Documentation"]
}

**Another Example (when no existing categories match):**
{
  "categories": [],
  "categoriesToAdd": ["Cloud Storage", "File Sync"]
}

Requirements:
- Focus on what the MCP server does functionally, not the technology stack
- You should not force assigning categories if there are no relevant ones - just add new categories
- Keep category names short and focused on MCP server functionality
- Assign 1-3 categories maximum
- Remember: these are MCP servers, not general open source projects`,
};
