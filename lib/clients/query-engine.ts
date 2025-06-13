import { VectorStoreIndex } from "llamaindex";
import { vectorStoreIndexClient } from "./vector-store-index";

function createQueryEngineClient(index: VectorStoreIndex) {
  return index.asQueryEngine();
}

export const queryEngineClient = createQueryEngineClient(
  await vectorStoreIndexClient
);
