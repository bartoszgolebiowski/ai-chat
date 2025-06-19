import { confluenceCombineRetrival } from "./confluence-combine-retrival-strategy.client";
import { confluenceContextOnlyRetrival } from "./confluence-context-only-strategy.client";
import { confluenceNewSearchRetrival } from "./confluence-new-search-strategy.client";

export const strategies = {
  "context-only": confluenceContextOnlyRetrival,
  "new-search": confluenceNewSearchRetrival,
  hybrid: confluenceCombineRetrival,
} as const;
