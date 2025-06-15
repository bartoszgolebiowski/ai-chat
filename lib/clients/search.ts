import { AzureKeyCredential } from "@azure/core-auth";
import { SearchClient } from "@azure/search-documents";
import { env } from "../env";

function createSearchConfluenceClient() {
  const searchServiceEndpoint = env.SEARCH_SERVICE_ENDPOINT;
  const searchServiceApiKey = env.SEARCH_SERVICE_API_KEY;
  const searchIndexName = env.SEARCH_SERVICE_INDEX_NAME;

  return new SearchClient(
    searchServiceEndpoint,
    searchIndexName,
    new AzureKeyCredential(searchServiceApiKey)
  );
}

function createSearchPDFClient() {
  const searchServiceEndpoint = env.SEARCH_SERVICE_ENDPOINT;
  const searchServiceApiKey = env.SEARCH_SERVICE_API_KEY;
  const searchIndexName = env.SEARCH_SERVICE_INDEX_NAME;

  return new SearchClient(
    searchServiceEndpoint,
    searchIndexName,
    new AzureKeyCredential(searchServiceApiKey)
  );
}

export const searchConfluenceClient = createSearchConfluenceClient();
export const searchPDFClient = createSearchPDFClient();
