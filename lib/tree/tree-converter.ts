import { RawTreeNode } from "@/hooks/tree/tree";
import { confluenceList } from "./confluence-list";

type TreeNode = {
  name: string;
  children: TreeNode[];
  tags: string;
};

function convertToTree(
  list: { filename: string; tags: string }[],
  branchingFactor = 10,
  maxDepth = 1,
  currentDepth = 0
): TreeNode | null {
  if (currentDepth >= maxDepth || list.length === 0) {
    return null;
  }

  const node: TreeNode = {
    name: currentDepth === 0 ? "Confluence" : list[0].filename,
    children: [],
    tags: currentDepth === 0 ? "" : list[0].tags,
  };

  const remainingList = currentDepth === 0 ? list : list.slice(1);
  const elementsPerChild = Math.floor(remainingList.length / branchingFactor);

  for (let i = 0; i < branchingFactor && remainingList.length > 0; i++) {
    const startIndex = i * elementsPerChild;
    const endIndex =
      i === branchingFactor - 1
        ? remainingList.length
        : (i + 1) * elementsPerChild;
    const childList = remainingList.slice(startIndex, endIndex);

    if (childList.length > 0) {
      const child = convertToTree(
        childList,
        branchingFactor,
        maxDepth,
        currentDepth + 1
      );
      if (child) {
        node.children.push(child);
      }
    }
  }

  return node;
}

// Convert the existing TreeNode type to RawTreeNode
function convertTreeNodeToRawTreeNode(node: TreeNode): RawTreeNode {
  return {
    name: node.name,
    tags: node.tags || "",
    children: node.children
      ? node.children.map(convertTreeNodeToRawTreeNode)
      : [],
  };
}

export const confluenceTree = convertTreeNodeToRawTreeNode(
  convertToTree(confluenceList) as TreeNode
);
