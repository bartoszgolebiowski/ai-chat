"use client";

import { InternalTreeNode } from "@/hooks/tree/tree";
import React from "react";
import { TreeNodeComponent } from "./tree-node";
import { TreeScroll } from "./tree-scroll";

interface TreeViewComponentProps {
  nodes: InternalTreeNode[];
  onToggle: (nodeId: string) => void;
  onToggleExpand: (nodeId: string) => void;
  maxHeight?: string;
}

function TreeViewComponentRaw({
  nodes,
  onToggle,
  onToggleExpand,
}: TreeViewComponentProps) {
  return (
    <TreeScroll className="p-2">
      <div className="space-y-1">
        {nodes.map((node) => (
          <TreeNodeComponent
            key={node.id}
            node={node}
            onToggle={onToggle}
            onToggleExpand={onToggleExpand}
            level={0}
          />
        ))}
      </div>
    </TreeScroll>
  );
}

export const TreeViewComponent = React.memo(
  TreeViewComponentRaw,
  (prevProps, nextProps) => {
    // Only re-render if nodes or handlers change
    return prevProps.nodes === nextProps.nodes;
  }
);
