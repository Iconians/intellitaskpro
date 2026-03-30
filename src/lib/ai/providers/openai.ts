import OpenAI from "openai";
import { GenerateAIOptions } from "@/lib/ai/client-types";

export async function generateWithOpenAI(
  prompt: string,
  systemPrompt?: string,
  options?: GenerateAIOptions
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      ...(systemPrompt
        ? [{ role: "system" as const, content: systemPrompt }]
        : []),
      { role: "user" as const, content: prompt },
    ],
    ...(options?.temperature != null ? { temperature: options.temperature } : {}),
  });

  return response.choices[0]?.message?.content || "";
}
