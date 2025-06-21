import { PdfCombineRetrievalStrategy } from "@/lib/llm/rag/pdf/retrival/pdf-combine-retrieval-strategy";
import { pdfQueryEngine } from "../pdf-rag-retrival";
import { pdfReranker } from "../reranker/pdf-reranker.client";

export const pdfCombinedSearchRetrival = new PdfCombineRetrievalStrategy(
  pdfQueryEngine,
  pdfReranker
);
