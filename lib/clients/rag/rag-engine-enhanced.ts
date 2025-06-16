import { EnhancedRAGEngine } from "@/lib/llm/rag/confluence/engine";
import { EnhancedPDFRAGEngine } from "@/lib/llm/rag/pdf/engine";
import { reranker } from "../reranker";
import { strategies } from "./confluence/rag-strategies";
import { queryAnalyzerConfluence, queryAnalyzerPDF } from "./query-analyzer";
import { pdfQueryEngine } from "./query-engine";
import {
  confluenceResposneGenerator,
  pdfResposneGenerator,
} from "./response-generator";

export const ragEngineConfluenceEnhanced = new EnhancedRAGEngine(
  strategies,
  confluenceResposneGenerator,
  queryAnalyzerConfluence
);

export const ragEnginePDFEnhanced = new EnhancedPDFRAGEngine(
  pdfQueryEngine,
  reranker,
  pdfResposneGenerator,
  queryAnalyzerPDF
);
