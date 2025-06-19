import { EngineResponse, NodeWithScore } from "llamaindex";
import { Metadata } from "next";
import { Source } from "../rag-response-sources";
import { ConfluenceQueryPlanner } from "./confluence-query-planner";
import { ConfluenceResponseGenerator } from "./confluence-response-generator";
import { IConfluenceRetrievalStrategy } from "./strategies/confluence-retrieval-strategy.interface";

// Enhanced interfaces
export interface ConfluenceRagEngineParams {
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

interface ConfluenceRagEngineResult {
  stream: AsyncIterable<EngineResponse>;
  sources: Source[];
  nodes: NodeWithScore[];
}

export class ConfluenceRagEngine {
  constructor(
    private retrievalStrategies: Record<string, IConfluenceRetrievalStrategy>,
    private readonly confluenceResponseGenerator: ConfluenceResponseGenerator,
    private readonly confluenceQueryPlanner: ConfluenceQueryPlanner
  ) {}

  async execute(
    userQuery: string,
    options: ConfluenceRagEngineParams = {}
  ): Promise<ConfluenceRagEngineResult> {
    const {
      retrievalTopK = 20,
      rerankThreshold = 0.5,
      rerankStrategy = "llm",
      contextAnalysisThreshold = 0.7,
      maxContextNodes = 8,
      contextWeightFactor = 1.5,
      previousContext = [],
      selectedNodes = [],
    } = options;

    const analysisResult = await this.confluenceQueryPlanner.plan({
      query: userQuery,
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
      await this.confluenceResponseGenerator.generateStreamingResponse({
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
