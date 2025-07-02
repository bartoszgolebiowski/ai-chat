import { env } from "@/lib/env";
import { CohereRerank } from "@llamaindex/cohere";

export const cohereReranker = new CohereRerank({
  apiKey: env.COHERE_SERVICE_API_KEY,
  baseUrl: env.COHERE_SERVICE_ENDPOINT,
  model: env.COHERE_SERVICE_MODEL,
  topN: 5,
});

cohereReranker.postprocessNodes = new Proxy(cohereReranker.postprocessNodes, {
  apply: async (target, thisArg, args) => {
    // Call the original
    const result = await target.apply(thisArg, args);
    console.log(
      "scores:",
      result.map((node) => node.score)
    );
    return Promise.resolve(result);
  },
});
