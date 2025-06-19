import { ConfluenceResponseGenerator } from "@/lib/llm/rag/confluence/confluence-response-generator";
import { simpleChatEngineClient } from "../../simple-chat-engine.client";

export const confluenceResposneGenerator = new ConfluenceResponseGenerator(
  simpleChatEngineClient
);
