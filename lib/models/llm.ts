import { createAzure } from "@ai-sdk/azure";
import { AzureOpenAI } from "@llamaindex/azure";
import { env } from "../env";

const createAzureAiClient = () => {
  const llm = new AzureOpenAI({
    model: env.AOAI_LLM_MODEL,
    deployment: env.AOAI_LLM_DEPLOYMENT_NAME,
    apiKey: env.AOAI_API_KEY,
    endpoint: env.AOAI_LLM_ENDPOINT,
    apiVersion: env.AOAI_LLM_API_VERSION,
  });

  return llm;
};

const createLLMModel = () => {
  const azure = createAzure({
    resourceName: "sdc-sharepoint-ai-poc-oai",
    apiKey: env.AOAI_API_KEY,
  });

  return azure(env.AOAI_LLM_MODEL);
};

export const azureAiClient = createAzureAiClient();
export const llm = createLLMModel();
export type LLM = typeof llm;
