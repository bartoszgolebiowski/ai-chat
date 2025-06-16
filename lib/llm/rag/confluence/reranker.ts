import { NodeWithScore } from "llamaindex";
import { Reranker } from "../../Reranker";

export class RagReranker {
  constructor(private reranker: Reranker) {}

  async rerank(
    query: string,
    nodes: NodeWithScore[],
    options: {
      strategy?: "semantic" | "hybrid";
      topK?: number;
      semanticWeight?: number;
    } = {}
  ): Promise<{ nodes: NodeWithScore[] }> {
    const rerankResult = await this.reranker.rerank(query, nodes, options);
    return { nodes: rerankResult.nodes };
  }

  async contextAwareRerank(
    query: string,
    nodes: NodeWithScore[],
    contextNodeCount: number,
    options: {
      strategy: "semantic" | "hybrid";
      topK: number;
      contextWeightFactor: number;
    }
  ): Promise<{ nodes: NodeWithScore[] }> {
    const weightedNodes = nodes.map((node, index) => {
      if (index < contextNodeCount) {
        return {
          ...node,
          score: (node.score || 0) * options.contextWeightFactor,
        };
      }
      return node;
    });
    const rerankResult = await this.reranker.rerank(query, weightedNodes, {
      strategy: options.strategy,
      topK: options.topK,
    });
    return { nodes: rerankResult.nodes };
  }
}
