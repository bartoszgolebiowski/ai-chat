import { PdfReranker } from "@/lib/llm/rag/pdf/pdf-reranker";
import { llm } from "@/lib/models/llm";

export const pdfReranker = new PdfReranker(llm);
