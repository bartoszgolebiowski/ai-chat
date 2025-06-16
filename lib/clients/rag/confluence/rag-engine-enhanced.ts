import { EnhancedConfluenceRAGEngine } from "@/lib/llm/rag/confluence/engine";

import { confluenceAnalyzeAndDecideResponsePlanSingleCall } from "./analyze-decide-resposne-plan-single-call";
import { confluenceResposneGenerator } from "./response-generator";
import { strategies } from "./strategies/rag-strategies";

export const ragEngineConfluenceEnhanced = new EnhancedConfluenceRAGEngine(
  strategies,
  confluenceResposneGenerator,
  confluenceAnalyzeAndDecideResponsePlanSingleCall
);
