import { ConfluenceRagEngine } from "@/lib/llm/rag/confluence/confluence-rag-engine";
import { confluenceQueryPlanner } from "./confluence-query-planner.client";
import { confluenceResposneGenerator } from "./confluence-response-generator";
import { confluenceRerivalStrategies } from "./retrival/confluence-retrival.client";

export const ragEngineConfluenceEnhanced = new ConfluenceRagEngine(
  confluenceRerivalStrategies,
  confluenceResposneGenerator,
  confluenceQueryPlanner
);
