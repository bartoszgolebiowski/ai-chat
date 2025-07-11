import { NodeWithScore } from "llamaindex";
import { RagContextManager } from "../../rag-context-manager";
import { PdfRagEngineParams } from "../pdf-rag-engine";
import { IPdfRetrievalStrategy } from "./pdf-retrieval-strategy.interface";

export class PdfContextOnlyRetrievalStrategy implements IPdfRetrievalStrategy {
  async run({
    options,
  }: {
    query: string;
    options: PdfRagEngineParams;
  }): Promise<{ nodes: NodeWithScore[] }> {
    const finalNodes = RagContextManager.extractNodesFromContext(
      options.previousContext,
      options.maxContextNodes || 5
    );
    return {
      nodes: finalNodes,
    };
  }
}
