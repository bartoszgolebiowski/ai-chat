import { z } from "zod";

const envSchema = z.object({
  AOAI_API_KEY: z.string(),
  
  AOAI_LLM_ENDPOINT: z.string(),
  AOAI_LLM_API_VERSION: z.string(),
  AOAI_LLM_MODEL: z.string(),
  AOAI_LLM_DEPLOYMENT_NAME: z.string(),

  AOAI_EMBEDDING_ENDPOINT: z.string(),
  AOAI_EMBEDDING_API_VERSION: z.string(),
  AOAI_EMBEDDING_MODEL: z.string(),
  AOAI_EMBEDDING_DEPLOYMENT_NAME: z.string(),

  SEARCH_SERVICE_API_KEY: z.string(),
  SEARCH_SERVICE_ENDPOINT: z.string(),
  SEARCH_SERVICE_API_VERSION: z.string(),
  SEARCH_SERVICE_INDEX_NAME_CONFLUENCE: z.string(),
  SEARCH_SERVICE_INDEX_NAME_PDF: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables:",
    parsedEnv.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
