import { RagQueryEngine } from "../../llm/rag/rag-query-engine";
import { retrieverConfluenceClient, retrieverPDFClient } from "../retriver";

export const confluenceQueryEngine = new RagQueryEngine(
  retrieverConfluenceClient
);
export const pdfQueryEngine = new RagQueryEngine(retrieverPDFClient);
