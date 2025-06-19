import { PdfNewRetrievalStrategy } from "@/lib/llm/rag/pdf/strategies/pdf-new-retrival-strategy";
import { pdfRagSearcher } from "../pdf-rag-retrival-facade";
import { pdfReranker } from "../pdf-reranker";

export const pdfNewRetrival = new PdfNewRetrievalStrategy(
  pdfRagSearcher,
  pdfReranker
);
