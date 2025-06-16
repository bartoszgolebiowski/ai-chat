import { Reranker } from "../llm/reranker";
import { embeddingModel } from "../models/embedded";

export const reranker = new Reranker(embeddingModel);
