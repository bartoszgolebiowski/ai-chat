import { createFilenameFilters } from "@/lib/tree/filter-converter";
import { NodeWithScore } from "llamaindex";
import { RagRetrival } from "../../rag-retrieve";
import { ConfluenceRagEngineParams } from "../confluence-rag-engine";
import { ConfluenceReranker } from "../reranker/confluence-reranker";
import { IConfluenceRetrievalStrategy } from "./confluence-retrieval-strategy.interface";

export class ConfluenceNewRetrievalStrategy
  implements IConfluenceRetrievalStrategy
{
  constructor(
    private queryEngine: RagRetrival,
    private reranker: ConfluenceReranker
  ) {}

  async run({
    query,
    options,
  }: {
    query: string;
    options: ConfluenceRagEngineParams;
  }): Promise<{ nodes: NodeWithScore[] }> {
    const searchNodes = await this.performNewSearch(
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
  
  private async performNewSearch(
    query: string,
    topK: number,
    filenames: string[] = []
  ): Promise<NodeWithScore[]> {
    const queryResult = await this.queryEngine.retrieve(
      query,
      topK,
      createFilenameFilters(filenames)
    );
    return queryResult.nodes;
  }
}
