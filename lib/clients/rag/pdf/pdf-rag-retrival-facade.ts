import { RagRetrivalFacade } from "@/lib/llm/rag/rag-retrieve-facade";
import { pdfQueryEngine } from "./pdf-rag-retrival";

// A real RagQueryEngine instance must be provided in your DI setup.
export const pdfRagSearcher = new RagRetrivalFacade(pdfQueryEngine);
