import { RagRetrival } from "@/lib/llm/rag/rag-retrieve";
import { retrieverPDFClient } from "../../vector-index-retriver.client";

export const pdfQueryEngine = new RagRetrival(retrieverPDFClient);
