import { NodeWithScore } from "llamaindex";
import { RagContextManager } from "../../context-manager";
import { EnhancedRagOptions } from "../engine";
import { RagReranker } from "../reranker";
import { RagSearcher } from "../searcher";
import { IRagStrategy } from "./IRagStrategy";

export class HybridStrategy implements IRagStrategy {
  constructor(
    private contextManager: RagContextManager,
    private searcher: RagSearcher,
    private ragReranker: RagReranker
  ) {}
  async run({
    query,
    options,
  }: {
    query: string;
    options: EnhancedRagOptions;
  }): Promise<{ nodes: NodeWithScore[] }> {
    const newNodes = await this.searcher.performNewSearch(
      query,
      options.retrievalTopK || 20,
      options.selectedNodes ? options.selectedNodes : []
    );
    const contextNodes = this.contextManager.extractNodesFromContext(
      options.previousContext,
      options.maxContextNodes || 5
    );
    const combinedNodes = this.contextManager.combineAndDeduplicateNodes(
      contextNodes,
      newNodes
    );
    const rerankResult = await this.ragReranker.contextAwareRerank(
      query,
      combinedNodes,
      contextNodes.length,
      {
        strategy: options.rerankStrategy || "hybrid",
        topK: options.rerankTopK || 10,
        contextWeightFactor: options.contextWeightFactor || 1.5,
      }
    );
    const finalNodes = rerankResult.nodes;
    return { nodes: finalNodes };
  }
}
