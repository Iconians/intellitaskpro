import { GenerateAIOptions } from "@/lib/ai/client-types";

export async function generateWithOllama(
  prompt: string,
  systemPrompt?: string,
  options?: GenerateAIOptions
): Promise<string> {
  const rawOllamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  let ollamaUrl: string;

  try {
    const url = new URL(rawOllamaUrl);
    const hostname = url.hostname.toLowerCase();
    const allowedHosts = ["localhost", "127.0.0.1", "::1", "0.0.0.0"];
    const isLocalhost = allowedHosts.includes(hostname);
    const isPrivateIP = /^10\.|^172\.(1[6-9]|2[0-9]|3[01])\.|^192\.168\./.test(
      hostname
    );

    if (!isLocalhost && !isPrivateIP) {
      throw new Error("OLLAMA_URL must be localhost or private network address");
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("OLLAMA_URL must use http or https protocol");
    }
    ollamaUrl = rawOllamaUrl;
  } catch (error) {
    console.error("Invalid OLLAMA_URL:", error);
    throw new Error(
      "Invalid OLLAMA_URL configuration. Must be a valid localhost or private network URL."
    );
  }

  const model = process.env.OLLAMA_MODEL || "llama3";
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: fullPrompt,
      stream: false,
      options:
        options?.temperature != null
          ? { temperature: options.temperature }
          : undefined,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response || "";
}
