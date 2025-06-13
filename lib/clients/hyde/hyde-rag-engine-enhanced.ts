import { EnhancedHyDERAGEngine } from "@/lib/llm/hyde/enhanced-hyde-rag-engine";
import { queryAnalyzer } from "../query-analyzer";
import { reranker } from "../reranker";
import { hyDEQueryEngine } from "./hyde-query-engine";
import { hydeResposneGenerator } from "./hyde-response-generator";

export const hydeRagEngineEnhanced = new EnhancedHyDERAGEngine(
  hyDEQueryEngine,
  reranker,
  hydeResposneGenerator,
  queryAnalyzer
);
