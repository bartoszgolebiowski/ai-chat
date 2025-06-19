import { NodeWithScore } from "llamaindex";
import { PdfRagEngineParams } from "../pdf-rag-engine";

export interface IPdfRetrievalStrategy {
  run(params: {
    query: string;
    options: PdfRagEngineParams;
  }): Promise<{ nodes: NodeWithScore[] }>;
}
