import { contextOnlyStrategy } from "./context-only-strategy";
import { hybridStrategy } from "./hybrid-strategy";
import { newSearchStrategy } from "./new-search-strategy";

export const strategies = {
  "context-only": contextOnlyStrategy,
  "new-search": newSearchStrategy,
  hybrid: hybridStrategy,
} as const;
