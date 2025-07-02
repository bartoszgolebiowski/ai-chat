import {
  BaseNodePostprocessor,
  BaseRetriever,
  getResponseSynthesizer,
  VectorStoreIndex,
} from "llamaindex";
import {
  refineTemplate,
  summaryTemplate,
  textQATemplate,
} from "./prompts/query-engine";

export const createQueryEngine = (
  index: VectorStoreIndex,
  retriever: BaseRetriever,
  options: {
    nodePostprocessors: BaseNodePostprocessor[];
    mode: Parameters<typeof getResponseSynthesizer>[0];
  }
) =>
  index.asQueryEngine({
    retriever,
    nodePostprocessors: options.nodePostprocessors,
    responseSynthesizer: getResponseSynthesizer(options.mode, {
      textQATemplate,
      summaryTemplate,
      refineTemplate,
    }),
  });
