import { DecisionEngine } from "./decision-engine";
import {
  QueryAnalysisEngine,
  QueryAnalysisInput,
} from "./query-analysis-engine";
import { ResponsePlanner } from "./response-planner";

export type AnalyzedQueryResult = ReturnType<
  QueryAnalyzerPDF["analyzeAndPlan"]
>;

export class QueryAnalyzerPDF {
  constructor(
    private responsePlanner: ResponsePlanner,
    private queryAnalysisEngine: QueryAnalysisEngine,
    private decisionEngine: DecisionEngine
  ) {}

  /**
   * Comprehensive analysis including response planning
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
