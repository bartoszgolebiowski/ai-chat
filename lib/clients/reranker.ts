import { Reranker } from "../llm/Reranker";
import { embeddingModel } from "../models/embedded";

export const reranker = new Reranker(embeddingModel);
