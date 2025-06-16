import { RagSearcher } from "@/lib/llm/rag/rag-searcher";
import { confluenceQueryEngine } from "./query-engine";

// A real RagQueryEngine instance must be provided in your DI setup.
export const confluenceSearcher = new RagSearcher(confluenceQueryEngine);
