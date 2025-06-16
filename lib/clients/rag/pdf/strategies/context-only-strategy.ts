import { PDFContextOnlyStrategy } from "@/lib/llm/rag/pdf/strategies/ContextOnlyStrategy";
import { ragContextManager } from "../../../rag-context-manager";

export const pdfContextOnlyStrategy = new PDFContextOnlyStrategy(ragContextManager);
