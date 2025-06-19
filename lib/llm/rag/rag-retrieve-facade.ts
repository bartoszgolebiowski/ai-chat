import { createFilenameFilters } from "@/lib/tree/filter-converter";
import { NodeWithScore } from "llamaindex";
import { RagRetrival } from "./rag-retrieve";

export class RagRetrivalFacade {
  constructor(private queryEngine: RagRetrival) {}

  async performNewSearch(
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
