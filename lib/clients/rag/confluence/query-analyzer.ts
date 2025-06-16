import { QueryAnalyzerConfluence } from "@/lib/llm/rag/confluence/query-analyzer";
import { llm } from "@/lib/models/llm";

export const queryAnalyzerConfluence = new QueryAnalyzerConfluence(llm);
