import { NodeWithScore, VectorIndexRetriever } from "llamaindex";
import { HyDEQueryTransformer } from "./HyDEQueryTransformer";

interface QueryResult {
  nodes: NodeWithScore[];
  originalQuery: string;
  hypotheticalDocument: string;
  rerankingInfo?: {
    originalCount: number;
    rerankedCount: number;
    strategy: string;
  };
}

export class QueryEngine {
  constructor(
    private retriever: (topK: number) => VectorIndexRetriever,
    private hydeTransformer: HyDEQueryTransformer
  ) {}

  /**
   * Query the index using HyDE-enhanced retrieval with optional reranking
   */
  async query(query: string, topK: number): Promise<QueryResult> {
    // Transform query using HyDE
    const hydeResult = await this.hydeTransformer.transformQuery(query, {
      documentType: "confluence",
      maxTokens: 300,
      temperature: 0.7,
    });

    // Use the hypothetical document for retrieval
    let nodes = await this.retriever(topK).retrieve({
      query: hydeResult.hypotheticalDocument,
    });

    return {
      nodes,
      originalQuery: query,
      hypotheticalDocument: hydeResult.hypotheticalDocument,
    };
  }
}
