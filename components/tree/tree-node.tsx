"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { InternalTreeNode } from "@/hooks/tree/tree";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

interface TreeNodeComponentProps {
  node: InternalTreeNode;
  onToggle: (nodeId: string) => void;
  onToggleExpand: (nodeId: string) => void;
  level?: number;
}

export function TreeNodeComponent({
  node,
  onToggle,
  onToggleExpand,
  level = 0,
}: TreeNodeComponentProps) {
  const hasChildren = node.children && node.children.length > 0;

  // Determine checkbox state for Radix UI - it supports 'indeterminate' as a state
  const checkboxState = node.isIndeterminate ? "indeterminate" : node.isChecked;

  return (
    <div className="select-none">
      {/* Current node */}
      <div className="transition-colors">
        <div
          className="flex items-center space-x-1 py-1 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => onToggleExpand(node.id)}
            >
              {node.isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
          {!hasChildren && <div className="w-4" />}

          <Checkbox
            checked={checkboxState}
            onCheckedChange={() => onToggle(node.id)}
          />
          <Label
            className={cn(
              "cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              hasChildren && "font-semibold text-gray-900 dark:text-gray-100",
              !hasChildren && "text-gray-700 dark:text-gray-300"
            )}
            onClick={() => onToggle(node.id)}
          >
            [{level}] {node.name}
          </Label>
        </div>

        {/* Tags displayed under checkbox and label */}
        {node.tags && (
          <div
            className="px-2 pb-1"
            style={{ paddingLeft: `${level * 20 + 36}px` }}
          >
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {node.tags}
            </span>
          </div>
        )}
      </div>

      {/* Children nodes - only show if expanded */}
      {hasChildren && node.isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              onToggle={onToggle}
              onToggleExpand={onToggleExpand}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
