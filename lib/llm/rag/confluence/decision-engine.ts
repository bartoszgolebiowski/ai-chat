import { generateObject } from "ai";
import type { LLM } from "../../../models/llm";
import {
  ConfluenceDecisionAnalysis,
  ConfluenceDecisionAnalysisSchema,
  QueryAnalysisOutput,
} from "./schemas";

/**
 * Silnik decyzyjny oparty na LLM dla wyszukiwania w dokumentacji Confluence
 */
export class ConfluenceDecisionEngine {
  constructor(private llm: LLM) {}

  /**
   * Podejmij decyzję o strategii wyszukiwania na podstawie analizy zapytania
   */
  async makeDecision(
    analysis: QueryAnalysisOutput,
    contextAnalysisThreshold: number = 0.7
  ): Promise<ConfluenceDecisionAnalysis> {
    const decisionPrompt = `Jako strateg wyszukiwania w dokumentacji Confluence, przeanalizuj poniższy wynik analizy zapytania i określ optymalną strategię wyszukiwania.

Analiza zapytania: <analysis>${JSON.stringify(analysis, null, 2)}</analysis>

Próg analizy kontekstu: <threshold>${contextAnalysisThreshold}</threshold>

Określ optymalną strategię wyszukiwania, biorąc pod uwagę:
1. Wymagania dotyczące aktualności informacji – czy zapytanie wymaga najnowszych danych?
2. Kompletność kontekstu – czy dotychczasowy kontekst wystarcza do odpowiedzi?
3. Złożoność zapytania – jak bardzo skomplikowana jest prośba o informację?
4. Zakres dokumentów – czy należy przeszukać wiele stron Confluence?

Dla każdej opcji strategii:
- context-only: użyj wyłącznie dotychczasowego kontekstu rozmowy
- new-search: wykonaj nowe wyszukiwanie, ignorując kontekst
- hybrid: połącz dotychczasowy kontekst z nowymi wynikami wyszukiwania

Podaj ustrukturyzowaną decyzję z jasnym uzasadnieniem i sugerowanymi działaniami.`;

    const result = await generateObject({
      model: this.llm,
      schema: ConfluenceDecisionAnalysisSchema,
      prompt: decisionPrompt,
      temperature: 0.2,
    });

    return result.object;
  }
}
