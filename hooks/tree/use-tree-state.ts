import { InternalTreeNode, RawTreeNode } from "@/hooks/tree/tree";
import { useCallback, useState } from "react";

// Helper function to generate unique IDs for nodes
function generateNodeId(node: RawTreeNode, parentId = ""): string {
  const cleanName = node.name.replace(/[^a-zA-Z0-9]/g, "-");
  return parentId ? `${parentId}-${cleanName}` : cleanName;
}

// Helper function to transform RawTreeNode to InternalTreeNode
function transformToInternalNode(
  node: RawTreeNode,
  parentId = ""
): InternalTreeNode {
  const nodeId = generateNodeId(node, parentId);

  return {
    ...node,
    id: nodeId,
    isChecked: true, // Start with all nodes selected
    isIndeterminate: false,
    isExpanded: false, // Start with nodes collapsed
    children: node.children.map((child) =>
      transformToInternalNode(child, nodeId)
    ),
  };
}

// Helper function to create a deep copy of the tree
function deepCopyTree(nodes: InternalTreeNode[]): InternalTreeNode[] {
  return nodes.map((node) => ({
    ...node,
    children: deepCopyTree(node.children),
  }));
}

// Helper function to find a node by ID in the tree
function findNodeById(
  nodes: InternalTreeNode[],
  nodeId: string
): InternalTreeNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node;
    }
    const found = findNodeById(node.children, nodeId);
    if (found) {
      return found;
    }
  }
  return null;
}

// Helper function to set node and all descendants to a specific state
function setNodeAndDescendantsState(
  node: InternalTreeNode,
  newCheckedState: boolean
): void {
  node.isChecked = newCheckedState;
  node.isIndeterminate = false;

  for (const child of node.children) {
    setNodeAndDescendantsState(child, newCheckedState);
  }
}

// Helper function to update parent states based on children
function updateParentState(parent: InternalTreeNode): void {
  const children = parent.children;
  if (children.length === 0) {
    return;
  }

  const checkedChildren = children.filter(
    (child) => child.isChecked && !child.isIndeterminate
  );
  const uncheckedChildren = children.filter(
    (child) => !child.isChecked && !child.isIndeterminate
  );

  if (checkedChildren.length === children.length) {
    // All children are checked
    parent.isChecked = true;
    parent.isIndeterminate = false;
  } else if (uncheckedChildren.length === children.length) {
    // All children are unchecked
    parent.isChecked = false;
    parent.isIndeterminate = false;
  } else {
    // Mixed state or some children are indeterminate
    parent.isChecked = false;
    parent.isIndeterminate = true;
  }
}

// Helper function to update all ancestor states
function updateAncestorsState(
  rootNodes: InternalTreeNode[],
  nodeId: string
): void {
  function updateAncestorsRecursive(nodes: InternalTreeNode[]): boolean {
    for (const node of nodes) {
      const children = node.children;
      if (children.some((child) => child.id === nodeId)) {
        // This node is a direct parent of the target node
        updateParentState(node);
        return true;
      }

      if (updateAncestorsRecursive(children)) {
        // Target node was found in subtree, update this node's state
        updateParentState(node);
        return true;
      }
    }
    return false;
  }

  updateAncestorsRecursive(rootNodes);
}

// Helper function to collect all selected node names
function collectSelectedNodes(nodes: InternalTreeNode[]): string[] {
  const selected: string[] = [];

  function traverse(node: InternalTreeNode) {
    if (node.isChecked && !node.isIndeterminate) {
      selected.push(node.name);
    }

    for (const child of node.children) {
      traverse(child);
    }
  }

  for (const node of nodes) {
    traverse(node);
  }

  return selected;
}

export function useTreeState(initialData: RawTreeNode[]) {
  // Transform initial data to internal nodes
  const [tree, setTree] = useState<InternalTreeNode[]>(() =>
    initialData.map((node) => {
      const transformed = transformToInternalNode(node);
      // Only expand the root level (Confluence node) initially
      transformed.isExpanded = true;
      return transformed;
    })
  );

  const toggleNode = useCallback((nodeId: string) => {
    setTree((currentTree) => {
      // Create deep copy for immutability
      const newTree = deepCopyTree(currentTree);

      // Find the target node
      const targetNode = findNodeById(newTree, nodeId);
      if (!targetNode) {
        return currentTree; // Node not found, return unchanged
      }

      // Determine new checked state
      const newCheckedState = targetNode.isIndeterminate
        ? true
        : !targetNode.isChecked;

      // Set target node and all descendants
      setNodeAndDescendantsState(targetNode, newCheckedState);

      // Update all ancestor states
      updateAncestorsState(newTree, nodeId);

      return newTree;
    });
  }, []);

  const toggleExpand = useCallback((nodeId: string) => {
    setTree((currentTree) => {
      const newTree = deepCopyTree(currentTree);
      const targetNode = findNodeById(newTree, nodeId);
      if (targetNode) {
        targetNode.isExpanded = !targetNode.isExpanded;
      }
      return newTree;
    });
  }, []);

  // Get currently selected nodes
  const selectedNodes = collectSelectedNodes(tree);

  return {
    tree,
    toggleNode,
    toggleExpand,
    selectedNodes,
  };
}
