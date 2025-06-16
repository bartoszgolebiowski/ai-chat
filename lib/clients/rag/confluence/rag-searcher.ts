import { RagSearcher } from "@/lib/llm/rag/confluence/searcher";
import { confluenceQueryEngine } from "../query-engine";

// A real RagQueryEngine instance must be provided in your DI setup.
export const ragSearcher = new RagSearcher(confluenceQueryEngine);
