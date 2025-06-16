import { DecisionEngine } from "@/lib/llm/rag/pdf/decision-engine";
import { llm } from "@/lib/models/llm";

export const decisionEngine = new DecisionEngine(llm);
