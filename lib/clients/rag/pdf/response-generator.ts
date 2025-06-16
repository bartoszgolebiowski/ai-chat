import { PDFResponseGenerator } from "@/lib/llm/rag/pdf/response-generator";
import { simpleChatEngineClient } from "../../simple-chat.engine";

export const pdfResposneGenerator = new PDFResponseGenerator(
  simpleChatEngineClient
);
