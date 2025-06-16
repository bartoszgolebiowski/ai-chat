import { ConfluenceOrchestratorSingleCall } from "@/lib/llm/rag/confluence/confluence-orchestrator-single-call";
import { llm } from "@/lib/models/llm";

export const confluenceAnalyzeAndDecideResponsePlanSingleCall =
  new ConfluenceOrchestratorSingleCall(llm);
