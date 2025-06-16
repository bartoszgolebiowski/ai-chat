import { EngineResponse, Metadata, NodeWithScore } from "llamaindex";
import { Source } from "../../response-generator-base";
import { QueryAnalyzerConfluence } from "./query-analyzer";
import { ConfluenceResponseGenerator } from "./response-generator";
import { IRagStrategy } from "./strategies/IRagStrategy";

// Enhanced interfaces from the plan
export interface EnhancedRagOptions {
  retrievalTopK?: number;
  rerankTopK?: number;
  rerankStrategy?: "semantic" | "hybrid";
  contextAnalysisThreshold?: number; // 0-1, threshold for context sufficiency
  maxContextNodes?: number; // Limit previous context nodes
  contextWeightFactor?: number; // Boost factor for previous context in reranking
  selectedNodes?: string[]; // Selected nodes from UI
  previousContext?: {
    query: string;
    response: string;
    nodes: NodeWithScore<Metadata>[];
  }[];
}

interface EnhancedRagResult {
  stream: AsyncIterable<EngineResponse>;
  sources: Source[];
  nodes: NodeWithScore[];
}

export class EnhancedConfluenceRAGEngine {
  constructor(
    private strategies: Record<string, IRagStrategy>,
    private responseGenerator: ConfluenceResponseGenerator,
    private queryAnalyzer: QueryAnalyzerConfluence
  ) {}

  async execute(
    query: string,
    options: EnhancedRagOptions = {}
  ): Promise<EnhancedRagResult> {
    const {
      retrievalTopK = 10,
      rerankTopK = 8,
      rerankStrategy = "hybrid",
      contextAnalysisThreshold = 0.7,
      maxContextNodes = 12,
      contextWeightFactor = 1.5,
      previousContext = [],
      selectedNodes = [],
    } = options;

    const analysisResult = await this.queryAnalyzer.analyzeAndPlan({
      query,
      previousContext,
    });

    const { decision, responsePlan } = analysisResult;

    console.log(
      `Enhanced Confluence RAG: Strategy: ${decision.strategy}, Confidence: ${decision.confidence}`
    );
    console.log(
      `Response Plan: ${responsePlan.sourcingStrategy} sourcing, ${responsePlan.formatType} format`
    );

    // Use strategy pattern
    const strategy = this.strategies[decision.strategy];

    if (!strategy) throw new Error(`Unknown decision: ${decision}`);

    const { nodes: finalNodes } = await strategy.run({
      query,
      options: {
        retrievalTopK,
        rerankTopK,
        rerankStrategy,
        contextAnalysisThreshold,
        maxContextNodes,
        contextWeightFactor,
        previousContext,
        selectedNodes,
      },
    });

    // Generate streaming response with enhanced context
    const { stream, sources } =
      await this.responseGenerator.generateStreamingResponse({
        query,
        nodes: finalNodes,
        analysisResult,
      });

    console.log(
      `Enhanced RAG completed: Used ${finalNodes.length} nodes via ${decision} strategy`
    );

    return {
      stream,
      sources,
      nodes: finalNodes,
    };
  }
}
