import { PDFHybridStrategy } from "@/lib/llm/rag/pdf/strategies/HybridStrategy";
import { ragContextManager } from "../../../rag-context-manager";
import { ragReranker } from "../../../rag-reranker";
import { ragPDFSearcher } from "../rag-searcher";

export const pdfHybridStrategy = new PDFHybridStrategy(
  ragContextManager,
  ragPDFSearcher,
  ragReranker
);
