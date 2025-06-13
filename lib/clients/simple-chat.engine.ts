import { AzureOpenAI } from "@llamaindex/azure";
import { SimpleChatEngine } from "llamaindex";
import { azureAiClient } from "../models/llm";

function createSimpleChatNgineClient(llm: AzureOpenAI) {
  return new SimpleChatEngine({
    llm: llm,
  });
}

export const simpleChatEngineClient =
  createSimpleChatNgineClient(azureAiClient);
