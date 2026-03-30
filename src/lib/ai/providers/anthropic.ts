import { GenerateAIOptions } from "@/lib/ai/client-types";

export async function generateWithAnthropic(
  prompt: string,
  systemPrompt?: string,
  options?: GenerateAIOptions
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const { Anthropic } = await import("@anthropic-ai/sdk");
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const response = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
    ...(systemPrompt ? { system: systemPrompt } : {}),
    ...(options?.temperature != null ? { temperature: options.temperature } : {}),
  });

  return response.content[0]?.type === "text" ? response.content[0].text : "";
}
