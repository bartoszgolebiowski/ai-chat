import { MetadataMode, SimpleChatEngine } from "llamaindex";
import {
  GenerateResponseInput,
  ResponseGeneratorBase,
  StreamingResponseResult,
} from "../../ResponseGeneratorBase";
import { AnalyzedQueryResult } from "./query-analyzer";

export class ConfluenceResponseGenerator extends ResponseGeneratorBase {
  private static readonly SYSTEM_PROMPT = `
Jesteś asystentem AI wyspecjalizowanym w analizie i wyszukiwaniu informacji w dokumentacji Confluence. Twoim głównym zadaniem jest przetwarzanie i rozumienie treści stron Confluence, które zawierają szczegółowe informacje i procedury organizacyjne. Wszystkie odpowiedzi, podsumowania i analizy muszą być oparte wyłącznie na informacjach zawartych w dostarczonych fragmentach dokumentów.

Gdy użytkownik zadaje pytanie lub wydaje polecenie:
1. Dokładnie przeanalizuj zapytanie w kontekście dostarczonych fragmentów stron.
2. Formułuj odpowiedzi wyłącznie na podstawie tych fragmentów.
3. Jeśli w dokumentach nie ma informacji potrzebnych do odpowiedzi, jasno poinformuj, że nie znalazłeś odpowiedzi w dostarczonych materiałach.
4. Bądź precyzyjny, rzeczowy i nie podawaj informacji spoza dokumentów.
Twoim celem jest pomaganie użytkownikowi w zrozumieniu dokumentacji Confluence na podstawie dostarczonych materiałów.
`;

  constructor(private chatEngine: SimpleChatEngine) {
    super();
  }

  async generateStreamingResponse(
    input: GenerateResponseInput & {
      analysisResult: Awaited<AnalyzedQueryResult>;
    }
  ): Promise<StreamingResponseResult> {
    const { query, nodes, analysisResult } = input;
    const contents = nodes.map((node) =>
      node.node.getContent(MetadataMode.NONE)
    );

    const contextualPrompt = this.buildContextualPrompt(
      query,
      contents,
      analysisResult
    );

    return {
      sources: this.extractSources(nodes),
      stream: await this.chatEngine.chat({
        message: contextualPrompt,
        stream: true,
      }),
    };
  }

  /**
   * Buduje kontekstowy prompt z dokumentami i analizą
   */
  protected buildContextualPrompt(
    query: string,
    documents: string[],
    analysisResult: Awaited<AnalyzedQueryResult>
  ): string {
    const dokumenty = documents.join("\n\n");
    const zapytanie = query;
    const { analysis, decision, responsePlan } = analysisResult;

    // Sekcja analizy
    const analizaKontekstu = this.buildAnalysisContext(
      analysis,
      decision,
      responsePlan
    );

    return `
${ConfluenceResponseGenerator.SYSTEM_PROMPT}

${analizaKontekstu}

Na podstawie poniższych fragmentów stron Confluence:
<fragmenty dokumentów>
${dokumenty}
</fragmenty dokumentów>

Oraz biorąc pod uwagę zapytanie użytkownika:
\`${zapytanie}\`

Wykonaj następujące:
1. Przeanalizuj zapytanie użytkownika, uwzględniając powyższą analizę.
2. Odpowiedz *wyłącznie* na podstawie dostarczonych fragmentów stron.
3. ${this.getFormatGuidance(responsePlan.formatType)}
4. Jeśli fragmenty są niewystarczające do pełnej odpowiedzi, jasno wskaż, czego brakuje lub czego nie można znaleźć w podanym kontekście. Nie wymyślaj informacji i nie korzystaj z wiedzy spoza dokumentów.

Zapytanie użytkownika: \`${zapytanie}\`
Twoja odpowiedź (oparta *wyłącznie* na dostarczonych fragmentach):
`;
  }

  /**
   * Buduje sekcję analizy kontekstu do promptu
   */
  private buildAnalysisContext(
    analysis: Awaited<AnalyzedQueryResult>["analysis"],
    decision: Awaited<AnalyzedQueryResult>["decision"],
    responsePlan: Awaited<AnalyzedQueryResult>["responsePlan"]
  ): string {
    const contextParts: string[] = [];

    // Informacje o analizie zapytania
    if (analysis.queryType) {
      contextParts.push(`Typ zapytania: ${analysis.queryType}`);
    }
    if (analysis.isFollowUp !== undefined) {
      contextParts.push(
        `Czy to kontynuacja wcześniejszego wątku: ${analysis.isFollowUp ? "Tak" : "Nie"
        }`
      );
    }

    // Informacje o planie odpowiedzi
    contextParts.push(`Oczekiwany format odpowiedzi: ${responsePlan.formatType}`);
    contextParts.push(`Strategia pozyskiwania informacji: ${responsePlan.sourcingStrategy}`);
    if (responsePlan.citationRequirements !== undefined) {
      contextParts.push(
        `Czy wymagane są cytowania: ${responsePlan.citationRequirements ? "Tak" : "Nie"
        }`
      );
    }
    if (
      responsePlan.contentStructure?.mainPoints &&
      responsePlan.contentStructure.mainPoints.length > 0
    ) {
      contextParts.push(
        `Kluczowe obszary: ${responsePlan.contentStructure.mainPoints.join(", ")}`
      );
    }
    if (
      responsePlan.contextualEnhancements &&
      responsePlan.contextualEnhancements.length > 0
    ) {
      contextParts.push(
        `Dodatkowe konteksty: ${responsePlan.contextualEnhancements.join(", ")}`
      );
    }
    if (decision.suggestedActions && decision.suggestedActions.length > 0) {
      contextParts.push(
        `Sugerowane działania: ${decision.suggestedActions.join(", ")}`
      );
    }
    if (contextParts.length === 0) return "";
    return `
<analiza zapytania>
Wykonano następującą analizę zapytania użytkownika:
${contextParts.join("\n")}
</analiza zapytania>
`;
  }

  /**
   * Wskazówki dotyczące formatu odpowiedzi na podstawie planu
   */
  private getFormatGuidance(formatType: string): string {
    switch (formatType) {
      case "list":
        return 'Jeśli zapytanie dotyczy listy (np. wymagań, funkcji, celów), wypisz je w punktach lub numerowanej liście. Jeśli użytkownik prosi o konkretną liczbę (np. "10 głównych wymagań"), postaraj się wskazać tyle, ile to możliwe, wybierając najważniejsze na podstawie kontekstu.';
      case "summary":
        return 'Jeśli zapytanie dotyczy podsumowania lub wyjaśnienia, przedstaw je zwięźle, korzystając wyłącznie z fragmentów, skupiając się na kluczowych punktach.';
      case "detailed":
        return "Udziel szczegółowej odpowiedzi, która kompleksowo odnosi się do wszystkich aspektów zapytania, z odpowiednim kontekstem i cytatami z dokumentów.";
      case "comparison":
        return "Jeśli porównujesz elementy lub koncepcje, jasno wskaż podobieństwa, różnice i ich znaczenie na podstawie treści stron.";
      default:
        return "Odpowiedz w sposób przejrzysty i kompletny, dostosowany do charakteru zapytania.";
    }
  }
}
