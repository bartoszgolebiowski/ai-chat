import { LLM } from "../../../models/llm";
import { DecisionEngine } from "./decision-engine";
import { QueryAnalysisEngine } from "./query-analysis-engine";
import { ConfluenceResponsePlanner } from "./response-planner";
import { QueryAnalysisInput } from "./schemas";

export type AnalyzedQueryResult = ReturnType<
  QueryAnalyzerConfluence["analyzeAndPlan"]
>;

export class QueryAnalyzerConfluence {
  private queryAnalysisEngine: QueryAnalysisEngine;
  private decisionEngine: DecisionEngine;
  private responsePlanner: ConfluenceResponsePlanner;

  constructor(llm: LLM) {
    this.queryAnalysisEngine = new QueryAnalysisEngine(llm);
    this.decisionEngine = new DecisionEngine(llm);
    this.responsePlanner = new ConfluenceResponsePlanner(llm);
  }

  /**
   * Analyze query, make decision, and plan response
   */
  async analyzeAndPlan(input: QueryAnalysisInput) {
    const analysis = await this.queryAnalysisEngine.analyzeQuery(input);
    const decision = await this.decisionEngine.makeDecision(analysis);

    try {
      const responsePlan = await this.responsePlanner.planResponse(
        input.query,
        decision
      );

      return {
        analysis,
        decision,
        responsePlan,
      };
    } catch (error) {
      console.warn("Response planning failed, using fallback plan:", error);
      return {
        analysis,
        decision,
        responsePlan: this.responsePlanner.createFallbackPlan(),
      };
    }
  }
}
