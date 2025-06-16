import { generateObject } from "ai";
import { z } from "zod";
import { LLM } from "../../../models/llm";
import {
  ConfluenceDecisionAnalysisSchema,
  ConfluenceResponsePlanSchema,
  QueryAnalysisInput,
  QueryAnalysisSchema,
} from "./schemas";

// Combined schema for LLM output
const CombinedSchema = z.object({
  analysis: QueryAnalysisSchema,
  decision: ConfluenceDecisionAnalysisSchema,
  responsePlan: ConfluenceResponsePlanSchema,
});

type CombinedOutput = z.infer<typeof CombinedSchema>;

export class ConfluenceOrchestratorSingleCall {
  constructor(private llm: LLM) {}

  async analyzeAndPlan(input: QueryAnalysisInput): Promise<CombinedOutput> {
    const contextSummary = this.prepareContextSummary(input.previousContext);
    const unifiedPrompt = `Jako ekspert w analizie zapytań i planowaniu odpowiedzi dla dokumentacji Confluence:

1. Przeanalizuj zapytanie użytkownika i poprzedni kontekst rozmowy (jak QueryAnalysisEngine).
2. Na podstawie tej analizy podejmij decyzję o strategii wyszukiwania (jak DecisionEngine).
3. Opracuj szczegółowy plan odpowiedzi (jak ResponsePlanner).
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
      const nodeContents = context.nodes
        .map((node) => {
          let text = "Content not available";
          try {
            text = node.content || node.text || JSON.stringify(node);
          } catch (error) {}
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
