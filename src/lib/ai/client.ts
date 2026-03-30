import { AIProvider, GenerateAIOptions } from "@/lib/ai/client-types";
import { generateDemoTasks } from "@/lib/ai/providers/demo";
import { generateWithGemini } from "@/lib/ai/providers/gemini";
import { generateWithOllama } from "@/lib/ai/providers/ollama";
import { generateWithOpenAI } from "@/lib/ai/providers/openai";
import { generateWithAnthropic } from "@/lib/ai/providers/anthropic";

export type { AIProvider, GenerateAIOptions } from "@/lib/ai/client-types";

export async function generateWithAI(
  provider: AIProvider,
  prompt: string,
  systemPrompt?: string,
  options?: GenerateAIOptions
): Promise<string> {
  switch (provider) {
    case "demo":
      return JSON.stringify(await generateDemoTasks(prompt));

    case "gemini":
      return await generateWithGemini(prompt, systemPrompt, options);

    case "ollama":
      return await generateWithOllama(prompt, systemPrompt, options);

    case "openai":
      return await generateWithOpenAI(prompt, systemPrompt, options);

    case "anthropic":
      return await generateWithAnthropic(prompt, systemPrompt, options);

    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}
