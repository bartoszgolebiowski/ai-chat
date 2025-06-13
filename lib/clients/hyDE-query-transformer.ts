import { HyDEQueryTransformer } from "../llm/HyDEQueryTransformer";
import { embeddingModel } from "../models/embedded";
import { llm } from "../models/llm";

export const hyDEClient = new HyDEQueryTransformer(llm, embeddingModel);
