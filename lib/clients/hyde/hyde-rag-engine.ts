import { HyDERAGEngine } from "@/lib/llm/hyde/hyde-rag-engine";
import { reranker } from "../reranker";
import { hyDEQueryEngine } from "./hyde-query-engine";
import { hydeResposneGenerator } from "./hyde-response-generator";

export const hydeRagEngine = new HyDERAGEngine(
  hyDEQueryEngine,
  reranker,
  hydeResposneGenerator
);
