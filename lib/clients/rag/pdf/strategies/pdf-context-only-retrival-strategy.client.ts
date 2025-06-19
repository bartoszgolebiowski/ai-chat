import { PdfContextOnlyRetrievalStrategy } from "@/lib/llm/rag/pdf/strategies/pdf-context-only-retrival-strategy";
import { ragContextManager } from "../../../rag-context-manager";

export const pdfContextOnlyRetrieval = new PdfContextOnlyRetrievalStrategy(
  ragContextManager
);
