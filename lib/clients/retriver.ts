import { MetadataFilters, VectorStoreIndex } from "llamaindex";
import {
  vectorStoreIndexConfluenceClient,
  vectorStoreIndexPDFClient,
} from "./vector-store-index";

function createRetriverClient(index: VectorStoreIndex) {
  return (topK: number, filters?: MetadataFilters) =>
    index.asRetriever({
      filters,
      topK: { TEXT: topK, IMAGE: 0, AUDIO: 0 },
      //@ts-ignore
      mode: "HYBRID" as const, // Use 'default' for LlamaIndex v0.8.0 and later
    });
}

export const retrieverConfluenceClient = createRetriverClient(
  await vectorStoreIndexConfluenceClient
);

export const retrieverPDFClient = createRetriverClient(
  await vectorStoreIndexPDFClient
);
