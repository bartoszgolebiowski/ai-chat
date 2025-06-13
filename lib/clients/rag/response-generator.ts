import { ResponseGenerator } from "@/lib/llm/rag/rag-response-generator";
import { simpleChatEngineClient } from "../simple-chat.engine";

export const hydeResposneGenerator = new ResponseGenerator(
  simpleChatEngineClient
);
