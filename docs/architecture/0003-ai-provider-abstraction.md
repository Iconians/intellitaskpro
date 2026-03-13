# ADR 0003: AI Provider Abstraction

## Status
Accepted

## Context

IntelliTaskPro provides AI-assisted features (task generation, sprint planning, prioritization, risk analysis, retrospectives). These features should work across multiple AI backends to support:

- portfolio demos without API keys (demo mode)
- free-tier usage (e.g. Google Gemini)
- local development (Ollama)
- paid providers (OpenAI, Anthropic)

The system must avoid coupling business logic to a single vendor and allow switching providers via configuration.

## Decision

A **single AI client abstraction** is used, configured by the `AI_PROVIDER` environment variable.

Supported providers:

- **demo** – rule-based task generation; no API key; safe fallback for demos
- **gemini** – Google Gemini (e.g. gemini-1.5-flash); free tier supported
- **ollama** – local Ollama server; configurable model and URL
- **openai** – OpenAI API (e.g. GPT-3.5 Turbo)
- **anthropic** – Anthropic API (e.g. Claude Haiku)

All AI features call a single entry point (`generateWithAI(provider, prompt, systemPrompt)`) in `src/lib/ai/client.ts`. Provider-specific implementations live behind this interface; API routes and server actions do not branch on provider.

## Consequences

**Advantages:**

- one code path for all AI features; easier testing and maintenance
- easy to add new providers by extending the client and env validation
- demo mode allows the app to run without any API keys
- organizations can rely on a single configured provider per deployment

**Trade-offs:**

- provider-specific options (e.g. model choice, temperature) are normalized to a common interface
- fallback or retry logic is implemented per provider inside the client
