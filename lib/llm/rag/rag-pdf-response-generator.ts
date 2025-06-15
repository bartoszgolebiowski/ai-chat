import { MetadataMode, SimpleChatEngine } from "llamaindex";
import { ResponseGeneratorBase } from "../ResponseGeneratorBase";

export class PDFResponseGenerator extends ResponseGeneratorBase {
  private static readonly SYSTEM_PROMPT = `
You are an AI assistant specialized in analyzing tender specification documents. Your primary function is to process and understand the content of PDF documents, which contain detailed specifications for a solution in a tender process. You must base all your answers, summaries, and analyses strictly on the information contained within these provided documents.

When a user asks a question or gives a command:
1.  Carefully analyze the query in the context of the provided document excerpts.
2.  Formulate your response using only the information found in these excerpts.
3.  If the documents do not contain the information needed to answer a question or fulfill a command, clearly state that the information is not available in the provided materials.
4.  Be precise, factual, and avoid making assumptions or providing information from external knowledge sources.
Your goal is to help the user understand the tender specifications thoroughly and accurately based on the supplied documents.
`;

  constructor(private chatEngine: SimpleChatEngine) {
    super();
  }

  async generateStreamingResponse(
    input: Parameters<ResponseGeneratorBase["generateStreamingResponse"]>[0]
  ): ReturnType<ResponseGeneratorBase["generateStreamingResponse"]> {
    const { query, nodes } = input;

    const contents = nodes.map((node) =>
      node.node.getContent(MetadataMode.NONE)
    );

    const contextualPrompt = this.buildContextualPrompt(query, contents);

    return {
      sources: [],
      stream: await this.chatEngine.chat({
        message: contextualPrompt,
        stream: true,
      }),
    };
  }

  /**
   * Build contextual prompt with documents
   */
  protected buildContextualPrompt(query: string, documents: string[]): string {
    const document_context = documents.join("\n\n");
    const user_query = query;

    return `
${PDFResponseGenerator.SYSTEM_PROMPT}

Given the following excerpts from the tender specification documents:
\`\`\`
${document_context}
\`\`\`

And considering the user's request:
\`${user_query}\`

Please perform the following:
1.  Analyze the user's request carefully.
2.  Based *solely* on the provided document excerpts, generate a comprehensive and accurate response to the user's request.
3.  If the request asks for a list of items (e.g., requirements, features, objectives), extract and list them clearly. If a specific number is requested (e.g., "10 main requirements"), attempt to identify and list that many, prioritizing the most significant ones based on the context.
4.  If the request asks for a summary or explanation (e.g., "what is about this documents"), provide it concisely using only information from the excerpts.
5.  If the provided excerpts are insufficient to fully address the user's request, clearly state what information is missing or cannot be found within the given context. Do not invent information or use external knowledge.

User Request: \`${user_query}\`
Your Response based *only* on the provided document excerpts:
`;
  }
}
