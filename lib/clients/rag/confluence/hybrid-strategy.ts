import { HybridStrategy } from "@/lib/llm/rag/confluence/strategies/HybridStrategy";
import { ragContextManager } from "./rag-context-manager";
import { ragReranker } from "./rag-reranker";
import { ragSearcher } from "./rag-searcher";

// Real RagContextManager, RagSearcher, and RagReranker instances must be provided in your DI setup.
export const hybridStrategy = new HybridStrategy(
  ragContextManager,
  ragSearcher,
  ragReranker
);
