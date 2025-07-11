import {
  MetadataMode,
  NodeWithScore,
  SimpleChatEngine
} from "llamaindex";
import { ChatHistory } from "../../cache/conversation-memory-cache";
import {
  GenerateResponseInput,
  ResponseSources,
  StreamingResponseResult,
} from "../rag-response-sources";
import { CombinedOutput } from "./confluence-schemas";

export class ConfluenceResponseGenerator {
  private static readonly SYSTEM_PROMPT = `
Jesteś asystentem AI wyspecjalizowanym w analizie i wyszukiwaniu informacji w dokumentacji Confluence. Twoim głównym zadaniem jest przetwarzanie i rozumienie treści stron Confluence, które zawierają szczegółowe informacje i procedury organizacyjne. Twoje odpowiedzi powinny być oparte przede wszystkim na informacjach zawartych w dostarczonych fragmentach dokumentów.

Gdy użytkownik zadaje pytanie lub wydaje polecenie:
1.  Dokładnie przeanalizuj zapytanie w kontekście dostarczonych fragmentów stron.
2.  Sformułuj odpowiedź na podstawie informacji znalezionych w tych fragmentach.
3.  Jeśli bezpośrednia odpowiedź nie jest dostępna, ale dostarczony kontekst zawiera wystarczające informacje, możesz wysnuć odpowiedź na drodze logicznej dedukcji. Wyraźnie zaznacz, że Twoja odpowiedź jest wynikiem dedukcji na podstawie dostępnych danych.
4.  Jeśli w dokumentach nie ma wystarczających informacji, aby odpowiedzieć na pytanie nawet poprzez dedukcję, jasno poinformuj, że informacja nie jest dostępna w dostarczonych materiałach.
5.  Bądź precyzyjny i rzeczowy. Nie podawaj informacji pochodzących z zewnętrznych źródeł wiedzy.
Twoim celem jest udzielenie odpowiedzi użytkownikowi na podstawie dostarczonych materiałów, włączając w to wyciąganie logicznych wniosków, gdy jest to uzasadnione.
`;

  constructor(private chatEngine: SimpleChatEngine) {}

  async generateStreamingResponse(
    input: GenerateResponseInput & {
      analysisResult: Awaited<CombinedOutput>;
      previousContext: ChatHistory;
    }
  ): Promise<StreamingResponseResult> {
    const { query, nodes, analysisResult, previousContext } = input;

    const contextualPrompt = this.buildContextualPrompt(
      query,
      nodes,
      analysisResult,
      previousContext
    );

    return {
      sources: ResponseSources.extractSources(nodes),
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
    nodes: NodeWithScore[],
    analysisResult: CombinedOutput,
    previousContext: ChatHistory
  ): string {
    const documents = nodes.map((node) =>
      node.node.getContent(MetadataMode.NONE)
    );

    const { responsePlan } = analysisResult;

    return `
${ConfluenceResponseGenerator.SYSTEM_PROMPT}

${this.buildAnalysisContext(analysisResult)}

Na podstawie poniższych fragmentów stron Confluence:
<fragmenty dokumentów>
${documents.join("\n\n")}
</fragmenty dokumentów>

Oraz wcześniejszej historii zapytań i odpowiedzi, jeśli dotyczy:
<historia>
${previousContext
  .map((message, index) => {
    return `<message id="${index}">
      <user>${message.userQuery}</user>
      <assistant>${message.chatResponse}</assistant>
    </message>`;
  })
  .join("\n")}
</historia>

Oraz biorąc pod uwagę zapytanie użytkownika:
\`${query}\`

Wykonaj następujące:
1. Przeanalizuj zapytanie użytkownika, uwzględniając powyższą analizę.
2. Odpowiedz *wyłącznie* na podstawie dostarczonych fragmentów stron.
3. ${this.getFormatGuidance(responsePlan.formatType)}
4. Jeśli fragmenty są niewystarczające do pełnej odpowiedzi, jasno wskaż, czego brakuje lub czego nie można znaleźć w podanym kontekście. Nie wymyślaj informacji i nie korzystaj z wiedzy spoza dokumentów.

Zapytanie użytkownika: \`${query}\`
Twoja odpowiedź (oparta *wyłącznie* na dostarczonych fragmentach):
`;
  }

  /**
   * Buduje sekcję analizy kontekstu do promptu
   */
  private buildAnalysisContext(analysisResult: CombinedOutput): string {
    const { analysis, decision, responsePlan } = analysisResult;
    const contextParts: string[] = [];

    // Informacje o analizie zapytania
    if (analysis.queryType) {
      contextParts.push(`Typ zapytania: ${analysis.queryType}`);
    }
    if (analysis.isFollowUp !== undefined) {
      contextParts.push(
        `Czy to kontynuacja wcześniejszego wątku: ${
          analysis.isFollowUp ? "Tak" : "Nie"
        }`
      );
    }

    // Informacje o planie odpowiedzi
    contextParts.push(
      `Oczekiwany format odpowiedzi: ${responsePlan.formatType}`
    );
    contextParts.push(
      `Strategia pozyskiwania informacji: ${responsePlan.sourcingStrategy}`
    );
    if (responsePlan.citationRequirements !== undefined) {
      contextParts.push(
        `Czy wymagane są cytowania: ${
          responsePlan.citationRequirements ? "Tak" : "Nie"
        }`
      );
    }
    if (
      responsePlan.contentStructure?.mainPoints &&
      responsePlan.contentStructure.mainPoints.length > 0
    ) {
      contextParts.push(
        `Kluczowe obszary: ${responsePlan.contentStructure.mainPoints.join(
          ", "
        )}`
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
        return "Jeśli zapytanie dotyczy podsumowania lub wyjaśnienia, przedstaw je zwięźle, korzystając wyłącznie z fragmentów, skupiając się na kluczowych punktach.";
      case "detailed":
        return "Udziel szczegółowej odpowiedzi, która kompleksowo odnosi się do wszystkich aspektów zapytania, z odpowiednim kontekstem i cytatami z dokumentów.";
      case "comparison":
        return "Jeśli porównujesz elementy lub koncepcje, jasno wskaż podobieństwa, różnice i ich znaczenie na podstawie treści stron.";
      default:
        return "Odpowiedz w sposób przejrzysty i kompletny, dostosowany do charakteru zapytania.";
    }
  }
}
