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

export default function Page() {
  const { tree, toggleNode, toggleExpand, selectedNodes } = useTreeState([
    pdfTree,
  ]);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat/pdf",
    body: {
      selectedNodes,
    },
  });

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
        <ScrollArea className="h-[calc(100vh-120px)]">
          <ChatMessageArea
            className="space-y-4 p-4"
            scrollButtonAlignment="center"
          >
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                id={message.id}
                type={message.role === "user" ? "outgoing" : "incoming"}
              >
                {message.role === "assistant" && <ChatMessageAvatar />}
                <ChatMessageContent content={message.content}>
                  <div className="flex flex-col space-y-2 mt-2">
                    {message.parts?.map((part, index) => {
                      if (part.type === "source") {
                        return (
                          <a
                            href={part.source.url}
                            key={index}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span className="text-blue-500 underline">
                              {part.source.title}
                            </span>
                          </a>
                        );
                      }
                      return null;
                    })}
                  </div>
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
