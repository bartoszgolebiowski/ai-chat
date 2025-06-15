import { useMemo, useState } from "react";

export interface PdfTab {
  id: string;
  fileName: string;
  pdfPath: string;
}

export function usePdfViewer(selectedNodes: string[]) {
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const pdfTabs = useMemo(() => {
    return selectedNodes
      .filter((node) => node.endsWith(".md"))
      .map((node) => {
        const fileName = node.split("/").pop() || node;
        const pdfFileName = fileName.replace(".md", ".pdf");
        return {
          id: node,
          fileName: pdfFileName,
          pdfPath: `/static/${pdfFileName}`,
        };
      });
  }, [selectedNodes]);

  const activePdf = pdfTabs.find((tab) => tab.id === activeTabId);

  const selectTab = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const closeTab = (tabId: string) => {
    if (activeTabId === tabId) {
      const currentIndex = pdfTabs.findIndex((tab) => tab.id === tabId);
      const nextTab = pdfTabs[currentIndex + 1] || pdfTabs[currentIndex - 1];
      setActiveTabId(nextTab?.id || null);
    }
  };

  // Auto-select first tab when tabs change
  if (pdfTabs.length > 0 && !activePdf) {
    setActiveTabId(pdfTabs[0].id);
  }

  return {
    pdfTabs,
    activePdf,
    activeTabId,
    selectTab,
    closeTab,
  };
}
