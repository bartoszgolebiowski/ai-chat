import { NodeWithScore } from "llamaindex";
import { RagSearcher } from "../../rag-searcher";
import { EnhancedPDFRagOptions } from "../engine";
import { IPDFRagStrategy } from "./IRagStrategy";

export class PDFNewSearchStrategy implements IPDFRagStrategy {
  constructor(private searcher: RagSearcher) {}

  async run({
    query,
    options,
  }: {
    query: string;
    options: EnhancedPDFRagOptions;
  }): Promise<{ nodes: NodeWithScore[] }> {
    const searchNodes = await this.searcher.performNewSearch(
      query,
      options.retrievalTopK || 20,
      options.selectedNodes ? options.selectedNodes : []
    );

    const finalNodes = searchNodes;
    return { nodes: finalNodes };
  }
}
