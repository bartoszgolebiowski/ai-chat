import { VectorStoreIndex } from "llamaindex";
import { vectorStoreIndexClient } from "./vector-store-index";

function createChatEngineClient(index: VectorStoreIndex) {
  return index.asChatEngine({});
}

export const contextChatEngineClient = createChatEngineClient(
  await vectorStoreIndexClient
);
