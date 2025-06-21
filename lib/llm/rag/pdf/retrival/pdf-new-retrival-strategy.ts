import { createFilenameFilters } from "@/lib/tree/filter-converter";
import { NodeWithScore } from "llamaindex";
import { RagRetrival } from "../../rag-retrieve";
import { PdfRagEngineParams } from "../pdf-rag-engine";
import { PdfReranker } from "../reranker/pdf-reranker";
import { IPdfRetrievalStrategy } from "./pdf-retrieval-strategy.interface";

export class PdfNewRetrievalStrategy implements IPdfRetrievalStrategy {
  constructor(
    private queryEngine: RagRetrival,
    private reranker: PdfReranker
  ) {}

  async run({
    query,
    options,
  }: {
    query: string;
    options: PdfRagEngineParams;
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
