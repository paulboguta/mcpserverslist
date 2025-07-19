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
      return anthropic("claude-4-sonnet-20250514");
    case "google-flash-2-5":
      return google("gemini-2.5-flash-preview-05-20");
    case "google-pro-2-5":
      return google("gemini-2.5-pro-preview-05-06");
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

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const trackingProps: Record<string, any> = {
    action_type: properties?.action_type || "llm_generation",
    project: properties?.project || "mcpserverslist",
    provider: provider,
    ...properties,
  };

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return withTracing(baseModel as any, posthogClient, {
    posthogDistinctId: userId,
    posthogGroups: {
      action_type: trackingProps.action_type,
      project: trackingProps.project,
    },
    posthogProperties: trackingProps,
  }) as unknown as AIModel;
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
    provider: provider,
  });

  // Generate response from the model
  try {
    const response = await generateText({
      // biome-ignore lint/suspicious/noExplicitAny: <mvp>
      model: model as any,
      prompt: promptText,
      system: template.systemPrompt,
      temperature: 0.7,
    });

    return {
      text: response.text,
      usage: response.usage
        ? {
            inputTokens: (response.usage as any).promptTokens || 0,
            outputTokens: (response.usage as any).completionTokens || 0,
            totalTokens: (response.usage as any).totalTokens || 0,
          }
        : undefined,
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
): Promise<ObjectGenerationResponse<T>> => {
  // Format the prompt with variables (if any)
  const promptText = formatPrompt(template.template || "", variables || {});
  const model = getTracedModel(provider, userId);

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
      temperature: 0.7,
    });

    return {
      object: response.object as T,
      usage: response.usage
        ? {
            inputTokens: (response.usage as any).promptTokens || 0,
            outputTokens: (response.usage as any).completionTokens || 0,
            totalTokens: (response.usage as any).totalTokens || 0,
          }
        : undefined,
    };
  } catch (error) {
    console.error("Error generating structured object:", error);
    throw new Error(
      `Failed to generate structured response for ${provider}: ${error instanceof Error ? error.message : "Unknown error"}`,
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
