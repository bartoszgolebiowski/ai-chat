import { createFilenameFilters } from "@/lib/tree/filter-converter";
import { EngineResponse, MetadataFilters, NodeWithScore } from "llamaindex";
import { Metadata } from "next";
import { Reranker } from "../../Reranker";
import { Source } from "../../ResponseGeneratorBase";
import { RagQueryEngine } from "../rag-query-engine";
import { QueryAnalyzerPDF } from "./query-analyzer";
import { PDFResponseGenerator } from "./response-generator";
import { DecisionAnalysis } from "./schemas";

// Enhanced interfaces
interface EnhancedPDFRagOptions {
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
    private readonly queryEngine: RagQueryEngine,
    private readonly reranker: Reranker,
    private readonly responseGenerator: PDFResponseGenerator,
    private readonly queryAnalyzer: QueryAnalyzerPDF
  ) {
    // No field instantiation - all services are injected
  }

  async execute(
    query: string,
    options: EnhancedPDFRagOptions = {}
  ): Promise<EnhancedPDFRagResult> {
    const {
      retrievalTopK = 20,
      rerankTopK = 10,
      rerankStrategy = "hybrid",
      contextAnalysisThreshold = 0.7,
      maxContextNodes = 5,
      contextWeightFactor = 1.5,
      previousContext = [],
      selectedNodes = [],
    } = options;

    console.log(`Enhanced PDF RAG: Starting analysis for query: "${query}"`);

    // Phase 1: Comprehensive Query Analysis and Planning
    const analysisResult = await this.queryAnalyzer.analyzeAndPlan({
      query,
      previousContext,
    });

    const { decision, responsePlan } = analysisResult;

    console.log(
      `Enhanced PDF RAG: Strategy: ${decision.strategy}, Confidence: ${decision.confidence}`
    );
    console.log(
      `Response Plan: ${responsePlan.sourcingStrategy} sourcing, ${responsePlan.formatType} format`
    );

    let finalNodes: NodeWithScore[];
    let sources: Source[];

    // Phase 2: Execute search strategy based on decision
    switch (decision.strategy) {
      case "context-only":
        finalNodes = this.extractNodesFromContext(
          previousContext,
          maxContextNodes
        );
        sources = [];
        console.log(
          `Using context-only strategy with ${finalNodes.length} nodes`
        );
        break;

      case "new-search":
        const searchNodes = await this.performNewSearch(
          query,
          retrievalTopK,
          createFilenameFilters(selectedNodes),
          decision.searchParameters
        );
        const rerankResultNew = await this.reranker.rerank(query, searchNodes, {
          strategy: rerankStrategy,
          topK: Math.max(rerankTopK, Math.round(searchNodes.length / 2)),
        });
        finalNodes = rerankResultNew.nodes;
        sources = this.responseGenerator.extractSources(finalNodes);
        console.log(`New search completed with ${finalNodes.length} nodes`);
        break;

      case "hybrid":
        const newNodes = await this.performNewSearch(
          query,
          retrievalTopK,
          createFilenameFilters(selectedNodes),
          decision.searchParameters
        );
        const contextNodes = this.extractNodesFromContext(
          previousContext,
          maxContextNodes
        );
        const combinedNodes = this.combineAndDeduplicateNodes(
          contextNodes,
          newNodes
        );
        const rerankResult = await this.contextAwareRerank(
          query,
          combinedNodes,
          contextNodes.length,
          {
            strategy: rerankStrategy,
            topK: rerankTopK,
            contextWeightFactor,
          }
        );
        finalNodes = rerankResult.nodes;
        sources = this.responseGenerator.extractSources(finalNodes);
        console.log(
          `Hybrid strategy: ${contextNodes.length} context + ${newNodes.length} new = ${finalNodes.length} final nodes`
        );
        break;

      default:
        throw new Error(`Unknown decision strategy: ${decision.strategy}`);
    } // Phase 3: Generate enhanced response based on plan
    const { stream } = await this.responseGenerator.generateStreamingResponse({
      query,
      nodes: finalNodes,
      analysisResult,
    });

    console.log(`Enhanced PDF RAG completed successfully`);

    return {
      stream,
      sources,
      nodes: finalNodes,
    };
  }

  /**
   * Extract nodes from previous context with priority scoring
   */
  private extractNodesFromContext(
    previousContext: EnhancedPDFRagOptions["previousContext"] = [],
    maxNodes: number
  ): NodeWithScore[] {
    const allNodes: NodeWithScore[] = [];

    previousContext.forEach((context, index) => {
      // Apply recency boost - more recent context gets higher priority
      const recencyBoost = 1 + 0.1 * (previousContext.length - index);
      context.nodes.forEach((node) => {
        allNodes.push({
          ...node,
          score: (node.score || 0) * recencyBoost,
        });
      });
    });

    // Sort by score and take top nodes
    return allNodes
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, maxNodes);
  }

  /**
   * Perform enhanced vector search with decision-guided parameters
   */
  private async performNewSearch(
    query: string,
    topK: number,
    filters?: MetadataFilters,
    searchParameters?: DecisionAnalysis["searchParameters"]
  ): Promise<NodeWithScore[]> {
    // Adjust search parameters based on decision analysis
    const adjustedTopK = searchParameters
      ? topK * searchParameters.breadth
      : topK;

    const queryResult = await this.queryEngine.query(
      query,
      adjustedTopK,
      filters
    );

    return queryResult.nodes;
  }

  /**
   * Combine and deduplicate nodes with enhanced scoring
   */
  private combineAndDeduplicateNodes(
    contextNodes: NodeWithScore[],
    newNodes: NodeWithScore[]
  ): NodeWithScore[] {
    const seenIds = new Set<string>();
    const combinedNodes: NodeWithScore[] = [];

    // Add context nodes first with priority boost
    contextNodes.forEach((node) => {
      if (!seenIds.has(node.node.id_)) {
        seenIds.add(node.node.id_);
        combinedNodes.push({
          ...node,
          score: (node.score || 0) * 1.3, // Higher boost for context relevance
        });
      }
    });

    // Add new nodes if not duplicates
    newNodes.forEach((node) => {
      if (!seenIds.has(node.node.id_)) {
        seenIds.add(node.node.id_);
        combinedNodes.push(node);
      }
    });

    return combinedNodes;
  }

  /**
   * Context-aware reranking with enhanced scoring
   */
  private async contextAwareRerank(
    query: string,
    nodes: NodeWithScore[],
    contextNodeCount: number,
    options: {
      strategy: "semantic" | "hybrid";
      topK: number;
      contextWeightFactor: number;
    }
  ): Promise<{ nodes: NodeWithScore[] }> {
    // Apply sophisticated weighting to context nodes
    const weightedNodes = nodes.map((node, index) => {
      if (index < contextNodeCount) {
        // Context nodes get exponential boost based on position
        const positionFactor = 1 + 0.2 * (contextNodeCount - index);
        return {
          ...node,
          score:
            (node.score || 0) * options.contextWeightFactor * positionFactor,
        };
      }
      return node;
    });

    // Use existing reranker with enhanced weighted nodes
    const rerankResult = await this.reranker.rerank(query, weightedNodes, {
      strategy: options.strategy,
      topK: options.topK,
    });

    console.log(
      `Context-aware reranking: ${contextNodeCount} context nodes enhanced with ${options.contextWeightFactor}x boost`
    );

    return { nodes: rerankResult.nodes };
  }
}
