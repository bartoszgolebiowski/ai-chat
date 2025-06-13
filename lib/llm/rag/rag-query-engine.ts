import { NodeWithScore, VectorIndexRetriever } from "llamaindex";

interface QueryResult {
  nodes: NodeWithScore[];
  originalQuery: string;
}

export class RagQueryEngine {
  constructor(private retriever: (topK: number) => VectorIndexRetriever) {}

  /**
   * Query the index using enhanced retrieval with optional reranking
   */
  async query(query: string, topK: number): Promise<QueryResult> {
    // Use the hypothetical document for retrieval
    let nodes = await this.retriever(topK).retrieve({
      query: query,
    });

    return {
      nodes,
      originalQuery: query,
    };
  }
}
