import { ConfluenceResponsePlanner } from "@/lib/llm/rag/confluence/response-planner";
import { llm } from "@/lib/models/llm";

export const responsePlannerConfluenceClient = new ConfluenceResponsePlanner(
  llm
);
