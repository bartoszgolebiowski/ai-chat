import { ContextOnlyStrategy } from "@/lib/llm/rag/confluence/strategies/ContextOnlyStrategy";
import { ragContextManager } from "../../../rag-context-manager";

export const confluenceContextOnlyStrategy = new ContextOnlyStrategy(
  ragContextManager
);
