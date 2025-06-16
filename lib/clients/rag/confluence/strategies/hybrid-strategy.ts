import { HybridStrategy } from "@/lib/llm/rag/confluence/strategies/HybridStrategy";
import { ragContextManager } from "../../../rag-context-manager";
import { ragReranker } from "../../../rag-reranker";
import { confluenceSearcher } from "../rag-searcher";

export const confluenceHybridStrategy = new HybridStrategy(
  ragContextManager,
  confluenceSearcher,
  ragReranker
);
