import { NodeWithScore } from "llamaindex";
import { RagRetrivalFacade } from "../../rag-retrieve-facade";
import { ConfluenceRagEngineParams } from "../confluence-rag-engine";
import { ConfluenceReranker } from "../confluence-reranker";
import { IConfluenceRetrievalStrategy } from "./confluence-retrieval-strategy.interface";

export class ConfluenceNewRetrievalStrategy
  implements IConfluenceRetrievalStrategy
{
  constructor(
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
    const searchNodes = await this.searcher.performNewSearch(
      query,
      options.retrievalTopK || 20,
      options.selectedNodes ? options.selectedNodes : []
    );
    const rerankResult = await this.reranker.rerank(query, searchNodes, {
      strategy: "llm",
      threshold: options.rerankThreshold || 0.5,
    });
    const finalNodes = rerankResult.nodes;
    return { nodes: finalNodes };
  }
}
