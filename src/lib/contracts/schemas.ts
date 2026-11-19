import { z } from "zod";

export const OptionLabelSchema = z.enum(["A", "B", "C", "D", "E"]);

export const FieldRefSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("stem"),
    label: z.null(),
  }).strict(),
  z.object({
    kind: z.literal("option"),
    label: OptionLabelSchema,
  }).strict(),
]);

export const LooseFieldRefSchema = z.object({
  kind: z.enum(["stem", "option"]),
  label: OptionLabelSchema.nullable(),
}).strict().superRefine((val, ctx) => {
  if (val.kind === "stem" && val.label !== null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Stem field must have label null",
      path: ["label"],
    });
  }
  if (val.kind === "option" && val.label === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Option field must have a label (A-E)",
      path: ["label"],
    });
  }
});

const NonEmptyTrimmedString = (min: number, max: number) =>
  z.string()
    .min(min)
    .max(max)
    .refine((val) => val.trim().length > 0, {
      message: "String cannot be empty or only whitespace",
    });

export const OptionItemSchema = z.object({
  label: OptionLabelSchema,
  text: NonEmptyTrimmedString(1, 400),
}).strict();

export const QuestionSideSchema = z.object({
  stem: NonEmptyTrimmedString(1, 2000),
  options: z.array(OptionItemSchema).min(2).max(5),
}).strict();

export const QuestionItemSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{1,40}$/, "Item ID must be 1-40 alphanumeric or - _"),
  en: QuestionSideSchema,
  ta: QuestionSideSchema,
}).strict();

export const AnalyzeRequestSchema = z.object({
  requestId: z.string().uuid(),
  revision: z.number().int().min(0),
  locale: z.enum(["en", "ta"]),
  mode: z.enum(["rules", "ai"]),
  sourceKind: z.enum(["synthetic", "public", "owned_practice"]),
  consent: z.boolean(),
  items: z.array(QuestionItemSchema).min(1).max(10).superRefine((items, ctx) => {
    const ids = new Set<string>();
    for (let i = 0; i < items.length; i++) {
      const id = items[i].id;
      if (ids.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate item id: ${id}`,
          path: [i, "id"],
        });
      }
      ids.add(id);
    }
  }),
}).strict();

export const ReasonCodeSchema = z.enum([
  "equivalent",
  "negation",
  "entity",
  "qualifier",
  "option_meaning",
  "uncertain",
  "other_material_change",
]);

export const ProviderComparisonSchema = z.object({
  field: LooseFieldRefSchema,
  relation: z.enum(["equivalent", "different", "uncertain"]),
  enQuote: z.string().min(1).max(2000),
  taQuote: z.string().min(1).max(2000),
  reasonCode: ReasonCodeSchema,
  explanation: z.string().min(1).max(600),
}).strict();

export const ProviderResultItemSchema = z.object({
  itemId: z.string().min(1).max(40),
  comparisons: z.array(ProviderComparisonSchema).min(3).max(6),
}).strict();

export const ProviderOutputSchema = z.object({
  results: z.array(ProviderResultItemSchema).min(1).max(10),
}).strict();

export const StructuralFindingCodeSchema = z.enum([
  "OPTION_COUNT_MISMATCH",
  "OPTION_LABEL_MISMATCH",
  "DUPLICATE_OPTION_LABEL",
  "NUMERIC_TOKEN_DIFFERENCE",
  "UNIT_TOKEN_DIFFERENCE",
]);

export const StructuralFindingSchema = z.object({
  code: StructuralFindingCodeSchema,
  field: LooseFieldRefSchema,
  enTokens: z.array(z.string().min(1).max(80)),
  taTokens: z.array(z.string().min(1).max(80)),
}).strict();

export const EvidenceSpanSchema = z.object({
  start: z.number().int().min(0),
  end: z.number().int().min(1),
  text: z.string().min(1).max(2000),
}).strict();

export const ValidatedComparisonSchema = z.object({
  field: LooseFieldRefSchema,
  relation: z.enum(["equivalent", "different", "uncertain"]),
  en: EvidenceSpanSchema,
  ta: EvidenceSpanSchema,
  reasonCode: ReasonCodeSchema,
  explanation: z.string().min(1).max(600),
  evidenceValid: z.literal(true),
}).strict();

export const ItemReviewStatusSchema = z.enum([
  "meaning_changed",
  "no_issue_found",
  "needs_review",
]);

export const AnalyzeResponseItemSchema = z.object({
  id: z.string().min(1).max(40),
  status: ItemReviewStatusSchema,
  structuralFindings: z.array(StructuralFindingSchema),
  comparisons: z.array(ValidatedComparisonSchema).max(6),
}).strict();

export const WarningCodeSchema = z.enum([
  "AI_DISABLED",
  "AI_UNAVAILABLE",
  "AI_TIMEOUT",
  "AI_INVALID_RESPONSE",
  "UNSUPPORTED_CONTENT",
]);

export const AnalyzeResponseSchema = z.object({
  requestId: z.string().uuid(),
  revision: z.number().int().min(0),
  mode: z.enum(["rules_only", "live_ai"]),
  model: z.string().nullable(),
  providerStatus: z.enum([
    "not_requested",
    "ok",
    "unavailable",
    "timeout",
    "invalid_response",
  ]),
  warnings: z.array(WarningCodeSchema),
  items: z.array(AnalyzeResponseItemSchema).min(1).max(10),
}).strict();

export const ErrorCodeSchema = z.enum([
  "INVALID_REQUEST",
  "BODY_TOO_LARGE",
  "UNSUPPORTED_MEDIA_TYPE",
  "FORBIDDEN_ORIGIN",
  "UNAUTHORIZED_DEMO",
  "DEMO_INPUT_RESTRICTED",
  "CONSENT_REQUIRED",
  "RATE_LIMITED",
  "INTERNAL_ERROR",
]);

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: ErrorCodeSchema,
    messageKey: z.string(),
    requestId: z.string().nullable(),
  }).strict(),
}).strict();
