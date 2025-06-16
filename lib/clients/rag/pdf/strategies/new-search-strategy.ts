import { PDFNewSearchStrategy } from "@/lib/llm/rag/pdf/strategies/NewSearchStrategy";
import { ragPDFSearcher } from "../rag-searcher";

export const pdfNewSearchStrategy = new PDFNewSearchStrategy(ragPDFSearcher);
