"use client";

import { InternalTreeNode } from "@/hooks/tree/tree";
import { TreeNodeComponent } from "./tree-node";
import { TreeScroll } from "./tree-scroll";

interface TreeViewComponentProps {
  nodes: InternalTreeNode[];
  onToggle: (nodeId: string) => void;
  onToggleExpand: (nodeId: string) => void;
  maxHeight?: string;
}

export function TreeViewComponent({
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
