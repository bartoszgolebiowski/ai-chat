import { PDFDecisionEngine } from "@/lib/llm/rag/pdf/decision-engine";
import { llm } from "@/lib/models/llm";

export const decisionPDFEngine = new PDFDecisionEngine(llm);
