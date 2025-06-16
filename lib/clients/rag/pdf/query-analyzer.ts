import { PDFQueryAnalyzer } from "@/lib/llm/rag/pdf/query-analyzer";
import { decisionPDFEngine } from "./decision-engine";
import { queryAnaylzerPDFEngine } from "./query-analyzer-engine";
import { responsePlannerPDFClient } from "./response-planer";

export const queryAnalyzerPDF = new PDFQueryAnalyzer(
  responsePlannerPDFClient,
  queryAnaylzerPDFEngine,
  decisionPDFEngine
);
