import { generateObject } from "ai";
import { Metadata, MetadataMode, NodeWithScore } from "llamaindex";
import { LLM } from "../../../models/llm";
import { CombinedSchema, PdfQueryAnalyzerResult } from "./pdf-schemas";

interface PdfQueryPlannerParams {
  userQuery: string;
  previousContext?: {
    userQuery: string;
    userResponse: string;
    contextNodes: NodeWithScore<Metadata>[];
  }[];
}

export class PdfQueryPlanner {
  constructor(private readonly llmModel: LLM) {}

  async plan(params: PdfQueryPlannerParams): Promise<PdfQueryAnalyzerResult> {
    const contextSummary = this.buildContextSummary(params.previousContext);
    const unifiedPrompt = `As an expert in query analysis and response planning for Confluence documentation:

1. Analyze the user's query and previous conversation context.
2. Based on this analysis, decide on the search strategy.
3. Develop a detailed response plan.
4. Return the result as a JSON object with three fields: "analysis", "decision", and "responsePlan".
5. The answer should be in English.

Return the result as a JSON object:
{
  "analysis": { ... },
  "decision": { ... },
  "responsePlan": { ... }
}

Query: "${params.userQuery}"

Summary of previous context:
${contextSummary}
`;
    const result = await generateObject({
      model: this.llmModel,
      prompt: unifiedPrompt,
      temperature: 0.2,
      schema: CombinedSchema,
    });

    return result.object;
  }

  private buildContextSummary(
    previousContext: PdfQueryPlannerParams["previousContext"]
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
Query: ${context.userQuery}
Response: ${context.userResponse.substring(0, 300)}...
Sources: ${nodeContents || "No sources"}`;
    });
    return summaries.join("\n\n");
  }
}
