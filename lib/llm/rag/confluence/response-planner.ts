import { generateObject } from "ai";
import type { LLM } from "../../../models/llm";
import {
    ConfluenceDecisionAnalysis,
    ConfluenceResponsePlan,
    ConfluenceResponsePlanSchema,
} from "./schemas";

export class ConfluenceResponsePlanner {
  constructor(private llm: LLM) {}

  async planResponse(
    query: string,
    analysis: ConfluenceDecisionAnalysis
  ): Promise<ConfluenceResponsePlan> {
    const planningPrompt = `Jako ekspert w analizie dokumentacji Confluence, opracuj szczegółowy plan odpowiedzi.

Zapytanie: <query>${query}</query>

Wyniki analizy: <analysis>${JSON.stringify(analysis, null, 2)}</analysis>

Stwórz kompleksowy plan odpowiedzi, uwzględniając:

1. Wymagania strukturalne:
   - Jakie elementy muszą być zawarte w odpowiedzi?
   - Jak powinna być zorganizowana informacja?
   - Jakie elementy wizualne mogą zwiększyć zrozumienie?

2. Integracja źródeł:
   - Jak zrównoważyć cytaty bezpośrednie i syntezę informacji?
   - Gdzie dodać informacje kontekstowe?
   - Jak obsłużyć cytowania i odniesienia do źródeł?

3. Zarządzanie pewnością:
   - Ustal progi pewności dla różnych typów stwierdzeń
   - Określ wymagania weryfikacyjne
   - Wskaż obszary wymagające dodatkowej walidacji

4. Możliwości ulepszeń:
   - Dodatkowy kontekst
   - Elementy wyjaśniające
   - Wymagania dotyczące dowodów

Podaj uporządkowany plan odpowiedzi zoptymalizowany pod kątem dokumentacji Confluence.`;

    const result = await generateObject({
      model: this.llm,
      schema: ConfluenceResponsePlanSchema,
      prompt: planningPrompt,
      temperature: 0.2,
    });

    return result.object;
  }

  /**
   * Create a simplified plan for quick responses
   */
  createFallbackPlan(): ConfluenceResponsePlan {
    return {
      requiredComponents: ["main-answer", "sources"],
      sourcingStrategy: "hybrid",
      formatType: "text",
      citationRequirements: true,
      contentStructure: {
        introduction: false,
        mainPoints: ["direct-answer"],
        conclusion: false,
        visualElements: [],
      },
      contextualEnhancements: [],
      confidenceThresholds: {
        factual: 0.7,
        analytical: 0.6,
        inference: 0.5,
      },
    };
  }
}
