import { HyDEResponseGenerator } from "@/lib/llm/hyde/hyde-response-generator";
import { simpleChatEngineClient } from "../simple-chat.engine";

export const hydeResposneGenerator = new HyDEResponseGenerator(
  simpleChatEngineClient
);
