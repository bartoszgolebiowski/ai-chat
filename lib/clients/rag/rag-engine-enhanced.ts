import { EnhancedRAGEngine } from "@/lib/llm/rag/rag-engine";
import { queryAnalyzer } from "../query-analyzer";
import { reranker } from "../reranker";
import { queryEngine } from "./query-engine";
import { hydeResposneGenerator } from "./response-generator";

export const ragEngineEnhanced = new EnhancedRAGEngine(
  queryEngine,
  reranker,
  hydeResposneGenerator,
  queryAnalyzer
);
