import { generateObject } from "ai";
import { MetadataMode, NodeWithScore } from "llamaindex";
import { z } from "zod";
import type { LLM } from "../../models/llm";

export interface QueryAnalysisInput {
  query: string;
  previousContext?: {
    query: string;
    response: string;
    nodes: NodeWithScore[];
  }[];
}

export interface QueryAnalysisOutput {
  isFollowUp: boolean;
  requiresNewSearch: boolean;
  contextRelevance: number;
  missingInformation: string[];
  queryType: "clarification" | "follow-up" | "new-topic" | "elaboration";
}

// Zod schema for AI analysis
const QueryAnalysisSchema = z.object({
  queryType: z
    .enum(["clarification", "follow-up", "new-topic", "elaboration"])
    .describe(
      "Type of query based on its content and relation to previous context"
    ),
  isFollowUp: z
    .boolean()
    .describe("Whether this query is a continuation of the previous conversation"),
  contextRelevance: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "How relevant the previous context is for answering this query (0-1)"
    ),
  requiresNewSearch: z
    .boolean()
    .describe(
      "Whether a new vector search is needed to answer this query"
    ),
  confidence: z.number().min(0).max(1).describe("Confidence of the analysis (0-1)"),
  reasoning: z
    .string()
    .describe("Detailed reasoning for the analytical decision"),
  missingInformation: z
    .array(z.string())
    .describe("List of information types that might be missing from the context"),
  followUpIndicators: z
    .array(z.string())
    .describe("Specific words or phrases indicating this is a follow-up"),
});

type AIQueryAnalysis = z.infer<typeof QueryAnalysisSchema>;

export class QueryAnalyzerPDF {
  constructor(private llm: LLM) {}

  /**
   * Analyze query using AI to determine type and context dependency
   */
  async analyzeQuery(input: QueryAnalysisInput): Promise<QueryAnalysisOutput> {
    const { query, previousContext = [] } = input;

    // Prepare context summary for AI analysis
    const contextSummary = this.prepareContextSummary(previousContext);

    try {
      // Use AI to analyze the query
      const aiAnalysis = await this.performAIAnalysis(query, contextSummary);

      return {
        isFollowUp: aiAnalysis.isFollowUp,
        requiresNewSearch: aiAnalysis.requiresNewSearch,
        contextRelevance: aiAnalysis.contextRelevance,
        missingInformation: aiAnalysis.missingInformation,
        queryType: aiAnalysis.queryType,
      };
    } catch (error) {
      console.warn(
        "AI analysis failed, falling back to rule-based analysis:",
        error
      );
      throw error;
    }
  }

  /**
   * Make decision based on AI analysis
   */
  makeDecision(
    analysis: QueryAnalysisOutput,
    contextAnalysisThreshold: number = 0.7
  ) {
    const { contextRelevance, requiresNewSearch, isFollowUp } = analysis;

    // AI-informed decision logic
    if (!requiresNewSearch && contextRelevance >= contextAnalysisThreshold) {
      return "context-only";
    } else if (
      isFollowUp &&
      contextRelevance >= 0.3 &&
      contextRelevance < contextAnalysisThreshold
    ) {
      return "hybrid";
    } else {
      return "new-search";
    }
  }

  /**
   * Perform AI-powered analysis using generateObject
   */
  private async performAIAnalysis(
    query: string,
    contextSummary: string
  ): Promise<AIQueryAnalysis> {
    const prompt = this.buildAnalysisPrompt(query, contextSummary);

    const result = await generateObject({
      model: this.llm,
      schema: QueryAnalysisSchema,
      prompt,
      temperature: 0.1, // Low temperature for consistent analysis
    });

    return result.object;
  }

  /**
   * Build prompt for AI analysis
   */
  private buildAnalysisPrompt(query: string, contextSummary: string): string {
    return `You are an expert in analyzing queries for a conversational AI system. Your task is to analyze the user's query in the context of the previous conversation to determine the best search strategy.

Current Query: "${query}"

Summary of Previous Context:
${contextSummary}

Please analyze the query and determine:

1. **Query Type**: Classify the query as one of:
   - "clarification": The user is asking for clarification or more detail about something from the previous context.
   - "follow-up": The user is continuing the previous conversation by asking related questions.
   - "new-topic": The user is starting a completely new topic, unrelated to the previous context.
   - "elaboration": The user is asking for more detailed information on previous topics.

2. **Follow-up Nature**: Is this query directly related to the previous conversation?

3. **Context Relevance**: How relevant is the previous context for answering this query? (0.0 = completely irrelevant, 1.0 = completely relevant)

4. **Search Requirements**: Based on your analysis, does this query require:
   - A new vector search (for new topics or when context lacks information)
   - A context-only response (when previous context is sufficient)
   - Or a combination of both

5. **Confidence**: How confident are you in this analysis? (0.0 = very uncertain, 1.0 = very certain)

Consider the following factors:
- Direct references to previous content ("it", "that", "the one mentioned", etc.)
- Use of pronouns suggesting previous context
- Question words suggesting missing information
- Semantic relationship between the current query and previous context
- Whether the previous context contains sufficient information to answer the query

Provide detailed reasoning for your analysis.`;
  }
  /**
   * Prepare context summary for AI analysis
   */
  private prepareContextSummary(
    previousContext: QueryAnalysisInput["previousContext"]
  ): string {
    if (!previousContext || previousContext.length === 0) {
      return "No previous context available.";
    }

    const summaries = previousContext.map((context, index) => {
      const nodeContents = context.nodes
        .map((node) => {
          // Safely get text content from node
          let text = "Content not available";
          try {
            if (typeof node.node.getContent === "function") {
              text = node.node.getContent(MetadataMode.NONE);
            } else if ((node.node as any).text) {
              text = (node.node as any).text;
            } else if ((node.node as any).content) {
              text = (node.node as any).content;
            }
          } catch (error) {
            console.warn("Failed to extract node content:", error);
          }
          return text.substring(0, 200) + "...";
        })
        .join("\n");

      return `Turn ${index + 1}:
Query: "${context.query}"
Response: "${context.response.substring(0, 300)}..."
Sources: ${nodeContents || "No sources"}`;
    });

    return summaries.join("\n\n");
  }
}
