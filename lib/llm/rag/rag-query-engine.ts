import {
  MetadataFilters,
  NodeWithScore,
  VectorIndexRetriever,
} from "llamaindex";

interface QueryResult {
  nodes: NodeWithScore[];
  originalQuery: string;
}

export class RagQueryEngine {
  constructor(
    private retriever: (
      topK: number,
      filters?: MetadataFilters
    ) => VectorIndexRetriever
  ) {}

  /**
   * Query the index using enhanced retrieval with optional reranking
   */
  async query(
    query: string,
    topK: number,
    filters?: MetadataFilters
  ): Promise<QueryResult> {
    // Use the hypothetical document for retrieval
    try {
      let nodes = await this.retriever(topK, filters).retrieve({
        query: query,
      });
      return {
        nodes,
        originalQuery: query,
      };
    } catch (error) {
      console.error("Error during retrieval:", error);
      throw new Error("Failed to retrieve nodes from the index.");
    }
  }
}
