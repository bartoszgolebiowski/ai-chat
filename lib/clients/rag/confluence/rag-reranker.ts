import { RagReranker } from "@/lib/llm/rag/confluence/reranker";
import { reranker } from "../../reranker";

// A real Reranker instance must be provided in your DI setup.
export const ragReranker = new RagReranker(reranker);
