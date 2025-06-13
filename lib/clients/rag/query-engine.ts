import { RagQueryEngine } from "../../llm/rag/rag-query-engine";
import { retrieverClient } from "../retriver";

export const queryEngine = new RagQueryEngine(retrieverClient);
