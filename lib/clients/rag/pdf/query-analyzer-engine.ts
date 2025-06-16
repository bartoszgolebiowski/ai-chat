import { QueryAnalysisEngine } from "@/lib/llm/rag/pdf/query-analysis-engine";
import { llm } from "@/lib/models/llm";

export const queryAnaylzerEngine = new QueryAnalysisEngine(llm);
