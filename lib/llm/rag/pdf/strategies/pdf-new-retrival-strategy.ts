import { NodeWithScore } from "llamaindex";
import { RagRetrivalFacade } from "../../rag-retrieve-facade";
import { PdfRagEngineParams } from "../pdf-rag-engine";
import { PdfReranker } from "../pdf-reranker";
import { IPdfRetrievalStrategy } from "./pdf-retrieval-strategy.interface";

export class PdfNewRetrievalStrategy implements IPdfRetrievalStrategy {
  constructor(
    private searcher: RagRetrivalFacade,
    private reranker: PdfReranker
  ) {}

  async run({
    query,
    options,
  }: {
    query: string;
    options: PdfRagEngineParams;
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
