import { ConfluenceNewRetrievalStrategy } from "@/lib/llm/rag/confluence/strategies/confluence-new-retrival-strategy";
import { confluenceRagRetrivalFacade } from "../confluence-rag-retrival-facade.client";
import { confluenceReranker } from "../confluence-reranker.client";

export const confluenceNewSearchRetrival = new ConfluenceNewRetrievalStrategy(
  confluenceRagRetrivalFacade,
  confluenceReranker
);
