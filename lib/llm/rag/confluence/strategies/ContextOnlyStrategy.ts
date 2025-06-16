import { NodeWithScore } from "llamaindex";
import { RagContextManager } from "../../context-manager";
import { EnhancedRagOptions } from "../engine";
import { IRagStrategy } from "./IRagStrategy";

export class ContextOnlyStrategy implements IRagStrategy {
  constructor(private contextManager: RagContextManager) {}
  async run({
    options,
  }: {
    query: string;
    options: EnhancedRagOptions;
  }): Promise<{ nodes: NodeWithScore[] }> {
    const finalNodes = this.contextManager.extractNodesFromContext(
      options.previousContext,
      options.maxContextNodes || 5
    );
    return { nodes: finalNodes };
  }
}
