import { PdfCombineRetrievalStrategy } from "@/lib/llm/rag/pdf/retrival/pdf-combine-retrieval-strategy";
import { pdfRagSearcher } from "../pdf-rag-retrival-facade";
import { pdfReranker } from "../reranker/pdf-reranker.client";

export const pdfCombinedSearchRetrival = new PdfCombineRetrievalStrategy(
  pdfRagSearcher,
  pdfReranker
);
