import {
  KnownAnalyzerNames,
  KnownVectorSearchAlgorithmKind,
  SearchClient,
} from "@azure/search-documents";
import {
  AzureAISearchVectorStore,
  FilterableMetadataFieldKeysType,
  IndexManagement,
  MetadataIndexFieldType,
} from "@llamaindex/azure";
import { Settings } from "llamaindex";
import { azureEmbeddingClient } from "../models/embedded";
import { azureAiClient } from "../models/llm";
import { searchClient } from "./search";

const filterableMetadataFieldKeys = {
  filename: "filename",
  tags: ["tags", MetadataIndexFieldType.COLLECTION],
} as unknown as FilterableMetadataFieldKeysType;

function createVectorStoreClient(searchClient: SearchClient<any>) {
  Settings.embedModel = azureEmbeddingClient;
  Settings.llm = azureAiClient;

  const vectorStore = new AzureAISearchVectorStore({
    filterableMetadataFieldKeys,
    endpoint: searchClient.endpoint,
    indexManagement: IndexManagement.CREATE_IF_NOT_EXISTS,
    idFieldKey: "id",
    chunkFieldKey: "chunk",
    embeddingFieldKey: "embedding",
    embeddingDimensionality: 1536,
    metadataStringFieldKey: "metadata",
    docIdFieldKey: "doc_id",
    languageAnalyzer: KnownAnalyzerNames.PlLucene,
    vectorAlgorithmType: KnownVectorSearchAlgorithmKind.ExhaustiveKnn,
    searchClient,
  });

  return vectorStore;
}

export const vectorStoreClient = createVectorStoreClient(searchClient);
