import { ResponsePlanner } from "@/lib/llm/rag/pdf/response-planner";
import { llm } from "@/lib/models/llm";

export const responsePlannerClient = new ResponsePlanner(llm);
