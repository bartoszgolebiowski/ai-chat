import { RagQueryEngine } from "@/lib/llm/rag/rag-query-engine";
import { retrieverPDFClient } from "../../retriver";

export const pdfQueryEngine = new RagQueryEngine(retrieverPDFClient);
