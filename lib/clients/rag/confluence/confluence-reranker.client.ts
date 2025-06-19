import { ConfluenceReranker } from "@/lib/llm/rag/confluence/confluence-reranker";
import { llm } from "@/lib/models/llm";

export const confluenceReranker = new ConfluenceReranker(llm);
