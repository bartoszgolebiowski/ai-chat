import { HyDEQueryEngine } from "../../llm/hyde/hyde-query-engine";
import { retrieverClient } from "../retriver";
import { hyDEQueryTransformerClient } from "./hyde-query-transformer";

export const hyDEQueryEngine = new HyDEQueryEngine(
  retrieverClient,
  hyDEQueryTransformerClient
);
