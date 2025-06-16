import { Reranker } from "@/lib/llm/reranker";
import { embeddingModel } from "@/lib/models/embedded";

// A real Reranker instance must be provided in your DI setup.
export const ragReranker = new Reranker(embeddingModel);
