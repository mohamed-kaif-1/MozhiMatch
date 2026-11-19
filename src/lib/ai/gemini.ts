import "server-only";
import { QuestionItem, ProviderOutput } from "../contracts/types";
import { ProviderOutputSchema } from "../contracts/schemas";
import { SYSTEM_PROMPT_V1, buildUserPrompt, PROVIDER_RESPONSE_SCHEMA } from "./prompt";
import { APP_LIMITS } from "../contracts/config";

export interface GeminiCallResult {
  status: "ok" | "unavailable" | "timeout" | "invalid_response";
  model: string | null;
  output: ProviderOutput | null;
  warning?: "AI_DISABLED" | "AI_UNAVAILABLE" | "AI_TIMEOUT" | "AI_INVALID_RESPONSE";
}

export async function callGeminiSemanticReview(
  items: QuestionItem[],
  locale: "en" | "ta"
): Promise<GeminiCallResult> {
  const aiMode = process.env.AI_MODE;
  if (aiMode === "off") {
    return {
      status: "unavailable",
      model: null,
      output: null,
      warning: "AI_DISABLED",
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return {
      status: "unavailable",
      model: null,
      output: null,
      warning: "AI_UNAVAILABLE",
    };
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const userPrompt = buildUserPrompt(items, locale);

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT_V1 }],
    },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: PROVIDER_RESPONSE_SCHEMA,
      temperature: 0.1,
    },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), APP_LIMITS.PROVIDER_TIMEOUT_MS);

    let response: Response | null = null;
    const maxRetries = 2;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      if (response.ok) {
        break;
      }

      // Retry on transient 429 rate limit or 503 service unavailable
      if ((response.status === 429 || response.status === 503) && attempt < maxRetries) {
        const delayMs = (attempt + 1) * 2000;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      break;
    }

    clearTimeout(timeoutId);

    if (!response || !response.ok) {
      return {
        status: "unavailable",
        model,
        output: null,
        warning: "AI_UNAVAILABLE",
      };
    }

    const json = await response.json();
    const candidateText =
      json?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText || typeof candidateText !== "string") {
      return {
        status: "invalid_response",
        model,
        output: null,
        warning: "AI_INVALID_RESPONSE",
      };
    }

    let parsedData: unknown;
    try {
      parsedData = JSON.parse(candidateText);
    } catch {
      return {
        status: "invalid_response",
        model,
        output: null,
        warning: "AI_INVALID_RESPONSE",
      };
    }

    const validation = ProviderOutputSchema.safeParse(parsedData);
    if (!validation.success) {
      return {
        status: "invalid_response",
        model,
        output: null,
        warning: "AI_INVALID_RESPONSE",
      };
    }

    return {
      status: "ok",
      model,
      output: validation.data,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        status: "timeout",
        model,
        output: null,
        warning: "AI_TIMEOUT",
      };
    }

    return {
      status: "unavailable",
      model,
      output: null,
      warning: "AI_UNAVAILABLE",
    };
  }
}

