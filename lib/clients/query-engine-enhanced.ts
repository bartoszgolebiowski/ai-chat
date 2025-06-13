import { QueryEngine } from "../llm/QueryEngine";
import { hyDEClient } from "./hyDE-query-transformer";
import { retrieverClient } from "./retriver";

export const queryEngineEnhanced = new QueryEngine(retrieverClient, hyDEClient);
