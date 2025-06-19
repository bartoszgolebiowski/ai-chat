import { NodeWithScore } from "llamaindex";
import { RagContextManager } from "../../rag-context-manager";
import { RagRetrivalFacade } from "../../rag-retrieve-facade";
import { ConfluenceRagEngineParams } from "../confluence-rag-engine";
import { ConfluenceReranker } from "../confluence-reranker";
import { IConfluenceRetrievalStrategy } from "./confluence-retrieval-strategy.interface";

export class ConfluenceCombineRetrievalStrategy
  implements IConfluenceRetrievalStrategy
{
  constructor(
    private contextManager: RagContextManager,
    private searcher: RagRetrivalFacade,
    private reranker: ConfluenceReranker
  ) {}
  async run({
    query,
    options,
  }: {
    query: string;
    options: ConfluenceRagEngineParams;
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
    const rerankResult = await this.reranker.rerank(query, combinedNodes, {
      strategy: "llm",
      threshold: options.rerankThreshold || 0.5,
    });
    const finalNodes = rerankResult.nodes;
    return { nodes: finalNodes };
  }
}
