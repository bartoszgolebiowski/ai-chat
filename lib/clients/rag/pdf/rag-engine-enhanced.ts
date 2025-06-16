import { EnhancedPDFRAGEngine } from "@/lib/llm/rag/pdf/engine";
import { queryAnalyzerPDF } from "./query-analyzer";
import { pdfResposneGenerator } from "./response-generator";
import { strategies } from "./strategies/rag-strategies";

export const ragEnginePDFEnhanced = new EnhancedPDFRAGEngine(
  strategies,
  pdfResposneGenerator,
  queryAnalyzerPDF
);
