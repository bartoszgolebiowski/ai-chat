import { ConfluenceQueryAnalysisEngine } from "@/lib/llm/rag/confluence/query-analysis-engine";
import { llm } from "@/lib/models/llm";

export const queryAnaylzerPDFEngine = new ConfluenceQueryAnalysisEngine(llm);
