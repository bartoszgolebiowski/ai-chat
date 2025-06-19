import { ConfluenceRetrival } from "@/lib/llm/rag/confluence/retrival/confluence-retrival";
import { confluenceCombineRetrival } from "./confluence-combine-retrival-strategy.client";
import { confluenceContextOnlyRetrival } from "./confluence-context-only-retrival-strategy.client";
import { confluenceNewSearchRetrival } from "./confluence-new-retrival-strategy.client";

export const confluenceRerivalStrategies = new ConfluenceRetrival();

confluenceRerivalStrategies.registerStrategy(
  "new-search",
  confluenceNewSearchRetrival
);
confluenceRerivalStrategies.registerStrategy(
  "context-only",
  confluenceContextOnlyRetrival
);
confluenceRerivalStrategies.registerStrategy(
  "new-search-and-context",
  confluenceCombineRetrival
);
