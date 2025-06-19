import { NodeWithScore } from "llamaindex";
import { RagContextManager } from "../../rag-context-manager";
import { ConfluenceRagEngineParams } from "../confluence-rag-engine";
import { IConfluenceRetrievalStrategy } from "./confluence-retrieval-strategy.interface";

export class ConfluenceContextOnlyRetrievalStrategy
  implements IConfluenceRetrievalStrategy
{
  constructor(private contextManager: RagContextManager) {}
  async run({
    options,
  }: {
    query: string;
    options: ConfluenceRagEngineParams;
  }): Promise<{ nodes: NodeWithScore[] }> {
    const finalNodes = this.contextManager.extractNodesFromContext(
      options.previousContext,
      options.maxContextNodes || 5
    );
    return { nodes: finalNodes };
  }
}
