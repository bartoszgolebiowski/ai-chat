import { createFilenameFilters } from "@/lib/tree/filter-converter";
import { EngineResponse, MetadataFilters, NodeWithScore } from "llamaindex";
import { Metadata } from "next";
import { Reranker } from "../Reranker";
import { ResponseGeneratorBase, Source } from "../ResponseGeneratorBase";
import { QueryAnalyzerConfluence } from "./query-analyzer-confluence";
import { QueryAnalyzerPDF } from "./query-analyzer-pdf";
import { RagQueryEngine } from "./rag-query-engine";

// Enhanced interfaces from the plan
interface EnhancedRagOptions {
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
  analysisResult: "context-only" | "hybrid" | "new-search";
}

export class EnhancedRAGEngine {
  constructor(
    private queryEngine: RagQueryEngine,
    private reranker: Reranker,
    private responseGenerator: ResponseGeneratorBase,
    private queryAnalyzer: QueryAnalyzerConfluence | QueryAnalyzerPDF
  ) {}

  async execute(
    query: string,
    options: EnhancedRagOptions = {}
  ): Promise<EnhancedRagResult> {
    const {
      retrievalTopK = 10,
      rerankTopK = 5,
      rerankStrategy = "hybrid",
      contextAnalysisThreshold = 0.7,
      maxContextNodes = 5,
      contextWeightFactor = 1.5,
      previousContext = [],
      selectedNodes = [],
    } = options;

    // Phase 1: Query Analysis and Decision Making (now async)
    const queryAnalysis = await this.queryAnalyzer.analyzeQuery({
      query,
      previousContext,
    });

    const decision = this.queryAnalyzer.makeDecision(
      queryAnalysis,
      contextAnalysisThreshold
    );

    console.log(`Enhanced RAG: Decision: ${decision}`);

    let finalNodes: NodeWithScore[];
    let sources: Source[];

    switch (decision) {
      case "context-only":
        finalNodes = this.extractNodesFromContext(
          previousContext,
          maxContextNodes
        );
        sources = [];
        break;

      case "new-search":
        const searchNodes = await this.performNewSearch(
          query,
          retrievalTopK,
          createFilenameFilters(selectedNodes)
        );
        const rerankResultNew = await this.reranker.rerank(query, searchNodes, {
          strategy: rerankStrategy,
          topK: rerankTopK,
        });
        finalNodes = rerankResultNew.nodes;
        sources = this.responseGenerator.extractSources(finalNodes);
        break;

      case "hybrid":
        const newNodes = await this.performNewSearch(
          query,
          retrievalTopK,
          createFilenameFilters(selectedNodes)
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
        break;

      default:
        throw new Error(`Unknown decision: ${decision}`);
    }

    // Generate streaming response with enhanced context
    const { stream } = await this.responseGenerator.generateStreamingResponse({
      query,
      nodes: finalNodes,
    });

    console.log(
      `Enhanced RAG completed: Used ${finalNodes.length} nodes via ${decision} strategy`
    );

    return {
      stream,
      sources,
      nodes: finalNodes,
      analysisResult: decision,
    };
  }
  /**
   * Extract nodes from previous context
   */
  private extractNodesFromContext(
    previousContext: EnhancedRagOptions["previousContext"] = [],
    maxNodes: number
  ): NodeWithScore[] {
    const allNodes: NodeWithScore[] = [];

    previousContext.forEach((context) => {
      allNodes.push(...context.nodes);
    });

    // Sort by score and take top nodes
    return allNodes
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, maxNodes);
  }

  /**
   * Perform new vector search
   */
  private async performNewSearch(
    query: string,
    topK: number,
    filters?: MetadataFilters
  ): Promise<NodeWithScore[]> {
    const queryResult = await this.queryEngine.query(query, topK, filters);
    return queryResult.nodes;
  }

  /**
   * Phase 3.2: Combine and deduplicate nodes
   */
  private combineAndDeduplicateNodes(
    contextNodes: NodeWithScore[],
    newNodes: NodeWithScore[]
  ): NodeWithScore[] {
    const seenIds = new Set<string>();
    const combinedNodes: NodeWithScore[] = [];

    // Add context nodes first (higher priority)
    contextNodes.forEach((node) => {
      if (!seenIds.has(node.node.id_)) {
        seenIds.add(node.node.id_);
        combinedNodes.push({
          ...node,
          score: (node.score || 0) * 1.2, // Boost context nodes
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
   * Phase 3.1: Context-aware reranking
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
    // Apply context weight factor to context nodes
    const weightedNodes = nodes.map((node, index) => {
      if (index < contextNodeCount) {
        // These are context nodes, boost their scores
        return {
          ...node,
          score: (node.score || 0) * options.contextWeightFactor,
        };
      }
      return node;
    });

    // Use existing reranker with weighted nodes
    const rerankResult = await this.reranker.rerank(query, weightedNodes, {
      strategy: options.strategy,
      topK: options.topK,
    });

    console.log(
      `Context-aware reranking: ${contextNodeCount} context nodes boosted by ${options.contextWeightFactor}x`
    );

    return { nodes: rerankResult.nodes };
  }
}
