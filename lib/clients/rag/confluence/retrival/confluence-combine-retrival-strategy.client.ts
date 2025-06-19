import { ConfluenceCombineRetrievalStrategy } from "@/lib/llm/rag/confluence/retrival/confluence-combine-retrieval-strategy";
// No need to import ragContextManager
import { confluenceRagRetrivalFacade } from "../confluence-rag-retrival-facade.client";
import { confluenceReranker } from "../reranker/confluence-reranker.client";

export const confluenceCombineRetrival = new ConfluenceCombineRetrievalStrategy(
  confluenceRagRetrivalFacade,
  confluenceReranker
);
