import { QueryAnalyzerPDF } from "@/lib/llm/rag/query-analyzer-pdf";
import { QueryAnalyzerConfluence } from "../../llm/rag/query-analyzer-confluence";
import { llm } from "../../models/llm";

export const queryAnalyzerConfluence = new QueryAnalyzerConfluence(llm);
export const queryAnalyzerPDF = new QueryAnalyzerPDF(llm);
