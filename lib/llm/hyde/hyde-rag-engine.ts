import { EngineResponse, NodeWithScore } from "llamaindex";
import { Metadata } from "next";
import { Reranker } from "../Reranker";
import { ResponseGeneratorBase, Source } from "../ResponseGeneratorBase";
import { HyDEQueryEngine } from "./hyde-query-engine";

interface HyDERagOptions {
  retrievalTopK?: number;
  rerankTopK?: number;
  rerankStrategy?: "semantic" | "hybrid";
  previousContext?: {
    query: string;
    response: string;
    nodes: NodeWithScore<Metadata>[];
  }[];
}

interface HyDERagResult {
  stream: AsyncIterable<EngineResponse>;
  sources: Source[];
  nodes: NodeWithScore[];
}

export class HyDERAGEngine {
  constructor(
    private hydeQueryEngine: HyDEQueryEngine,
    private reranker: Reranker,
    private responseGenerator: ResponseGeneratorBase
  ) {}

  /**
   * Execute complete HyDE-enhanced RAG pipeline
   */
  async execute(
    query: string,
    options: HyDERagOptions = {}
  ): Promise<HyDERagResult> {
    const {
      retrievalTopK = 10,
      rerankTopK = 5,
      rerankStrategy = "hybrid",
      previousContext = [],
    } = options;

    // Step 1: Use enhanced query engine with HyDE
    const queryResult = await this.hydeQueryEngine.query(query, retrievalTopK);

    // Step 2: Apply reranking to improve relevance
    const rerankResult = await this.reranker.rerank(query, queryResult.nodes, {
      strategy: rerankStrategy,
      topK: rerankTopK,
    });

    console.log(
      `HyDE RAG: Reranked ${rerankResult.originalCount} nodes to ${rerankResult.rerankedCount} using ${rerankResult.strategy} strategy`
    );

    // Step 3: Generate streaming response
    const { stream, sources } =
      await this.responseGenerator.generateStreamingResponse({
        query,
        nodes: rerankResult.nodes,
      });

    console.log(
      `HyDE RAG completed: ${rerankResult.originalCount} → ${rerankResult.rerankedCount} nodes using ${rerankResult.strategy} strategy`
    );

    return {
      stream,
      sources,
      nodes: rerankResult.nodes,
    };
  }
}
