import { QueryAnalyzerPDF } from "@/lib/llm/rag/pdf/query-analyzer";
import { QueryAnalyzerConfluence } from "../../llm/rag/confluence/query-analyzer";
import { llm } from "../../models/llm";
import { decisionEngine } from "./pdf/decision-engine";
import { queryAnaylzerEngine } from "./pdf/query-analyzer-engine";
import { responsePlannerClient } from "./pdf/response-planer";

export const queryAnalyzerConfluence = new QueryAnalyzerConfluence(llm);
export const queryAnalyzerPDF = new QueryAnalyzerPDF(
  responsePlannerClient,
  queryAnaylzerEngine,
  decisionEngine
);
