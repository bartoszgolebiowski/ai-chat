import { generateObject } from "ai";
import { MetadataMode, NodeWithScore } from "llamaindex";
import type { LLM } from "../../../models/llm";
import { AIQueryAnalysis, QueryAnalysisSchema } from "./schemas";

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
  queryType: string;
}

/**
 * Handles query analysis using AI to determine type and context dependency
 */
export class PDFQueryAnalysisEngine {
  constructor(private llm: LLM) {}

  /**
   * Analyze query using AI to determine type and context dependency
   */
  async analyzeQuery(input: QueryAnalysisInput): Promise<QueryAnalysisOutput> {
    const { query, previousContext = [] } = input;

    // Prepare context summary for AI analysis
    const contextSummary = this.prepareAnalyzeSummary(previousContext);

    try {
      // Use AI to analyze the query
      const aiAnalysis = await this.performAIAnalysis(query, contextSummary);

      return aiAnalysis;
    } catch (error) {
      console.warn(
        "AI analysis failed, falling back to rule-based analysis:",
        error
      );
      throw error;
    }
  }

  /**
   * Prepare context summary for AI analysis
   */
  private prepareAnalyzeSummary(
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
    return `You are an expert PDF document analyzer and knowledge assistant. Your goal is to understand user queries and provide accurate information from PDF documents.

Current Query: <query>${query}</query>

Previous Context:
<context>${contextSummary}</context>

Analyze the query considering these aspects:

1. Query Intent Analysis:
   - What is the user trying to achieve?
   - Is this a factual question, analysis request, or comparison?
   - Does it require numerical data, text explanation, or both?
   - Should we extract specific sections or synthesize multiple parts?

2. Document Context Requirements:
   - What specific document sections might be relevant?
   - Do we need to compare information across multiple documents?
   - Are temporal aspects (dates, versions) important?
   - Should we focus on tables, figures, or text content?

3. Response Strategy:
   - Should we prioritize direct quotes or summarized information?
   - Do we need to combine information from multiple sources?
   - Is mathematical or logical reasoning required?
   - Should we include supporting context or definitions?

4. Missing Information Assessment:
   - What additional context might help answer this query?
   - Are there ambiguous terms that need clarification?
   - Do we need specific document metadata?

Please analyze the query and determine:

1. **Query Type**: Classify the query as one of:
   - "fact-extraction": The user wants specific facts or data points from documents
   - "document-comparison": The user wants to compare information across documents
   - "numerical-analysis": The user needs mathematical calculations or data analysis
   - "temporal-analysis": The user is asking about time-based changes or trends
   - "definition-lookup": The user wants definitions or explanations of terms
   - "relationship-analysis": The user wants to understand relationships between concepts
   - "table-extraction": The user needs data from tables or structured content
   - "figure-analysis": The user is asking about charts, graphs, or images
   - "clarification": The user is asking for clarification about something from previous context
   - "follow-up": The user is continuing the previous conversation with related questions

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
}
