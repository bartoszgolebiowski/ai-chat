import { LLM } from "@/lib/models/llm";
import { NodeWithScore } from "llamaindex";
import { ConfluenceLlmReranker } from "./confluence-reranker-llm";

interface RerankingOptions {
  strategy?: "llm";
  threshold?: number;
}

interface RerankingResult {
  nodes: NodeWithScore[];
  originalCount: number;
  rerankedCount: number;
}

export class ConfluenceReranker {
  constructor(private llm: LLM) {}

  /**
   * Rerank nodes based on the selected strategy
   */
  async rerank(
    query: string,
    nodes: NodeWithScore[],
    options: RerankingOptions = {}
  ): Promise<RerankingResult> {
    const { strategy, threshold = 0.5 } = options;

    console.log(`Reranking ${nodes.length} nodes using ${strategy} strategy`);

    const llmReranker = new ConfluenceLlmReranker(this.llm);
    const rerankedNodes = await llmReranker.rerank(query, nodes, threshold);

    return {
      nodes: rerankedNodes,
      originalCount: nodes.length,
      rerankedCount: rerankedNodes.length,
    };
  }
}
