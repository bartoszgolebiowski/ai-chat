import { HyDEQueryTransformer } from "../../llm/hyde/hyde-query-transformer";
import { embeddingModel } from "../../models/embedded";
import { llm } from "../../models/llm";

export const hyDEQueryTransformerClient = new HyDEQueryTransformer(
  llm,
  embeddingModel
);
