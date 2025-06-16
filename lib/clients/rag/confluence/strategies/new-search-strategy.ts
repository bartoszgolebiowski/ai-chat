import { NewSearchStrategy } from "@/lib/llm/rag/confluence/strategies/NewSearchStrategy";
import { confluenceSearcher } from "../rag-searcher";

export const confluenceNewSearchStrategy = new NewSearchStrategy(
  confluenceSearcher
);
