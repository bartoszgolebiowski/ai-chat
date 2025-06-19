import { PdfRagEngine } from "@/lib/llm/rag/pdf/pdf-rag-engine";
import { pdfQueryPlanner } from "./pdf-query-planner";
import { pdfQueryRewriter } from "./pdf-query-rewriter";
import { pdfResposneGenerator } from "./pdf-response-generator";
import { pdfStrategies } from "./strategies/pdf-retrieval-strategy.client";

export const pdfDocumentRagEngine = new PdfRagEngine(
  pdfStrategies,
  pdfResposneGenerator,
  pdfQueryPlanner,
  pdfQueryRewriter
);
