import { RagSearcher } from "@/lib/llm/rag/rag-searcher";
import { pdfQueryEngine } from "./query-engine";

// A real RagQueryEngine instance must be provided in your DI setup.
export const ragPDFSearcher = new RagSearcher(pdfQueryEngine);
