import { EnhancedRAGEngine } from "@/lib/llm/rag/confluence/rag-engine";
import { EnhancedPDFRAGEngine } from "@/lib/llm/rag/pdf/rag-engine";
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

export const ragEnginePDFEnhanced = new EnhancedPDFRAGEngine(
  pdfQueryEngine,
  reranker,
  pdfResposneGenerator,
  queryAnalyzerPDF
);
