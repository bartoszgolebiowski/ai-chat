"use client";

import { PdfViewer } from "@/components/pdf-viewer";
import { TreeViewComponent, useTreeState } from "@/components/tree";
import {
  ChatInput,
  ChatInputSubmit,
  ChatInputTextArea,
} from "@/components/ui/chat-input";
import {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageContent,
} from "@/components/ui/chat-message";
import { ChatMessageArea } from "@/components/ui/chat-message-area";
import { ScrollArea } from "@/components/ui/scroll-area";
import { pdfTree } from "@/lib/tree/tree-converter";
import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";

export default function Page() {
  const { tree, toggleNode, toggleExpand, selectedNodes } = useTreeState([
    pdfTree,
  ]);

  const { messages, input, error, handleInputChange, handleSubmit, reload } =
    useChat({
      api: "/api/chat/pdf2",
      body: {
        selectedNodes,
        mode: "compact",
      },
    });

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        "div[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleReloadFast = () => {
    reload({
      body: {
        selectedNodes,
        mode: "compact", // or 'tree_summarize', 'multi_modal' as needed
      },
    });
  };

  const handleReloadQuality = () => {
    reload({
      body: {
        selectedNodes,
        mode: "refine", // or 'tree_summarize', 'multi_modal' as needed
      },
    });
  };
  // Scroll to bottom after submitting
  return (
    <div className="flex h-screen">
      {/* Left sidebar with tree */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
        <TreeViewComponent
          nodes={tree}
          onToggle={toggleNode}
          onToggleExpand={toggleExpand}
        />
      </div>

      {/* PDF Viewer - takes remaining space */}
      <div className="flex-1 border-r border-gray-200 dark:border-gray-700">
        <PdfViewer selectedNodes={selectedNodes} />
      </div>

      {/* Main chat area - fixed width */}
      <div className="h-screen w-160 flex flex-col flex-shrink-0 mr-10 relative">
        <ScrollArea ref={scrollAreaRef} className="h-[calc(100vh-120px)]">
          <ChatMessageArea
            className="space-y-4 p-4"
            scrollButtonAlignment="center"
          >
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                id={message.id}
                type={message.role === "user" ? "outgoing" : "incoming"}
              >
                {message.role === "assistant" && <ChatMessageAvatar />}
                <ChatMessageContent content={message.content}>
                  {message.role === "assistant" &&
                    index === messages.length - 1 && (
                      <div className="mt-2 flex gap-2">
                        {error ? (
                          <button
                            onClick={() => reload()}
                            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/40 transition-colors"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Generate Again
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={handleReloadFast}
                              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800 dark:hover:bg-blue-900/40 transition-colors"
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                              Fast Mode
                            </button>
                            <button
                              onClick={handleReloadQuality}
                              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20 dark:border-purple-800 dark:hover:bg-purple-900/40 transition-colors"
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                              </svg>
                              Quality Mode
                            </button>
                          </>
                        )}
                      </div>
                    )}
                </ChatMessageContent>
                {message.role === "user" && <ChatMessageAvatar />}
              </ChatMessage>
            ))}
          </ChatMessageArea>
        </ScrollArea>

        <ChatInput
          variant="default"
          value={input}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          className="absolute bottom-4 left-4 right-14 bg-white dark:bg-gray-800"
        >
          <ChatInputTextArea placeholder="Type a message..." />
          <ChatInputSubmit />
        </ChatInput>
      </div>
    </div>
  );
}
