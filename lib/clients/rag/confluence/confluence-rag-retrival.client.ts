import { RagRetrival } from "../../../llm/rag/rag-retrieve";
import { retrieverConfluenceClient } from "../../vector-index-retriver.client";

export const confluenceRagRetrival = new RagRetrival(retrieverConfluenceClient);
