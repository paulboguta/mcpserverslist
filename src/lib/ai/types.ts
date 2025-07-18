import type { LanguageModelV1 } from "ai";
import type { z } from "zod";

/**
 * Supported provider types for AI models
 */
export type ProviderType =
  | "openai"
  | "anthropic"
  | "google-flash-2-5"
  | "google-pro-2-5";

/**
 * Response type enum for prompt templates
 */
export enum PromptResponseType {
  TEXT = "text",
  OBJECT = "object",
}

/**
 * Output strategy for object responses
 */
export enum ObjectOutputStrategy {
  ARRAY = "array",
  OBJECT = "object",
}

/**
 * Base interface for all prompt templates
 */
export interface PromptTemplateBase {
  id: string;
  name: string;
  description?: string;
  category?: string;
  version?: string;
}

/**
 * Text prompt template for generating unstructured text
 */
export interface TextPromptTemplate extends PromptTemplateBase {
  responseType: PromptResponseType.TEXT;
  template: string; // Template string with variables
  systemPrompt?: string; // Optional system prompt
}

/**
 * Object prompt template for generating structured data
 */
export interface ObjectPromptTemplate extends PromptTemplateBase {
  responseType: PromptResponseType.OBJECT;
  template?: string; // Optional template for context
  systemPrompt?: string; // Optional system prompt for additional context
  outputStrategy: ObjectOutputStrategy;
  // biome-ignore lint/suspicious/noExplicitAny: <any>
  schema: z.ZodType<any>; // Schema for the expected return object
  schemaName: string;
  schemaDescription?: string; // Optional description of the schema for context
}

/**
 * Union type for all prompt templates
 */
export type PromptTemplate = TextPromptTemplate | ObjectPromptTemplate;

/**
 * Type representing any supported AI model client
 */
export type AIModel = LanguageModelV1;

/**
 * Generation request parameters
 */
export interface GenerationRequest {
  provider: ProviderType;
  template: PromptTemplate;
  variables: Record<string, string>;
}

/**
 * Generation response for text prompts
 */
export interface TextGenerationResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Generation response for object prompts
 */
export interface ObjectGenerationResponse<T = unknown> {
  object: T;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Error response from AI generation
 */
export interface GenerationError {
  error: string;
  provider: ProviderType;
  timestamp: Date;
  details?: unknown;
}

export enum ModelProvider {
  GOOGLE = "google-flash-2-5",
  ANTHROPIC = "anthropic",
  GOOGLE_PRO_2_5 = "google-pro-2-5",
}

export interface AITemplate {
  id: string;
  name: string;
}

/**
 * PostHog tracking properties for LLM analytics
 */
export interface LLMTrackingProperties {
  action_type?: string; // Type of LLM action (e.g., "submission_analysis", "server_enrichment")
  project?: string; // Project identifier for multi-project tracking
  provider: ProviderType;
  template_id?: string;
  [key: string]: any;
}