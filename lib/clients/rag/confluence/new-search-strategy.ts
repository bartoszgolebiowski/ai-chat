import { NewSearchStrategy } from "@/lib/llm/rag/confluence/strategies/NewSearchStrategy";
import { ragReranker } from "./rag-reranker";
import { ragSearcher } from "./rag-searcher";

// Real RagSearcher and RagReranker instances must be provided in your DI setup.
export const newSearchStrategy = new NewSearchStrategy(
  ragSearcher,
  ragReranker
);
