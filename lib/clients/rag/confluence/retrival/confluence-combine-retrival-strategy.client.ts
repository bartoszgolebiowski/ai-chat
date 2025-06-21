import { ConfluenceCombineRetrievalStrategy } from "@/lib/llm/rag/confluence/retrival/confluence-combine-retrieval-strategy";
import { confluenceRagRetrival } from "../confluence-rag-retrival.client";
import { confluenceReranker } from "../reranker/confluence-reranker.client";

export const confluenceCombineRetrival = new ConfluenceCombineRetrievalStrategy(
  confluenceRagRetrival,
  confluenceReranker
);
