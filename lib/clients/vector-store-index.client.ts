import { AzureAISearchVectorStore } from "@llamaindex/azure";
import { VectorStoreIndex } from "llamaindex";
import {
  vectorStoreConfluenceClient,
  vectorStorePDFClient,
} from "./search-vector-store.client";

function createVectorStoreIndexClient(
  vectorStore: AzureAISearchVectorStore<any>
) {
  return VectorStoreIndex.fromVectorStore(vectorStore);
}

export const vectorStoreIndexConfluenceClient = createVectorStoreIndexClient(
  vectorStoreConfluenceClient
);

export const vectorStoreIndexPDFClient = createVectorStoreIndexClient(
  vectorStorePDFClient
);
