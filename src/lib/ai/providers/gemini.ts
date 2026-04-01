import { GoogleGenerativeAI } from "@google/generative-ai";
import { GenerateAIOptions } from "@/lib/ai/client-types";

/** Try newest first; 404 / not found falls back to the next id. */
const GEMINI_MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
] as const;

export async function generateWithGemini(
  prompt: string,
  systemPrompt?: string,
  options?: GenerateAIOptions,
): Promise<string> {
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error(
      "GOOGLE_GEMINI_API_KEY is not set. Get a free key at https://makersuite.google.com/app/apikey",
    );
  }

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY.trim();
  if (!apiKey.startsWith("AIza") && apiKey.length < 30) {
    throw new Error(
      "Invalid Gemini API key format. Please check your GOOGLE_GEMINI_API_KEY. Get a free key at https://makersuite.google.com/app/apikey",
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: Error | null = null;

  for (const modelName of GEMINI_MODEL_CANDIDATES) {
    try {
      const trimmedSystem = systemPrompt?.trim();
      const model = genAI.getGenerativeModel({
        model: modelName,
        ...(trimmedSystem ? { systemInstruction: trimmedSystem } : {}),
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          topP: 0.8,
          topK: 40,
          ...(options?.responseMimeType === "application/json"
            ? { responseMimeType: "application/json" }
            : {}),
        },
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text?.trim()) {
        throw new Error(
          "Empty response from Gemini (output may have been blocked by safety filters or the model returned no text).",
        );
      }
      return text;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const errorMessage = lastError.message;
      if (errorMessage.includes("not found") || errorMessage.includes("404")) {
        console.warn(`Gemini model ${modelName} not available, trying next…`);
        continue;
      }
      break;
    }
  }

  if (lastError) {
    const errorMessage = lastError.message;
    if (
      errorMessage.includes("API_KEY") ||
      errorMessage.includes("401") ||
      errorMessage.includes("403")
    ) {
      throw new Error(
        "Invalid or missing Gemini API key. Please check your GOOGLE_GEMINI_API_KEY environment variable. Get a free key at https://makersuite.google.com/app/apikey",
      );
    }
    if (
      errorMessage.includes("quota") ||
      errorMessage.includes("rate limit") ||
      errorMessage.includes("429")
    ) {
      throw new Error(
        "Gemini API rate limit reached. Free tier allows 15 requests per minute. Please wait and try again.",
      );
    }
    if (errorMessage.includes("not found") || errorMessage.includes("404")) {
      throw new Error(
        `Gemini API models not available. This could mean:\n` +
          `1. Your API key is invalid or expired\n` +
          `2. The API endpoint is incorrect\n` +
          `3. Your API key doesn't have access to these models\n\n` +
          `Please verify your GOOGLE_GEMINI_API_KEY at https://makersuite.google.com/app/apikey\n` +
          `Original error: ${errorMessage}`,
      );
    }

    throw new Error(
      `Gemini API error: ${errorMessage}. Please check your API key and model availability.`,
    );
  }

  throw new Error(
    "All Gemini models failed. Please check your API key and try again.",
  );
}
