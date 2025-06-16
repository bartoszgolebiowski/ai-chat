import { confluenceContextOnlyStrategy } from "./context-only-strategy";
import { confluenceHybridStrategy } from "./hybrid-strategy";
import { confluenceNewSearchStrategy } from "./new-search-strategy";

export const strategies = {
  "context-only": confluenceContextOnlyStrategy,
  "new-search": confluenceNewSearchStrategy,
  hybrid: confluenceHybridStrategy,
} as const;
