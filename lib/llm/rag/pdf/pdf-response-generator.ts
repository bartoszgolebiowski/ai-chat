import { MetadataMode, NodeWithScore, SimpleChatEngine } from "llamaindex";
import { ChatHistory } from "../../cache/conversation-memory-cache";
import {
  GenerateResponseInput,
  ResponseSources,
  StreamingResponseResult,
} from "../rag-response-sources";
import { PdfQueryAnalyzerResult } from "./pdf-schemas";

export class PdfResponseGenerator {
  private static readonly SYSTEM_PROMPT = `
You are an AI assistant specialized in analyzing tender specification documents. Your primary function is to process and understand the content of PDF documents, which contain detailed specifications for a solution in a tender process. You must base all your answers, summaries, and analyses strictly on the information contained within these provided documents.

When a user asks a question or gives a command:
1.  Carefully analyze the query in the context of the provided document excerpts.
2.  Formulate your response using only the information found in these excerpts.
3.  If the documents do not contain the information needed to answer a question or fulfill a command, clearly state that the information is not available in the provided materials.
4.  Be precise, factual, and avoid making assumptions or providing information from external knowledge sources.
Your goal is to help the user understand the tender specifications thoroughly and accurately based on the supplied documents.
`;

  constructor(private chatEngine: SimpleChatEngine) {}

  async generateStreamingResponse(
    input: GenerateResponseInput & {
      analysisResult: PdfQueryAnalyzerResult;
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
   * Build contextual prompt with documents
   */
  protected buildContextualPrompt(
    query: string,
    nodes: NodeWithScore[],
    analysisResult: PdfQueryAnalyzerResult,
    previousContext: ChatHistory
  ): string {
    const user_query = query;
    const { responsePlan } = analysisResult;

    return `
${PdfResponseGenerator.SYSTEM_PROMPT}

The following comprehensive analysis has been performed on the user's query:
<query_analysis>
${this.buildAnalysisContext(analysisResult)}
</query_analysis>

Given the following excerpts from the tender specification documents:
<document_excerpts>
${this.buildDocumentExcerpts(nodes)}
</document_excerpts>

And the previous conversation history, if applicable:
<history>
${this.buildHistoryContext(previousContext)}
</history>

And considering the user's request:
<user_request>
${user_query}
</user_request>

Please perform the following:
1.  Analyze the user's request carefully, taking into account the query analysis insights provided above.
2.  Based *solely* on the provided document excerpts, generate a comprehensive and accurate response to the user's request.
3.  ${this.getFormatGuidance(responsePlan.formatType)}
4.  If the provided excerpts are insufficient to fully address the user's request, clearly state what information is missing or cannot be found within the given context. Do not invent information or use external knowledge.

<user_request>
${user_query}
</user_request>

Your Response based *only* on the provided document excerpts:
`;
  }

  private buildDocumentExcerpts(nodes: NodeWithScore[]) {
    const contents = nodes.map((node) =>
      node.node.getContent(MetadataMode.NONE)
    );

    return contents.join("\n\n");
  }

  private buildHistoryContext(previousContext: ChatHistory) {
    return previousContext
      .map((message, index) => {
        return `<message id="${index}">
      <user>${message.userQuery}</user>
      <assistant>${message.chatResponse}</assistant>
    </message>`;
      })
      .join("\n");
  }

  /**
   * Build analysis context section for the prompt
   */
  private buildAnalysisContext(analysisResult: PdfQueryAnalyzerResult): string {
    const { analysis, decision, responsePlan } = analysisResult;
    const contextParts: string[] = [];

    // Query Analysis Information
    if (analysis.queryType) {
      contextParts.push(`Query Type: ${analysis.queryType}`);
    }

    if (analysis.isFollowUp !== undefined) {
      contextParts.push(
        `Follow-up Query: ${analysis.isFollowUp ? "Yes" : "No"}`
      );
    }

    // Response Plan Information
    contextParts.push(`Expected Response Format: ${responsePlan.formatType}`);
    contextParts.push(`Sourcing Strategy: ${responsePlan.sourcingStrategy}`);

    if (responsePlan.citationRequirements !== undefined) {
      contextParts.push(
        `Citations Required: ${
          responsePlan.citationRequirements ? "Yes" : "No"
        }`
      );
    }

    if (
      responsePlan.contentStructure?.mainPoints &&
      responsePlan.contentStructure.mainPoints.length > 0
    ) {
      contextParts.push(
        `Key Focus Areas: ${responsePlan.contentStructure.mainPoints.join(
          ", "
        )}`
      );
    }

    if (
      responsePlan.contextualEnhancements &&
      responsePlan.contextualEnhancements.length > 0
    ) {
      contextParts.push(
        `Contextual Enhancements: ${responsePlan.contextualEnhancements.join(
          ", "
        )}`
      );
    }

    if (decision.suggestedActions && decision.suggestedActions.length > 0) {
      contextParts.push(
        `Suggested Actions: ${decision.suggestedActions.join(", ")}`
      );
    }

    if (contextParts.length === 0) return "";

    return contextParts.join("\n");
  }

  /**
   * Get format-specific guidance based on response plan
   */
  private getFormatGuidance(formatType: string): string {
    switch (formatType) {
      case "list":
        return 'If the request asks for a list of items (e.g., requirements, features, objectives), extract and list them clearly with bullet points or numbered format. If a specific number is requested (e.g., "10 main requirements"), attempt to identify and list that many, prioritizing the most significant ones based on the context.';
      case "summary":
        return 'If the request asks for a summary or explanation (e.g., "what is about this documents"), provide it concisely using only information from the excerpts, focusing on key points and main themes.';
      case "detailed":
        return "Provide a comprehensive and detailed response that thoroughly addresses all aspects of the query, including relevant context and supporting details from the documents.";
      case "comparison":
        return "When comparing items or concepts, clearly structure your response to highlight similarities, differences, and relative importance based on the document content.";
      default:
        return "Structure your response appropriately based on the nature of the request, ensuring clarity and completeness.";
    }
  }
}
