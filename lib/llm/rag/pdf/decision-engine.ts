import { generateObject } from "ai";
import type { LLM } from "../../../models/llm";
import { QueryAnalysisOutput } from "./query-analysis-engine";
import { DecisionAnalysis, DecisionAnalysisSchema } from "./schemas";

/**
 * Handles decision making using LLM-powered analysis
 */
export class PDFDecisionEngine {
  constructor(private llm: LLM) {}

  /**
   * Make decision using LLM-powered analysis
   */
  async makeDecision(
    analysis: QueryAnalysisOutput,
    contextAnalysisThreshold: number = 0.7
  ): Promise<DecisionAnalysis> {
    const decisionPrompt = `As a PDF document search strategist, analyze this query result to determine the optimal search strategy.

Query Analysis: <analysis>${JSON.stringify(analysis, null, 2)}</analysis>

Context Analysis Threshold: <threshold>${contextAnalysisThreshold}</threshold>

Determine the optimal search strategy considering:
1. Information freshness requirements - Does the query need the most current data?
2. Context completeness - Is the previous context sufficient to answer the query?
3. Query complexity - How complex is the information request?
4. Required document coverage - Do we need to search across multiple documents?

For each strategy option:
- context-only: Use only previous conversation context
- new-search: Perform fresh vector search ignoring context  
- hybrid: Combine previous context with new search results

Provide structured decision with clear reasoning and suggested actions.`;

    const result = await generateObject({
      model: this.llm,
      schema: DecisionAnalysisSchema,
      prompt: decisionPrompt,
      temperature: 0.2,
    });

    return result.object
  }
}
