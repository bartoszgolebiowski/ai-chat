import { PDFQueryAnalysisEngine } from "@/lib/llm/rag/pdf/query-analysis-engine";
import { llm } from "@/lib/models/llm";

export const queryAnaylzerPDFEngine = new PDFQueryAnalysisEngine(llm);
