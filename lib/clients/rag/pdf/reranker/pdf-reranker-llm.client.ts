import { PdfLlmRerankerStrategy } from "@/lib/llm/rag/pdf/reranker/pdf-reranker-llm.strategy";
import { llm } from "@/lib/models/llm";

export const pdfRerankerLLM = new PdfLlmRerankerStrategy(llm);
