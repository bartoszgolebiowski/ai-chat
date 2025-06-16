import { ConfluenceResponseGenerator } from "@/lib/llm/rag/confluence/rag-response-generator";
import { PDFResponseGenerator } from "@/lib/llm/rag/pdf/rag-response-generator";
import { simpleChatEngineClient } from "../simple-chat.engine";

export const confluenceResposneGenerator = new ConfluenceResponseGenerator(
  simpleChatEngineClient
);

export const pdfResposneGenerator = new PDFResponseGenerator(
  simpleChatEngineClient
);
