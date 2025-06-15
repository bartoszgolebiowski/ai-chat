"use client";

import { usePdfViewer } from "@/hooks/usePdfViewer";
import { X } from "lucide-react";

interface PdfViewerProps {
  selectedNodes: string[];
}

export function PdfViewer({ selectedNodes }: PdfViewerProps) {
  const { pdfTabs, activePdf, activeTabId, selectTab, closeTab } = usePdfViewer(selectedNodes);

  if (pdfTabs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select PDF files to view
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {pdfTabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center px-3 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer min-w-0 ${
              activeTabId === tab.id
                ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                : "hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            onClick={() => selectTab(tab.id)}
          >
            <span className="text-sm truncate max-w-32" title={tab.fileName}>
              {tab.fileName}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* PDF Display */}
      <div className="flex-1 relative">
        {activePdf && (
          <iframe
            src={activePdf.pdfPath}
            className="w-full h-full border-0"
            title={`PDF: ${activePdf.fileName}`}
          />
        )}
      </div>
    </div>
  );
}
