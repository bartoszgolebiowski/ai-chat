import { PdfResponseGenerator } from "@/lib/llm/rag/pdf/pdf-response-generator";
import { simpleChatEngineClient } from "../../simple-chat-engine.client";

export const pdfResposneGenerator = new PdfResponseGenerator(
  simpleChatEngineClient
);
