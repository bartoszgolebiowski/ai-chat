import { PDFResponsePlanner } from "@/lib/llm/rag/pdf/response-planner";
import { llm } from "@/lib/models/llm";

export const responsePlannerPDFClient = new PDFResponsePlanner(llm);
