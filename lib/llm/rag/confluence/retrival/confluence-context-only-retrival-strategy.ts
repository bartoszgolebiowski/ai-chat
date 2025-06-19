import { NodeWithScore } from "llamaindex";
import { RagContextManager } from "../../rag-context-manager";
import { ConfluenceRagEngineParams } from "../confluence-rag-engine";
import { IConfluenceRetrievalStrategy } from "./confluence-retrieval-strategy.interface";

export class ConfluenceContextOnlyRetrievalStrategy
  implements IConfluenceRetrievalStrategy
{
  async run({
    options,
  }: {
    query: string;
    options: ConfluenceRagEngineParams;
  }): Promise<{ nodes: NodeWithScore[] }> {
    const finalNodes = RagContextManager.extractNodesFromContext(
      options.previousContext,
      options.maxContextNodes || 5
    );
    return { nodes: finalNodes };
  }
}
