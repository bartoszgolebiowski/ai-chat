import { createFilenameFilters } from "@/lib/tree/filter-converter";
import { NodeWithScore } from "llamaindex";
import { RagQueryEngine } from "./rag-query-engine";

export class RagSearcher {
  constructor(private queryEngine: RagQueryEngine) {}

  async performNewSearch(
    query: string,
    topK: number,
    filenames: string[] = []
  ): Promise<NodeWithScore[]> {
    const queryResult = await this.queryEngine.query(
      query,
      topK,
      createFilenameFilters(filenames)
    );
    return queryResult.nodes;
  }
}
