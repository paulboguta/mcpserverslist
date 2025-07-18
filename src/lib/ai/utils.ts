import { ModelProvider } from "./types";

interface Usage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// Pricing per million tokens
const PRICING = {
  [ModelProvider.ANTHROPIC]: {
    input: 3.0,
    output: 15.0,
  },
  [ModelProvider.GOOGLE]: {
    input: 0.3,
    output: 2.5,
  },
  [ModelProvider.GOOGLE_PRO_2_5]: {
    input: 1.25,
    output: 10,
  },
};

/**
 * Calculates the cost of an AI prompt based on token usage and provider.
 * @param usage - The token usage object from the AI provider.
 * @param provider - The AI provider used.
 * @returns The calculated cost in USD.
 */
export function calculatePromptCost(
  usage: Usage,
  provider: ModelProvider,
): number {
  const prices = PRICING[provider];
  if (!prices) {
    console.warn(`No pricing information for provider: ${provider}`);
    return 0;
  }

  const inputCost = (usage.promptTokens / 1_000_000) * prices.input;
  const outputCost = (usage.completionTokens / 1_000_000) * prices.output;

  return inputCost + outputCost;
}