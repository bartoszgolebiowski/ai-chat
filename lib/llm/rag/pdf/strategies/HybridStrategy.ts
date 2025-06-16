import { Reranker } from "@/lib/llm/reranker";
import { NodeWithScore } from "llamaindex";
import { RagContextManager } from "../../rag-context-manager";
import { RagSearcher } from "../../rag-searcher";
import { EnhancedPDFRagOptions } from "../engine";
import { IPDFRagStrategy } from "./IRagStrategy";

export class PDFHybridStrategy implements IPDFRagStrategy {
  constructor(
    private contextManager: RagContextManager,
    private searcher: RagSearcher,
    private reranker: Reranker
  ) {}

  async run({
    query,
    options,
  }: {
    query: string;
    options: EnhancedPDFRagOptions;
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
    const rerankResult = await this.reranker.contextAwareRerank(
      query,
      combinedNodes,
      contextNodes.length,
      {
        strategy: options.rerankStrategy || "hybrid",
        topK: options.rerankTopK || 10,
        contextWeightFactor: options.contextWeightFactor || 1.5,
      }
    );

    return {
      nodes: rerankResult.nodes,
    };
  }
}
