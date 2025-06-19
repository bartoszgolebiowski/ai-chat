import { ConfluenceQueryPlanner } from "@/lib/llm/rag/confluence/confluence-query-planner";
import { llm } from "@/lib/models/llm";

export const confluenceQueryPlanner =
  new ConfluenceQueryPlanner(llm);
