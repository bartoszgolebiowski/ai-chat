import { ConfluenceContextOnlyRetrievalStrategy } from "@/lib/llm/rag/confluence/strategies/confluence-context-only-retrival-strategy";
import { ragContextManager } from "../../../rag-context-manager";

export const confluenceContextOnlyRetrival =
  new ConfluenceContextOnlyRetrievalStrategy(ragContextManager);
