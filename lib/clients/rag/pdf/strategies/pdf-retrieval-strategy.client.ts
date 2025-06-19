import { pdfCombinedSearchRetrival } from "./pdf-combine-retrieval-strategy.client";
import { pdfContextOnlyRetrieval } from "./pdf-context-only-retrival-strategy.client";
import { pdfNewRetrival } from "./pdf-new-retrival-strategy.client";

export const pdfStrategies = {
  "context-only": pdfContextOnlyRetrieval,
  "new-search": pdfNewRetrival,
  hybrid: pdfCombinedSearchRetrival,
} as const;
