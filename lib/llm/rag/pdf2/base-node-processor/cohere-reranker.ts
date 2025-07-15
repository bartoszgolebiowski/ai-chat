import { env } from "@/lib/env";
import { CohereRerank } from "@llamaindex/cohere";

export const cohereReranker = new CohereRerank({
  apiKey: env.COHERE_SERVICE_API_KEY,
  baseUrl: env.COHERE_SERVICE_ENDPOINT,
  model: env.COHERE_SERVICE_MODEL,
  topN: 100,
});
