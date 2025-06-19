import { PdfQueryPlanner } from "@/lib/llm/rag/pdf/pdf-query-planner";
import { llm } from "@/lib/models/llm";

export const pdfQueryPlanner = new PdfQueryPlanner(llm);
