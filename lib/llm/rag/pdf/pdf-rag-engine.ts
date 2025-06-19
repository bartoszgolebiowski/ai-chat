import { EngineResponse, NodeWithScore } from "llamaindex";
import { Metadata } from "next";
import { Source } from "../rag-response-sources";
import { PdfQueryPlanner } from "./pdf-query-planner";
import { PdfQueryRewriter } from "./pdf-query-rewriter";
import { PdfResponseGenerator } from "./pdf-response-generator";
import { IPdfRetrievalStrategy } from "./strategies/pdf-retrieval-strategy.interface";

// Enhanced interfaces
export interface PdfRagEngineParams {
  retrievalTopK?: number;
  rerankThreshold?: number;
  rerankStrategy?: "llm";
  contextAnalysisThreshold?: number;
  maxContextNodes?: number;
  contextWeightFactor?: number;
  selectedNodes?: string[];
  previousContext?: {
    userQuery: string;
    userResponse: string;
    contextNodes: NodeWithScore<Metadata>[];
  }[];
}

interface PdfRagEngineResult {
  stream: AsyncIterable<EngineResponse>;
  sources: Source[];
  nodes: NodeWithScore[];
}

/**
 * Enhanced RAG Engine specifically designed for PDF document analysis
 * with advanced query understanding and response planning.
 * All dependencies are injected via constructor - no field instantiation.
 */
export class PdfRagEngine {
  constructor(
    private retrievalStrategies: Record<string, IPdfRetrievalStrategy>,
    private readonly pdfResponseGenerator: PdfResponseGenerator,
    private readonly pdfQueryAnalyzer: PdfQueryPlanner,
    private readonly pdfQueryReformulator: PdfQueryRewriter
  ) {}

  async execute(
    userQuery: string,
    options: PdfRagEngineParams = {}
  ): Promise<PdfRagEngineResult> {
    const {
      retrievalTopK = 30,
      rerankThreshold = 0.5,
      rerankStrategy = "llm",
      contextAnalysisThreshold = 0.7,
      maxContextNodes = 15,
      contextWeightFactor = 1.5,
      previousContext = [],
      selectedNodes = [],
    } = options;

    const reformulatedUserQuery = await this.pdfQueryReformulator.reformulate(
      userQuery
    );

    const analysisResult = await this.pdfQueryAnalyzer.plan({
      userQuery: reformulatedUserQuery,
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
    const strategy = this.retrievalStrategies[decision.strategy];

    if (!strategy) throw new Error(`Unknown decision: ${decision}`);

    const { nodes: retrievedNodes } = await strategy.run({
      query: userQuery,
      options: {
        retrievalTopK,
        rerankThreshold,
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
      await this.pdfResponseGenerator.generateStreamingResponse({
        query: userQuery,
        nodes: retrievedNodes,
        analysisResult,
      });

    return {
      stream,
      sources,
      nodes: retrievedNodes,
    };
  }
}
