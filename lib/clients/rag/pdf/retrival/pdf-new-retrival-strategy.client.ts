import { PdfNewRetrievalStrategy } from "@/lib/llm/rag/pdf/retrival/pdf-new-retrival-strategy";
import { pdfRagSearcher } from "../pdf-rag-retrival-facade";
import { pdfReranker } from "../reranker/pdf-reranker.client";

export const pdfNewRetrival = new PdfNewRetrievalStrategy(
  pdfRagSearcher,
  pdfReranker
);
