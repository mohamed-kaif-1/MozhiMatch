import { z } from "zod";
import { LooseFieldRefSchema } from "./schemas";

export const CorrectionRequestSchema = z
  .object({
    requestId: z.string().uuid(),
    itemId: z.string().min(1).max(40),
    revision: z.number().int().min(0),
    field: LooseFieldRefSchema,
    sourceLanguage: z.enum(["en", "ta"]),
    targetLanguage: z.enum(["en", "ta"]),
    sourceText: z.string().min(1).max(2000),
    currentText: z.string().min(1).max(2000),
    findingExplanation: z.string().max(1000).optional(),
    reasonCode: z.string().max(50).optional(),
    consent: z.boolean(),
  })
  .strict();

export type CorrectionRequest = z.infer<typeof CorrectionRequestSchema>;

export const CorrectionResultStatusSchema = z.enum([
  "suggested",
  "no_correction_needed",
  "ambiguous_cannot_correct",
  "unavailable",
]);

export type CorrectionResultStatus = z.infer<typeof CorrectionResultStatusSchema>;

export const CorrectionResponseSchema = z
  .object({
    requestId: z.string().uuid(),
    itemId: z.string().min(1).max(40),
    revision: z.number().int().min(0),
    field: LooseFieldRefSchema,
    targetLanguage: z.enum(["en", "ta"]),
    status: CorrectionResultStatusSchema,
    originalText: z.string().max(2000),
    suggestedText: z.string().max(2000),
    reason: z.string().max(1000),
    requiresHumanReview: z.boolean(),
  })
  .strict();

export type CorrectionResponse = z.infer<typeof CorrectionResponseSchema>;

