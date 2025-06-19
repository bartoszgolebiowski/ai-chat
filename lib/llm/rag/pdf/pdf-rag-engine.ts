import { EngineResponse, NodeWithScore } from "llamaindex";
import { ChatHistory } from "../../cache/conversation-memory-cache";
import { Source } from "../rag-response-sources";
import { PdfQueryPlanner } from "./pdf-query-planner";
import { PdfQueryRewriter } from "./pdf-query-rewriter";
import { PdfResponseGenerator } from "./pdf-response-generator";
import { PdfRetrival } from "./retrival/pdf-retrival";

// Enhanced interfaces
export interface PdfRagEngineParams {
  retrievalTopK?: number;
  rerankThreshold?: number;
  rerankStrategy?: "llm";
  retrivalStrategy?: "new-search" | "context-only" | "new-search-and-context";
  contextAnalysisThreshold?: number;
  maxContextNodes?: number;
  contextWeightFactor?: number;
  selectedNodes?: string[];
  previousContext?: ChatHistory;
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
    private retrievalStrategies: PdfRetrival,
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

    const { nodes: retrievedNodes } = await this.retrievalStrategies.retrieve(
      userQuery,
      {
        retrievalTopK,
        rerankThreshold,
        rerankStrategy,
        retrivalStrategy: decision.strategy,
        contextAnalysisThreshold,
        maxContextNodes,
        contextWeightFactor,
        previousContext,
        selectedNodes,
      }
    );

    // Generate streaming response with enhanced context
    const { stream, sources } =
      await this.pdfResponseGenerator.generateStreamingResponse({
        query: userQuery,
        nodes: retrievedNodes,
        analysisResult,
        previousContext
      });

    return {
      stream,
      sources,
      nodes: retrievedNodes,
    };
  }
}
