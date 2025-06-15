import { RawTreeNode } from "@/hooks/tree/tree";
import { confluenceList } from "./confluence-list";
import { pdfList } from "./pdf-list";

type TreeNode = {
  name: string;
  children: TreeNode[];
  tags: string;
};

function convertToTree(
  nodes: TreeNode[],
  rootName: string = "Confluence"
): TreeNode {
  return {
    name: rootName,
    children: nodes,
    tags: "",
  };
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
  convertToTree(
    confluenceList.map((item) => ({
      name: item.filename,
      children: [],
      tags: item.tags,
    })),
    "Confluence Documentation"
  )
);

export const pdfTree = convertTreeNodeToRawTreeNode(
  convertToTree(
    pdfList.map((item) => ({
      name: item,
      children: [],
      tags: "",
    })),
    "PDF Documentation"
  )
);
