import { ConfluenceRagEngine } from "@/lib/llm/rag/confluence/confluence-rag-engine";
import { confluenceQueryPlanner } from "./confluence-query-planner.client";
import { confluenceResposneGenerator } from "./confluence-response-generator";
import { strategies } from "./strategies/confluence-rag-strategies.client";

export const ragEngineConfluenceEnhanced = new ConfluenceRagEngine(
  strategies,
  confluenceResposneGenerator,
  confluenceQueryPlanner
);
