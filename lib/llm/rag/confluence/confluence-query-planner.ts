import { generateObject } from "ai";
import { MetadataMode } from "llamaindex";
import { LLM } from "../../../models/llm";
import { ChatHistory } from "../../cache/conversation-memory-cache";
import { CombinedOutput, CombinedSchema } from "./confluence-schemas";

// Combined schema for LLM output

interface QueryAnalysisInput {
  query: string;
  previousContext?: ChatHistory;
}

export class ConfluenceQueryPlanner {
  constructor(private llm: LLM) {}

  async plan(input: QueryAnalysisInput): Promise<CombinedOutput> {
    const contextSummary = this.prepareContextSummary(input.previousContext);
    const unifiedPrompt = `Jako ekspert w analizie zapytań i planowaniu odpowiedzi dla dokumentacji Confluence:

1. Przeanalizuj zapytanie użytkownika i poprzedni kontekst rozmowy.
2. Na podstawie tej analizy podejmij decyzję o strategii wyszukiwania).
3. Opracuj szczegółowy plan odpowiedzi.
4. Zwróć wynik jako obiekt JSON z trzema polami: "analysis", "decision" i "responsePlan".
5. Odpowiedź powinna być w języku polskim.

Zwróć wynik jako obiekt JSON:
{
  "analysis": { ... },
  "decision": { ... },
  "responsePlan": { ... }
}

Zapytanie: "${input.query}"

Podsumowanie poprzedniego kontekstu:
${contextSummary}
Odpowiedź powinna być w języku polskim.
`;
    const result = await generateObject({
      model: this.llm,
      prompt: unifiedPrompt,
      temperature: 0.2,
      schema: CombinedSchema,
    });

    return result.object;
  }

  private prepareContextSummary(
    previousContext: QueryAnalysisInput["previousContext"]
  ): string {
    if (!previousContext || previousContext.length === 0) {
      return "No previous context available.";
    }
    const summaries = previousContext.map((context, index) => {
      const nodeContents = context.contextNodes
        .map((node) => {
          let text = "Content not available";
          try {
            text = node.node.getContent(MetadataMode.ALL);
          } catch (error) {}
          return text.substring(0, 200) + "...";
        })
        .join("\n");
      return `Turn ${index + 1}:
Zapytanie: "${context.userQuery}"
Odpowiedz: "${context.chatResponse.substring(0, 300)}..."
Zródła: ${nodeContents || "No sources"}`;
    });
    return summaries.join("\n\n");
  }
}
