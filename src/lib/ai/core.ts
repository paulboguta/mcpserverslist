/* eslint-disable @typescript-eslint/no-explicit-any */
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { withTracing } from "@posthog/ai";
import { generateObject, generateText } from "ai";
import { posthogClient } from "@/lib/analytics/posthog";
import { formatPrompt } from "./prompts";
import type {
  AIModel,
  GenerationError,
  LLMTrackingProperties,
  ObjectGenerationResponse,
  ObjectPromptTemplate,
  ProviderType,
  TextGenerationResponse,
  TextPromptTemplate,
} from "./types";

/**
 * Get the appropriate model client based on provider type
 */
export const getModelForProvider = (provider: ProviderType): AIModel => {
  switch (provider) {
    case "openai":
      return openai("gpt-4");
    case "anthropic":
      return anthropic("claude-3-5-sonnet-20241022");
    case "google-flash-2-5":
      return google("gemini-2.0-flash-exp");
    case "google-pro-2-5":
      return google("gemini-2.0-pro-exp");
    default:
      throw new Error(`Provider ${provider} not supported`);
  }
};

/**
 * Get model with PostHog tracing if userId provided
 */
const getTracedModel = (
  provider: ProviderType,
  userId?: string,
  properties?: LLMTrackingProperties,
) => {
  const baseModel = getModelForProvider(provider);

  if (!userId) {
    return baseModel;
  }

  const trackingProps: Record<string, any> = {
    action_type: properties?.action_type || "llm_generation",
    project: properties?.project || "mcpserverslist",
    provider: provider,
    ...properties,
  };

  return withTracing(baseModel, posthogClient, {
    posthogDistinctId: userId,
    posthogGroups: {
      action_type: trackingProps.action_type,
      project: trackingProps.project,
    },
    posthogProperties: trackingProps,
  });
};

/**
 * Generate text using a text prompt template
 */
export const runTextPrompt = async (
  provider: ProviderType,
  template: TextPromptTemplate,
  variables: Record<string, string>,
  userId?: string,
  trackingProperties?: LLMTrackingProperties,
): Promise<TextGenerationResponse> => {
  // Format the prompt with variables
  const promptText = formatPrompt(template.template, variables);
  const model = getTracedModel(provider, userId, {
    ...trackingProperties,
    template_id: template.id,
  });

  // Generate response from the model
  try {
    const response = await generateText({
      // biome-ignore lint/suspicious/noExplicitAny: <mvp>
      model: model as any,
      prompt: promptText,
      system: template.systemPrompt,
      temperature: 0.7,
      maxTokens: 2000,
    });

    return {
      text: response.text,
      usage: response.usage,
    };
  } catch (error) {
    console.error("Error generating text:", error);
    throw new Error(
      `Failed to generate text response for ${provider}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
};

/**
 * Generate object using an object prompt template
 */
export const runObjectPrompt = async <T>(
  provider: ProviderType,
  template: ObjectPromptTemplate,
  variables: Record<string, string>,
  userId?: string,
  trackingProperties?: LLMTrackingProperties,
): Promise<ObjectGenerationResponse<T>> => {
  // Format the prompt with variables (if any)
  const promptText = formatPrompt(template.template || "", variables || {});
  const model = getTracedModel(provider, userId, {
    ...trackingProperties,
    template_id: template.id,
  });

  // Generate structured object from the model
  try {
    const response = await generateObject({
      // biome-ignore lint/suspicious/noExplicitAny: <mvp>
      model: model as any,
      schema: template.schema,
      schemaName: template.schemaName,
      schemaDescription: template.schemaDescription,
      system: template.systemPrompt,
      prompt: promptText,
      output: "object",
      temperature: 0.7,
      maxTokens: 2000,
    });

    return {
      object: response.object as T,
      usage: response.usage,
    };
  } catch (error) {
    console.error("Error generating structured object:", error);
    throw new Error(
      `Failed to generate structured response for ${provider}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
};

/**
 * Helper function to handle generation errors consistently
 */
export const handleGenerationError = (
  error: unknown,
  provider: ProviderType,
): GenerationError => {
  return {
    error: error instanceof Error ? error.message : "Unknown error occurred",
    provider,
    timestamp: new Date(),
    details: error,
  };
};