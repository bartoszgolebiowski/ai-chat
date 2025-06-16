// Schemas and types for QueryAnalyzerConfluence
import { z } from "zod";

export interface QueryAnalysisInput {
  query: string;
  previousContext?: {
    query: string;
    response: string;
    nodes: any[]; // Use NodeWithScore if available in this file's context
  }[];
}

export interface QueryAnalysisOutput {
  isFollowUp: boolean;
  requiresNewSearch: boolean;
  contextRelevance: number;
  missingInformation: string[];
  queryType: "clarification" | "follow-up" | "new-topic" | "elaboration";
}

export const QueryAnalysisSchema = z.object({
  queryType: z
    .enum(["clarification", "follow-up", "new-topic", "elaboration"])
    .describe(
      "Typ zapytania na podstawie jego treści i związku z poprzednim kontekstem"
    ),
  isFollowUp: z
    .boolean()
    .describe("Czy to zapytanie jest kontynuacją poprzedniej rozmowy"),
  contextRelevance: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "Jak bardzo poprzedni kontekst jest istotny dla odpowiedzi na to zapytanie (0-1)"
    ),
  requiresNewSearch: z
    .boolean()
    .describe(
      "Czy do odpowiedzi na to zapytanie potrzebne jest nowe wyszukiwanie wektorowe"
    ),
  confidence: z.number().min(0).max(1).describe("Pewność analizy (0-1)"),
  reasoning: z
    .string()
    .describe("Szczegółowe uzasadnienie decyzji analitycznej"),
  missingInformation: z
    .array(z.string())
    .describe("Lista typów informacji, których może brakować w kontekście"),
  followUpIndicators: z
    .array(z.string())
    .describe("Konkretne słowa lub frazy wskazujące, że jest to kontynuacja"),
});

export const ConfluenceDecisionAnalysisSchema = z.object({
  strategy: z.enum(["context-only", "new-search", "hybrid"]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  suggestedActions: z.array(z.string()),
  priorityLevel: z.enum(["high", "medium", "low"]),
  pageScopes: z.array(z.string()), // Instead of documentScopes
  searchParameters: z.object({
    depth: z.number().min(1).max(5),
    breadth: z.number().min(1).max(5),
  }),
});

export const ConfluenceResponsePlanSchema = z.object({
  requiredComponents: z.array(z.string()),
  sourcingStrategy: z.enum(["direct-quote", "synthesis", "hybrid"]),
  formatType: z.enum(["text", "structured", "analytical"]),
  citationRequirements: z.boolean(),
  contentStructure: z.object({
    introduction: z.boolean(),
    mainPoints: z.array(z.string()),
    conclusion: z.boolean(),
    visualElements: z.array(z.enum(["table", "list", "quote", "calculation", "panel", "status"])),
  }),
  contextualEnhancements: z.array(z.string()),
  confidenceThresholds: z.object({
    factual: z.number().min(0).max(1),
    analytical: z.number().min(0).max(1),
    inference: z.number().min(0).max(1),
  }),
});

export type AIQueryAnalysis = z.infer<typeof QueryAnalysisSchema>;
export type ConfluenceDecisionAnalysis = z.infer<typeof ConfluenceDecisionAnalysisSchema>;
export type ConfluenceResponsePlan = z.infer<typeof ConfluenceResponsePlanSchema>;
