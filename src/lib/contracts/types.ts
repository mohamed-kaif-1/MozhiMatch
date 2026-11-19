import { z } from "zod";
import {
  OptionLabelSchema,
  FieldRefSchema,
  LooseFieldRefSchema,
  OptionItemSchema,
  QuestionSideSchema,
  QuestionItemSchema,
  AnalyzeRequestSchema,
  ReasonCodeSchema,
  ProviderComparisonSchema,
  ProviderResultItemSchema,
  ProviderOutputSchema,
  StructuralFindingCodeSchema,
  StructuralFindingSchema,
  EvidenceSpanSchema,
  ValidatedComparisonSchema,
  ItemReviewStatusSchema,
  AnalyzeResponseItemSchema,
  AnalyzeResponseSchema,
  ErrorCodeSchema,
  ErrorResponseSchema,
} from "./schemas";

export type OptionLabel = z.infer<typeof OptionLabelSchema>;
export type FieldRef = z.infer<typeof FieldRefSchema>;
export type LooseFieldRef = z.infer<typeof LooseFieldRefSchema>;
export type OptionItem = z.infer<typeof OptionItemSchema>;
export type QuestionSide = z.infer<typeof QuestionSideSchema>;
export type QuestionItem = z.infer<typeof QuestionItemSchema>;
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
export type ReasonCode = z.infer<typeof ReasonCodeSchema>;
export type ProviderComparison = z.infer<typeof ProviderComparisonSchema>;
export type ProviderResultItem = z.infer<typeof ProviderResultItemSchema>;
export type ProviderOutput = z.infer<typeof ProviderOutputSchema>;
export type StructuralFindingCode = z.infer<typeof StructuralFindingCodeSchema>;
export type StructuralFinding = z.infer<typeof StructuralFindingSchema>;
export type EvidenceSpan = z.infer<typeof EvidenceSpanSchema>;
export type ValidatedComparison = z.infer<typeof ValidatedComparisonSchema>;
export type ItemReviewStatus = z.infer<typeof ItemReviewStatusSchema>;
export type AnalyzeResponseItem = z.infer<typeof AnalyzeResponseItemSchema>;
export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export type ReviewDecisionType = "keep" | "fix" | "escalate";

export interface ReviewDecision {
  itemId: string;
  fieldKey: string; // "stem" or "option:A"
  decision: ReviewDecisionType;
  decidedAt: string;
}
