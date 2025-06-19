import { RagRetrivalFacade } from "@/lib/llm/rag/rag-retrieve-facade";
import { confluenceRagRetrival } from "./confluence-rag-retrival.client";

// A real RagQueryEngine instance must be provided in your DI setup.
export const confluenceRagRetrivalFacade = new RagRetrivalFacade(
  confluenceRagRetrival
);
