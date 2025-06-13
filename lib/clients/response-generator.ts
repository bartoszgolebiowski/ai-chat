import { ResponseGenerator } from "../llm/ResponseGenerator";
import { simpleChatEngineClient } from "./simple-chat.engine";

export const responseGenerator = new ResponseGenerator(simpleChatEngineClient);
