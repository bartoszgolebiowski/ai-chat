import { PdfQueryRewriter } from "@/lib/llm/rag/pdf/pdf-query-rewriter";
import { llm } from "@/lib/models/llm";

export const pdfQueryRewriter = new PdfQueryRewriter(llm);
