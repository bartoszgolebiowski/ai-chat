import { ConfluenceReranker } from "@/lib/llm/rag/confluence/reranker/confluence-reranker";
import { llm } from "@/lib/models/llm";

export const confluenceReranker = new ConfluenceReranker(llm);
