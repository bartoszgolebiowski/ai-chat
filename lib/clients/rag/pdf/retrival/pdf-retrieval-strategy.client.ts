import { PdfRetrival } from "@/lib/llm/rag/pdf/retrival/pdf-retrival";
import { pdfCombinedSearchRetrival } from "./pdf-combine-retrieval-strategy.client";
import { pdfContextOnlyRetrieval } from "./pdf-context-only-retrival-strategy.client";
import { pdfNewRetrival } from "./pdf-new-retrival-strategy.client";

export const pdfRerivalStrategies = new PdfRetrival();

pdfRerivalStrategies.registerStrategy("new-search", pdfNewRetrival);
pdfRerivalStrategies.registerStrategy("context-only", pdfContextOnlyRetrieval);
pdfRerivalStrategies.registerStrategy(
  "new-search-and-context",
  pdfCombinedSearchRetrival
);
