import { ConfluenceCombineRetrievalStrategy } from "@/lib/llm/rag/confluence/strategies/confluence-combine-retrieval-strategy";
import { ragContextManager } from "../../../rag-context-manager";
import { confluenceRagRetrivalFacade } from "../confluence-rag-retrival-facade.client";
import { confluenceReranker } from "../confluence-reranker.client";

export const confluenceCombineRetrival = new ConfluenceCombineRetrievalStrategy(
  ragContextManager,
  confluenceRagRetrivalFacade,
  confluenceReranker
);
