import { ConfluenceDecisionEngine } from "@/lib/llm/rag/confluence/decision-engine";
import { llm } from "@/lib/models/llm";

export const decisionConfluenceEngine = new ConfluenceDecisionEngine(llm);
