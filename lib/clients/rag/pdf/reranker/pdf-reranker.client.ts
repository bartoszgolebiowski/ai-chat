import { PdfReranker } from "@/lib/llm/rag/pdf/reranker/pdf-reranker";
import { pdfRerankerLLM } from "./pdf-reranker-llm.client";

export const pdfReranker = new PdfReranker();

pdfReranker.registerStrategy("llm", pdfRerankerLLM);
