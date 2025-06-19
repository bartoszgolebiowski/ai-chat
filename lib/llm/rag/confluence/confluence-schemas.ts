// Schemas and types for QueryAnalyzerConfluence
import { z } from "zod";

export const ConfluenceDecisionAnalysisSchema = z.object({
  strategy: z
    .enum(["new-search", "context-only", "new-search-and-context"])
    .describe(
      "Wybrana strategia odpowiedzi: tylko kontekst, nowe wyszukiwanie lub oba podejścia."
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Poziom pewności (0-1) w wyborze strategii i analizie."),
  reasoning: z
    .string()
    .describe("Uzasadnienie wyboru strategii i sugerowanych działań."),
  suggestedActions: z
    .array(z.string())
    .describe(
      "Lista sugerowanych kolejnych kroków lub działań dla LLM lub użytkownika."
    ),
  priorityLevel: z
    .enum(["high", "medium", "low"])
    .describe(
      "Priorytet przypisany do zapytania lub zadania (wysoki, średni, niski)."
    ),
  pageScopes: z
    .array(z.string())
    .describe(
      "Lista stron lub sekcji Confluence, na których należy się skupić."
    ),
  searchParameters: z
    .object({
      depth: z
        .number()
        .min(1)
        .max(5)
        .describe("Jak głęboko przeszukiwać każdą stronę (1-5)."),
      breadth: z
        .number()
        .min(1)
        .max(5)
        .describe("Ile stron lub sekcji należy rozważyć (1-5)."),
    })
    .describe("Parametry określające zakres i szczegółowość wyszukiwania."),
});

export const ConfluenceResponsePlanSchema = z.object({
  requiredComponents: z
    .array(z.string())
    .describe("Elementy, które muszą znaleźć się w odpowiedzi."),
  sourcingStrategy: z
    .enum(["direct-quote", "synthesis", "hybrid", "context-only", "new-search"])
    .describe(
      "Sposób pozyskania odpowiedzi: cytat, synteza, hybryda lub tylko kontekst."
    ),
  formatType: z
    .enum(["text", "structured", "analytical"])
    .describe("Format odpowiedzi: tekst, dane strukturalne lub analiza."),
  citationRequirements: z.boolean().describe("Czy odpowiedź wymaga cytowań."),
  contentStructure: z
    .object({
      introduction: z
        .boolean()
        .describe("Czy dodać sekcję wstępną (wprowadzenie)."),
      mainPoints: z
        .array(z.string())
        .describe(
          "Główne punkty lub argumenty do przedstawienia w odpowiedzi."
        ),
      conclusion: z
        .boolean()
        .describe("Czy dodać sekcję końcową (podsumowanie)."),
      visualElements: z
        .array(
          z.enum(["table", "list", "quote", "calculation", "panel", "status"])
        )
        .describe(
          "Typy elementów wizualnych lub strukturalnych do uwzględnienia (tabela, lista, cytat, kalkulacja, panel, status)."
        ),
    })
    .describe("Struktura i wymagane elementy odpowiedzi."),
  contextualEnhancements: z
    .array(z.string())
    .describe("Dodatkowe informacje lub kontekst wzbogacające odpowiedź."),
  confidenceThresholds: z
    .object({
      factual: z
        .number()
        .min(0)
        .max(1)
        .describe("Minimalny poziom pewności dla faktów (0-1)."),
      analytical: z
        .number()
        .min(0)
        .max(1)
        .describe("Minimalny poziom pewności dla treści analitycznych (0-1)."),
      inference: z
        .number()
        .min(0)
        .max(1)
        .describe("Minimalny poziom pewności dla wniosków (0-1)."),
    })
    .describe("Progi pewności dla różnych typów treści w odpowiedzi."),
});

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

export const CombinedSchema = z.object({
  analysis: QueryAnalysisSchema.describe(
    "Analiza zapytania, w tym typ, kontekst i uzasadnienie."
  ),
  decision: ConfluenceDecisionAnalysisSchema.describe(
    "Decyzja dotycząca strategii, pewności i działań dla zapytania."
  ),
  responsePlan: ConfluenceResponsePlanSchema.describe(
    "Plan budowy odpowiedzi, w tym strukturę i wymagania."
  ),
});

export type CombinedOutput = z.infer<typeof CombinedSchema>;
