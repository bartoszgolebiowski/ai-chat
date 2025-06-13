import { createAzure } from "@ai-sdk/azure";
import { AzureOpenAIEmbedding } from "@llamaindex/azure";
import { env } from "../env";

const createAzureEmbeddingClient = () => {
  const embedding = new AzureOpenAIEmbedding({
    model: env.AOAI_EMBEDDING_MODEL,
    deployment: env.AOAI_EMBEDDING_DEPLOYMENT_NAME,
    apiKey: env.AOAI_API_KEY,
    endpoint: env.AOAI_EMBEDDING_ENDPOINT,
    apiVersion: env.AOAI_EMBEDDING_API_VERSION,
  });

  return embedding;
};

const createEmbeddingModel = () => {
  const azure = createAzure({
    resourceName: "sdc-sharepoint-ai-poc-oai",
    apiKey: env.AOAI_API_KEY,
  });

  return azure.textEmbeddingModel(env.AOAI_EMBEDDING_MODEL);
};

export const azureEmbeddingClient = createAzureEmbeddingClient();
export const embeddingModel = createEmbeddingModel();
export type EmbeddingModel = typeof embeddingModel;
