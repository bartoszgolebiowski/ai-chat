import { pdfContextOnlyStrategy } from "./context-only-strategy";
import { pdfHybridStrategy } from "./hybrid-strategy";
import { pdfNewSearchStrategy } from "./new-search-strategy";

export const strategies = {
  "context-only": pdfContextOnlyStrategy,
  "new-search": pdfNewSearchStrategy,
  hybrid: pdfHybridStrategy,
} as const;
