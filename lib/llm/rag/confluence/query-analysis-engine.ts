import { generateObject } from "ai";
import { MetadataMode } from "llamaindex";
import { LLM } from "../../../models/llm";
import {
  AIQueryAnalysis,
  QueryAnalysisInput,
  QueryAnalysisOutput,
  QueryAnalysisSchema,
} from "./schemas";

export class ConfluenceQueryAnalysisEngine {
  constructor(private llm: LLM) {}

  async analyzeQuery(input: QueryAnalysisInput): Promise<QueryAnalysisOutput> {
    const { query, previousContext = [] } = input;
    const contextSummary = this.prepareContextSummary(previousContext);
    try {
      const aiAnalysis = await this.performAIAnalysis(query, contextSummary);
      return aiAnalysis;
    } catch (error) {
      console.warn(
        "AI analysis failed, falling back to rule-based analysis:",
        error
      );
      throw error;
    }
  }

  private async performAIAnalysis(
    query: string,
    contextSummary: string
  ): Promise<AIQueryAnalysis> {
    const prompt = this.buildAnalysisPrompt(query, contextSummary);
    const result = await generateObject({
      model: this.llm,
      schema: QueryAnalysisSchema,
      prompt,
      temperature: 0.1,
    });
    return result.object;
  }

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
- Semantyczny związek między bieżącym zapytaniem a poprzednim kontekstem
- Czy poprzedni kontekst zawiera wystarczające informacje do odpowiedzi na zapytanie

Podaj szczegółowe uzasadnienie swojej analizy.`;
  }

  private prepareContextSummary(
    previousContext: QueryAnalysisInput["previousContext"]
  ): string {
    if (!previousContext || previousContext.length === 0) {
      return "No previous context available.";
    }
    const summaries = previousContext.map((context, index) => {
      const nodeContents = context.nodes
        .map((node) => {
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
