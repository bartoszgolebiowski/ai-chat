import { z } from "zod";

export const DecisionAnalysisSchema = z.object({
  strategy: z
    .enum(["context-only", "new-search", "hybrid", "context-only"])
    .describe(
      "The approach chosen for answering the query: use only context, perform a new search, or combine both."
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score (0-1) in the selected strategy and analysis."),
  reasoning: z
    .string()
    .describe("Explanation of why the strategy and actions were chosen."),
  suggestedActions: z
    .array(z.string())
    .describe("List of recommended next steps or actions for the LLM or user."),
  priorityLevel: z
    .enum(["high", "medium", "low"])
    .describe("Priority assigned to the query or task (high, medium, low)."),
  documentScopes: z
    .array(z.string())
    .describe("List of document sections or types to focus on for this query."),
  searchParameters: z
    .object({
      depth: z
        .number()
        .min(1)
        .max(5)
        .describe("How deep to search within each document (1-5)."),
      breadth: z
        .number()
        .min(1)
        .max(5)
        .describe("How many documents or sections to consider (1-5)."),
    })
    .describe("Parameters controlling the scope and extent of the search."),
});

export const ResponsePlanSchema = z.object({
  requiredComponents: z
    .array(z.string())
    .describe(
      "List of content elements that must be included in the response."
    ),
  sourcingStrategy: z
    .enum(["direct-quote", "synthesis", "hybrid", "context-only", "new-search"])
    .describe("How to source the response: direct quotes, synthesis, or both."),
  formatType: z
    .enum(["text", "structured", "analytical"])
    .describe(
      "Format of the response: plain text, structured data, or analytical format."
    ),
  citationRequirements: z
    .boolean()
    .describe("Whether citations are required in the response."),
  contentStructure: z
    .object({
      introduction: z
        .boolean()
        .describe("Whether to include an introduction section."),
      mainPoints: z
        .array(z.string())
        .describe("Key points or arguments to cover in the main body."),
      conclusion: z
        .boolean()
        .describe("Whether to include a conclusion section."),
      visualElements: z
        .array(z.enum(["table", "list", "quote", "calculation"]))
        .describe(
          "Types of visual or structural elements to include (table, list, quote, calculation)."
        ),
    })
    .describe("Structure and required elements of the response content."),
  contextualEnhancements: z
    .array(z.string())
    .describe("Additional context or information to enrich the response."),
  confidenceThresholds: z
    .object({
      factual: z
        .number()
        .min(0)
        .max(1)
        .describe("Minimum confidence required for factual statements (0-1)."),
      analytical: z
        .number()
        .min(0)
        .max(1)
        .describe("Minimum confidence required for analytical content (0-1)."),
      inference: z
        .number()
        .min(0)
        .max(1)
        .describe(
          "Minimum confidence required for inferred information (0-1)."
        ),
    })
    .describe(
      "Confidence thresholds for different types of content in the response."
    ),
});

// Enhanced query types for PDF analysis
const EnhancedQueryTypesSchema = z.enum([
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
  "new-search",
]);

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

// Combined schema for LLM output
export const CombinedSchema = z.object({
  analysis: QueryAnalysisSchema.describe(
    "Analysis of the query, including type, context, and reasoning."
  ),
  decision: DecisionAnalysisSchema.describe(
    "Decision on strategy, confidence, and actions for the query."
  ),
  responsePlan: ResponsePlanSchema.describe(
    "Plan for constructing the response, including structure and requirements."
  ),
});

export type PdfQueryAnalyzerResult = z.infer<typeof CombinedSchema>;
