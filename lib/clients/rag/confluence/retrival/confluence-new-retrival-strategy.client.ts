import { ConfluenceNewRetrievalStrategy } from "@/lib/llm/rag/confluence/retrival/confluence-new-retrival-strategy";
import { confluenceRagRetrival } from "../confluence-rag-retrival.client";
import { confluenceReranker } from "../reranker/confluence-reranker.client";

export const confluenceNewSearchRetrival = new ConfluenceNewRetrievalStrategy(
  confluenceRagRetrival,
  confluenceReranker
);
