import { EngineResponse, NodeWithScore } from "llamaindex";
import { ChatHistory } from "../../cache/conversation-memory-cache";
import { Source } from "../rag-response-sources";
import { ConfluenceQueryPlanner } from "./confluence-query-planner";
import { ConfluenceResponseGenerator } from "./confluence-response-generator";
import { ConfluenceRetrival } from "./retrival/confluence-retrival";

// Enhanced interfaces
export interface ConfluenceRagEngineParams {
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

interface ConfluenceRagEngineResult {
  stream: AsyncIterable<EngineResponse>;
  sources: Source[];
  nodes: NodeWithScore[];
}

export class ConfluenceRagEngine {
  constructor(
    private retrievalStrategies: ConfluenceRetrival,
    private readonly confluenceResponseGenerator: ConfluenceResponseGenerator,
    private readonly confluenceQueryPlanner: ConfluenceQueryPlanner
  ) {}

  async execute(
    userQuery: string,
    options: ConfluenceRagEngineParams = {}
  ): Promise<ConfluenceRagEngineResult> {
    const {
      retrievalTopK = 30,
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
      await this.confluenceResponseGenerator.generateStreamingResponse({
        query: userQuery,
        nodes: retrievedNodes,
        analysisResult,
        previousContext,
      });

    return {
      stream,
      sources,
      nodes: retrievedNodes,
    };
  }
}
