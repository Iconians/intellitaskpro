export type AIProvider = "demo" | "gemini" | "ollama" | "openai" | "anthropic";

/** Optional tuning for structured JSON-style outputs (e.g. task lists). */
export type GenerateAIOptions = {
  temperature?: number;
};
