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
import { searchConfluenceClient, searchPDFClient } from "./search";

Settings.embedModel = azureEmbeddingClient;
Settings.llm = azureAiClient;

function createVectorStoreConfluenceClient(searchClient: SearchClient<any>) {
  const filterableMetadataFieldKeys = {
    filename: "filename",
    tags: ["tags", MetadataIndexFieldType.COLLECTION],
  } as unknown as FilterableMetadataFieldKeysType;

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

function createVectorStorePDFClient(searchClient: SearchClient<any>) {
  const filterableMetadataFieldKeys = {
    filename: "filename",
  } as unknown as FilterableMetadataFieldKeysType;

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
    languageAnalyzer: KnownAnalyzerNames.EnLucene,
    vectorAlgorithmType: KnownVectorSearchAlgorithmKind.ExhaustiveKnn,
    searchClient,
  });

  return vectorStore;
}

export const vectorStoreConfluenceClient =
  createVectorStoreConfluenceClient(searchConfluenceClient);

export const vectorStorePDFClient = createVectorStorePDFClient(searchPDFClient);
