import { generateObject } from "ai";
import { MetadataMode, NodeWithScore } from "llamaindex";
import { z } from "zod";
import type { LLM } from "../../models/llm";

export interface QueryAnalysisInput {
  query: string;
  previousContext?: {
    query: string;
    response: string;
    nodes: NodeWithScore[];
  }[];
}

export interface QueryAnalysisOutput {
  isFollowUp: boolean;
  requiresNewSearch: boolean;
  contextRelevance: number;
  missingInformation: string[];
  queryType: "clarification" | "follow-up" | "new-topic" | "elaboration";
  confidence: number;
  reasoning: string;
}

export interface DecisionResult {
  decision: "context-only" | "hybrid" | "new-search";
  confidence: number;
  reasoning: string;
}

// Zod schema for AI analysis
const QueryAnalysisSchema = z.object({
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

type AIQueryAnalysis = z.infer<typeof QueryAnalysisSchema>;

export class QueryAnalyzer {
  constructor(private llm: LLM) {}

  /**
   * Analyze query using AI to determine type and context dependency
   */
  async analyzeQuery(input: QueryAnalysisInput): Promise<QueryAnalysisOutput> {
    const { query, previousContext = [] } = input;

    // Prepare context summary for AI analysis
    const contextSummary = this.prepareContextSummary(previousContext);

    try {
      // Use AI to analyze the query
      const aiAnalysis = await this.performAIAnalysis(query, contextSummary);

      return {
        isFollowUp: aiAnalysis.isFollowUp,
        requiresNewSearch: aiAnalysis.requiresNewSearch,
        contextRelevance: aiAnalysis.contextRelevance,
        missingInformation: aiAnalysis.missingInformation,
        queryType: aiAnalysis.queryType,
        confidence: aiAnalysis.confidence,
        reasoning: aiAnalysis.reasoning,
      };
    } catch (error) {
      console.warn(
        "AI analysis failed, falling back to rule-based analysis:",
        error
      );
      throw error;
    }
  }

  /**
   * Make decision based on AI analysis
   */
  makeDecision(
    analysis: QueryAnalysisOutput,
    contextAnalysisThreshold: number = 0.7
  ): DecisionResult {
    const {
      contextRelevance,
      requiresNewSearch,
      isFollowUp,
      confidence,
      reasoning,
    } = analysis;

    let decision: "context-only" | "hybrid" | "new-search";
    let finalConfidence = confidence;
    let finalReasoning = reasoning;

    // AI-informed decision logic
    if (!requiresNewSearch && contextRelevance >= contextAnalysisThreshold) {
      decision = "context-only";
      finalConfidence = Math.min(confidence + 0.1, 1.0);
      finalReasoning = `AI Analysis: ${reasoning}. High context relevance (${contextRelevance.toFixed(
        2
      )}) suggests context is sufficient.`;
    } else if (
      isFollowUp &&
      contextRelevance >= 0.3 &&
      contextRelevance < contextAnalysisThreshold
    ) {
      decision = "hybrid";
      finalReasoning = `AI Analysis: ${reasoning}. Moderate context relevance (${contextRelevance.toFixed(
        2
      )}) requires hybrid approach.`;
    } else {
      decision = "new-search";
      finalConfidence = Math.max(confidence, 0.8);
      finalReasoning = `AI Analysis: ${reasoning}. Low context relevance (${contextRelevance.toFixed(
        2
      )}) or new topic requires fresh search.`;
    }

    return {
      decision,
      confidence: finalConfidence,
      reasoning: finalReasoning,
    };
  }

  /**
   * Perform AI-powered analysis using generateObject
   */
  private async performAIAnalysis(
    query: string,
    contextSummary: string
  ): Promise<AIQueryAnalysis> {
    const prompt = this.buildAnalysisPrompt(query, contextSummary);

    const result = await generateObject({
      model: this.llm,
      schema: QueryAnalysisSchema,
      prompt,
      temperature: 0.1, // Low temperature for consistent analysis
    });

    return result.object;
  }

  /**
   * Build prompt for AI analysis
   */
  private buildAnalysisPrompt(query: string, contextSummary: string): string {
    return `Jesteś ekspertem w analizie zapytań dla konwersacyjnego systemu AI. Twoim zadaniem jest analiza zapytania użytkownika w kontekście poprzedniej rozmowy w celu określenia najlepszej strategii wyszukiwania.

Bieżące Zapytanie: "${query}"

Podsumowanie Poprzedniego Kontekstu:
${contextSummary}

Proszę przeanalizować zapytanie i określić:

1. **Typ Zapytania**: Sklasyfikuj zapytanie jako jedno z:
   - "clarification": Użytkownik prosi o wyjaśnienie lub doprecyzowanie czegoś z poprzedniego kontekstu
   - "follow-up": Użytkownik rozwija poprzednią rozmowę, zadając powiązane pytania
   - "new-topic": Użytkownik rozpoczyna zupełnie nowy temat, niezwiązany z poprzednim kontekstem
   - "elaboration": Użytkownik prosi o bardziej szczegółowe informacje na temat poprzednich tematów

2. **Charakter Kontynuacji**: Czy to zapytanie jest bezpośrednio związane z poprzednią rozmową?

3. **Trafność Kontekstu**: Jak bardzo poprzedni kontekst jest istotny dla odpowiedzi na to zapytanie? (0.0 = zupełnie nieistotny, 1.0 = całkowicie istotny)

4. **Wymagania Wyszukiwania**: Na podstawie analizy, czy to zapytanie wymaga:
   - Nowego wyszukiwania wektorowego (dla nowych tematów lub gdy w kontekście brakuje informacji)
   - Odpowiedzi opartej wyłącznie na kontekście (gdy poprzedni kontekst jest wystarczający)
   - Lub kombinacji obu

5. **Pewność**: Jak pewny jesteś tej analizy? (0.0 = bardzo niepewny, 1.0 = bardzo pewny)

Rozważ następujące czynniki:
- Bezpośrednie odniesienia do poprzedniej treści ("to", "tamto", "ten wspomniany", itp.)
- Użycie zaimków sugerujących poprzedni kontekst
- Słowa pytające sugerujące brakujące informacje
- Semantyczny związek między bieżącym zapytaniem a poprzednim kontekstem
- Czy poprzedni kontekst zawiera wystarczające informacje do odpowiedzi na zapytanie

Podaj szczegółowe uzasadnienie swojej analizy.`;
  }
  /**
   * Prepare context summary for AI analysis
   */
  private prepareContextSummary(
    previousContext: QueryAnalysisInput["previousContext"]
  ): string {
    if (!previousContext || previousContext.length === 0) {
      return "No previous context available.";
    }

    const summaries = previousContext.map((context, index) => {
      const nodeContents = context.nodes
        .map((node) => {
          // Safely get text content from node
          let text = "Content not available";
          try {
            if (typeof node.node.getContent === "function") {
              text = node.node.getContent(MetadataMode.NONE);
            } else if ((node.node as any).text) {
              text = (node.node as any).text;
            } else if ((node.node as any).content) {
              text = (node.node as any).content;
            }
          } catch (error) {
            console.warn("Failed to extract node content:", error);
          }
          return text.substring(0, 200) + "...";
        })
        .join("\n");

      return `Turn ${index + 1}:
Zapytanie: "${context.query}"
Odpowiedz: "${context.response.substring(0, 300)}..."
Zródła: ${nodeContents || "No sources"}`;
    });

    return summaries.join("\n\n");
  }
}
