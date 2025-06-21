import { PdfNewRetrievalStrategy } from "@/lib/llm/rag/pdf/retrival/pdf-new-retrival-strategy";
import { pdfQueryEngine } from "../pdf-rag-retrival";
import { pdfReranker } from "../reranker/pdf-reranker.client";

export const pdfNewRetrival = new PdfNewRetrievalStrategy(
  pdfQueryEngine,
  pdfReranker
);
