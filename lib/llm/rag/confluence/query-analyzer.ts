import { LLM } from "../../../models/llm";
import { ConfluenceDecisionEngine } from "./decision-engine";
import { ConfluenceQueryAnalysisEngine } from "./query-analysis-engine";
import { ConfluenceResponsePlanner } from "./response-planner";
import { QueryAnalysisInput } from "./schemas";

export type AnalyzedQueryResult = ReturnType<
  QueryAnalyzerConfluence["analyzeAndPlan"]
>;

export class QueryAnalyzerConfluence {
  private queryAnalysisEngine: ConfluenceQueryAnalysisEngine;
  private decisionEngine: ConfluenceDecisionEngine;
  private responsePlanner: ConfluenceResponsePlanner;

  constructor(llm: LLM) {
    this.queryAnalysisEngine = new ConfluenceQueryAnalysisEngine(llm);
    this.decisionEngine = new ConfluenceDecisionEngine(llm);
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
