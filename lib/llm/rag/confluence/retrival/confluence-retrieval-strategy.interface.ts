import { NodeWithScore } from "llamaindex";
import { ConfluenceRagEngineParams } from "../confluence-rag-engine";

export interface IConfluenceRetrievalStrategy {
  run(params: {
    query: string;
    options: ConfluenceRagEngineParams;
  }): Promise<{ nodes: NodeWithScore[] }>;
}
