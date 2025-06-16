import { ConfluenceResponseGenerator } from "@/lib/llm/rag/confluence/response-generator";
import { PDFResponseGenerator } from "@/lib/llm/rag/pdf/response-generator";
import { simpleChatEngineClient } from "../simple-chat.engine";

export const confluenceResposneGenerator = new ConfluenceResponseGenerator(
  simpleChatEngineClient
);

export const pdfResposneGenerator = new PDFResponseGenerator(
  simpleChatEngineClient
);
