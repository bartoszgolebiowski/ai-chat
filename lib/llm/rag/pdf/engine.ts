import { EngineResponse, NodeWithScore } from "llamaindex";
import { Metadata } from "next";
import { Source } from "../../response-generator-base";
import { PDFQueryAnalyzer } from "./query-analyzer";
import { PDFResponseGenerator } from "./response-generator";
import { IPDFRagStrategy } from "./strategies/IRagStrategy";

// Enhanced interfaces
export interface EnhancedPDFRagOptions {
  retrievalTopK?: number;
  rerankTopK?: number;
  rerankStrategy?: "semantic" | "hybrid";
  contextAnalysisThreshold?: number;
  maxContextNodes?: number;
  contextWeightFactor?: number;
  selectedNodes?: string[];
  previousContext?: {
    query: string;
    response: string;
    nodes: NodeWithScore<Metadata>[];
  }[];
}

interface EnhancedPDFRagResult {
  stream: AsyncIterable<EngineResponse>;
  sources: Source[];
  nodes: NodeWithScore[];
}

/**
 * Enhanced RAG Engine specifically designed for PDF document analysis
 * with advanced query understanding and response planning.
 * All dependencies are injected via constructor - no field instantiation.
 */
export class EnhancedPDFRAGEngine {
  constructor(
    private strategies: Record<string, IPDFRagStrategy>,
    private readonly responseGenerator: PDFResponseGenerator,
    private readonly queryAnalyzer: PDFQueryAnalyzer
  ) {
    // No field instantiation - all services are injected
  }

  async execute(
    query: string,
    options: EnhancedPDFRagOptions = {}
  ): Promise<EnhancedPDFRagResult> {
    const {
      retrievalTopK = 10,
      rerankTopK = 8,
      rerankStrategy = "hybrid",
      contextAnalysisThreshold = 0.7,
      maxContextNodes = 5,
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


    return {
      stream,
      sources,
      nodes: finalNodes,
    };
  }
}
