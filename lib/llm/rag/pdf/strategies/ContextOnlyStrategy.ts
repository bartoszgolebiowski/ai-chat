import { NodeWithScore } from "llamaindex";
import { RagContextManager } from "../../rag-context-manager";
import { EnhancedPDFRagOptions } from "../engine";
import { IPDFRagStrategy } from "./IRagStrategy";

export class PDFContextOnlyStrategy implements IPDFRagStrategy {
  constructor(private contextManager: RagContextManager) {}

  async run({
    options,
  }: {
    query: string;
    options: EnhancedPDFRagOptions;
  }): Promise<{ nodes: NodeWithScore[] }> {
    const finalNodes = this.contextManager.extractNodesFromContext(
      options.previousContext,
      options.maxContextNodes || 5
    );
    return {
      nodes: finalNodes,
    };
  }
}
