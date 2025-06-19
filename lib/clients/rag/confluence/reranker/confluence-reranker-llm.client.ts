
import { ConfluenceLlmRerankerStrategy } from "@/lib/llm/rag/confluence/reranker/confluence-reranker-llm.strategy";
import { llm } from "@/lib/models/llm";

export const conlfuenceRerankerLLM = new ConfluenceLlmRerankerStrategy(llm);
