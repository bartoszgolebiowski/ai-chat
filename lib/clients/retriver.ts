import { VectorStoreIndex } from "llamaindex";
import { vectorStoreIndexClient } from "./vector-store-index";

function createRetriverClient(index: VectorStoreIndex) {
  return (topK: number) =>
    index.asRetriever({
      topK: { TEXT: topK, IMAGE: 0, AUDIO: 0 },
      // mode: VectorStoreQueryMode.DEFAULT,
      //@ts-ignore
      mode: "default" as const, // Use 'default' for LlamaIndex v0.8.0 and later
    });
}

export const retrieverClient = createRetriverClient(
  await vectorStoreIndexClient
);
