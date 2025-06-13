import { QueryAnalyzer } from "../llm/rag/query-analyzer";
import { llm } from "../models/llm";

export const queryAnalyzer = new QueryAnalyzer(llm);
