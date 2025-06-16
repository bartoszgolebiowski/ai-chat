import { PDFDecisionEngine } from "./decision-engine";
import {
  PDFQueryAnalysisEngine,
  QueryAnalysisInput,
} from "./query-analysis-engine";
import { PDFResponsePlanner } from "./response-planner";

export type AnalyzedQueryResult = ReturnType<
  PDFQueryAnalyzer["analyzeAndPlan"]
>;

export class PDFQueryAnalyzer {
  constructor(
    private responsePlanner: PDFResponsePlanner,
    private queryAnalysisEngine: PDFQueryAnalysisEngine,
    private decisionEngine: PDFDecisionEngine
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
