import { ConfluenceResponseGenerator } from "@/lib/llm/rag/confluence/response-generator";
import { simpleChatEngineClient } from "../../simple-chat.engine";

export const confluenceResposneGenerator = new ConfluenceResponseGenerator(
  simpleChatEngineClient
);
