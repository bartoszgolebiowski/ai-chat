import { NodeWithScore } from "llamaindex";

export class RagContextManager {
  extractNodesFromContext(
    previousContext: {
      contextNodes: NodeWithScore[];
    }[] = [],
    maxNodes: number
  ): NodeWithScore[] {
    const allNodes: NodeWithScore[] = [];
    previousContext.forEach((context) => {
      allNodes.push(...context.contextNodes);
    });
    return allNodes
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, maxNodes);
  }

  combineAndDeduplicateNodes(
    contextNodes: NodeWithScore[],
    newNodes: NodeWithScore[]
  ): NodeWithScore[] {
    const seenIds = new Set<string>();
    const combinedNodes: NodeWithScore[] = [];
    contextNodes.forEach((node) => {
      if (!seenIds.has(node.node.id_)) {
        seenIds.add(node.node.id_);
        combinedNodes.push({
          ...node,
          score: (node.score || 0) * 1.2,
        });
      }
    });
    newNodes.forEach((node) => {
      if (!seenIds.has(node.node.id_)) {
        seenIds.add(node.node.id_);
        combinedNodes.push(node);
      }
    });
    return combinedNodes;
  }
}
