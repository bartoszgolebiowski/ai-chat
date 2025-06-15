import { EnhancedRAGEngine } from "@/lib/llm/rag/rag-engine";
import { reranker } from "../reranker";
import { queryAnalyzerConfluence, queryAnalyzerPDF } from "./query-analyzer";
import { confluenceQueryEngine, pdfQueryEngine } from "./query-engine";
import {
  confluenceResposneGenerator,
  pdfResposneGenerator,
} from "./response-generator";

export const ragEngineConfluenceEnhanced = new EnhancedRAGEngine(
  confluenceQueryEngine,
  reranker,
  confluenceResposneGenerator,
  queryAnalyzerConfluence
);

export const ragEnginePDFEnhanced = new EnhancedRAGEngine(
  pdfQueryEngine,
  reranker,
  pdfResposneGenerator,
  queryAnalyzerPDF
);
