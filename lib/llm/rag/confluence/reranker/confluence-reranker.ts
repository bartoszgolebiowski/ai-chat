import { NodeWithScore } from "llamaindex";
import { IConfluenceRerankerStrategy } from "./confluence-reranker.interface";

interface RerankingOptions {
  strategy?: string;
  threshold?: number;
}

interface RerankingResult {
  nodes: NodeWithScore[];
  originalCount: number;
  rerankedCount: number;
}

export class ConfluenceReranker {
  private strategies: Record<string, IConfluenceRerankerStrategy> = {};

  constructor() {}

  /**
   * Register a new reranking strategy
   */
  registerStrategy(name: string, strategy: IConfluenceRerankerStrategy) {
    this.strategies[name] = strategy;
  }

  /**
   * Rerank nodes based on the selected strategy
   */
  async rerank(
    query: string,
    nodes: NodeWithScore[],
    options: RerankingOptions = {}
  ): Promise<RerankingResult> {
    const { strategy = "llm", threshold = 0.5 } = options;
    const reranker = this.strategies[strategy];
    if (!reranker) {
      throw new Error(`Reranking strategy '${strategy}' not found.`);
    }
    console.log(`Reranking ${nodes.length} nodes using ${strategy} strategy`);
    const rerankedNodes = await reranker.rerank(query, nodes, threshold);
    return {
      nodes: rerankedNodes,
      originalCount: nodes.length,
      rerankedCount: rerankedNodes.length,
    };
  }
}
