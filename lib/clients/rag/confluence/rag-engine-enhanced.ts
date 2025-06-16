import { EnhancedConfluenceRAGEngine } from "@/lib/llm/rag/confluence/engine";

import { queryAnalyzerConfluence } from "./query-analyzer";
import { confluenceResposneGenerator } from "./response-generator";
import { strategies } from "./strategies/rag-strategies";

export const ragEngineConfluenceEnhanced = new EnhancedConfluenceRAGEngine(
  strategies,
  confluenceResposneGenerator,
  queryAnalyzerConfluence
);
