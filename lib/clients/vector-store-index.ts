import { AzureAISearchVectorStore } from "@llamaindex/azure";
import { VectorStoreIndex } from "llamaindex";
import { vectorStoreClient } from "./vector-store";

function createVectorStoreIndexClient(
  vectorStore: AzureAISearchVectorStore<any>
) {
  return VectorStoreIndex.fromVectorStore(vectorStore);
}

export const vectorStoreIndexClient = createVectorStoreIndexClient(vectorStoreClient);
