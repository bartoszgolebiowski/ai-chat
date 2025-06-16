import { z } from "zod";

export const DecisionAnalysisSchema = z.object({
  strategy: z.enum(["context-only", "new-search", "hybrid"]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  suggestedActions: z.array(z.string()),
  priorityLevel: z.enum(["high", "medium", "low"]),
  documentScopes: z.array(z.string()),
  searchParameters: z.object({
    depth: z.number().min(1).max(5),
    breadth: z.number().min(1).max(5),
  }),
});

export const ResponsePlanSchema = z.object({
  requiredComponents: z.array(z.string()),
  sourcingStrategy: z.enum(["direct-quote", "synthesis", "hybrid"]),
  formatType: z.enum(["text", "structured", "analytical"]),
  citationRequirements: z.boolean(),
  contentStructure: z.object({
    introduction: z.boolean(),
    mainPoints: z.array(z.string()),
    conclusion: z.boolean(),
    visualElements: z.array(z.enum(["table", "list", "quote", "calculation"])),
  }),
  contextualEnhancements: z.array(z.string()),
  confidenceThresholds: z.object({
    factual: z.number().min(0).max(1),
    analytical: z.number().min(0).max(1),
    inference: z.number().min(0).max(1),
  }),
});

export type DecisionAnalysis = z.infer<typeof DecisionAnalysisSchema>;
export type ResponsePlan = z.infer<typeof ResponsePlanSchema>;

// Enhanced query types for PDF analysis
export const EnhancedQueryTypesSchema = z.enum([
  "fact-extraction",
  "document-comparison",
  "numerical-analysis",
  "temporal-analysis",
  "definition-lookup",
  "relationship-analysis",
  "table-extraction",
  "figure-analysis",
  "clarification",
  "follow-up",
]);

export type EnhancedQueryType = z.infer<typeof EnhancedQueryTypesSchema>;
// Zod schema for AI analysis

export const QueryAnalysisSchema = z.object({
  queryType: EnhancedQueryTypesSchema.describe(
    "Type of query based on its content and relation to previous context"
  ),
  isFollowUp: z
    .boolean()
    .describe(
      "Whether this query is a continuation of the previous conversation"
    ),
  contextRelevance: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "How relevant the previous context is for answering this query (0-1)"
    ),
  requiresNewSearch: z
    .boolean()
    .describe("Whether a new vector search is needed to answer this query"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence of the analysis (0-1)"),
  reasoning: z
    .string()
    .describe("Detailed reasoning for the analytical decision"),
  missingInformation: z
    .array(z.string())
    .describe(
      "List of information types that might be missing from the context"
    ),
  followUpIndicators: z
    .array(z.string())
    .describe("Specific words or phrases indicating this is a follow-up"),
});
export type AIQueryAnalysis = z.infer<typeof QueryAnalysisSchema>;
