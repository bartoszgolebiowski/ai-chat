import { generateText } from "ai";
import { LLM } from "../../../models/llm";

export class PdfQueryRewriter {
  constructor(private readonly llmModel: LLM) {}

  /**
   * Reformulate the user query for better retrieval.
   * @param userQuery The original user query.
   * @returns Promise resolving to a reformulated query string.
   */
  async reformulate(userQuery: string): Promise<string> {
    const prompt = `Rewrite or clarify the following search query for better retrieval. Provide only the improved query.\nQuery: "${userQuery}"`;
    try {
      const reformulatedResult = await generateText({
        model: this.llmModel,
        prompt: prompt,
        temperature: 0.2,
      });
      return reformulatedResult.text.trim();
    } catch (error) {
      // Fallback: return original query if LLM call fails
      return userQuery;
    }
  }
}
