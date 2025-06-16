import { RagQueryEngine } from "../../../llm/rag/rag-query-engine";
import { retrieverConfluenceClient } from "../../retriver";

export const confluenceQueryEngine = new RagQueryEngine(
  retrieverConfluenceClient
);
