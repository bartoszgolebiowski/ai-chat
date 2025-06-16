import { NodeWithScore } from "llamaindex";
import { EnhancedRagOptions } from "../engine";
import { RagReranker } from "../reranker";
import { RagSearcher } from "../searcher";
import { IRagStrategy } from "./IRagStrategy";

export class NewSearchStrategy implements IRagStrategy {
  constructor(
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
    const searchNodes = await this.searcher.performNewSearch(
      query,
      options.retrievalTopK || 20,
      options.selectedNodes ? options.selectedNodes : []
    );
    const rerankResultNew = await this.ragReranker.rerank(query, searchNodes, {
      strategy: options.rerankStrategy || "hybrid",
      topK: options.rerankTopK || 10,
    });
    const finalNodes = rerankResultNew.nodes;
    return { nodes: finalNodes };
  }
}
