export type AIProvider = "demo" | "gemini" | "ollama" | "openai" | "anthropic";

/** Optional tuning for structured JSON-style outputs (e.g. task lists). */
export type GenerateAIOptions = {
  temperature?: number;
  /**
   * Gemini: set `application/json` so the model returns parseable JSON
   * (supported by @google/generative-ai generationConfig).
   */
  responseMimeType?: "application/json";
};
