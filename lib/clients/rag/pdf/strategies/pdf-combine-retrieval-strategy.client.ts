import { PdfCombineRetrievalStrategy } from "@/lib/llm/rag/pdf/strategies/pdf-combine-retrieval-strategy";
import { ragContextManager } from "../../../rag-context-manager";
import { pdfRagSearcher } from "../pdf-rag-retrival-facade";
import { pdfReranker } from "../pdf-reranker";

export const pdfCombinedSearchRetrival = new PdfCombineRetrievalStrategy(
  ragContextManager,
  pdfRagSearcher,
  pdfReranker
);
