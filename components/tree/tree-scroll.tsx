"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TreeScrollProps {
  children: ReactNode;
  className?: string;
}

export function TreeScroll({ children, className }: TreeScrollProps) {
  return (
    <div
      className={cn(
        "overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 h-full",
        className
      )}
    >
      {children}
    </div>
  );
}
