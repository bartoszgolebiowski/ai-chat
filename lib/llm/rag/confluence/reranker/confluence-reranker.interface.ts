import { NodeWithScore } from "llamaindex";

export interface IConfluenceRerankerStrategy {
  rerank(
    query: string,
    nodes: NodeWithScore[], // Use NodeWithScore if available in this file
    threshold?: number
  ): Promise<NodeWithScore[]>; // Use NodeWithScore[] if available
}
