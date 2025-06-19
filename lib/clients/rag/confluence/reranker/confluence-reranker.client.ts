import { ConfluenceReranker } from "@/lib/llm/rag/confluence/reranker/confluence-reranker";
import { conlfuenceRerankerLLM } from "./confluence-reranker-llm.client";

export const confluenceReranker = new ConfluenceReranker();

confluenceReranker.registerStrategy("llm", conlfuenceRerankerLLM);
