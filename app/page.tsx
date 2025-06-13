"use client";

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
import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function Page() {
  const [smartMode, setSmartMode] = useState(true);
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    body: {
      smart: smartMode,
    },
  });

  return (
    <div className="container mx-auto max-w-2xl h-screen flex flex-col bottom-0">
      <ChatMessageArea
        className="space-y-4 p-4 max-h-[400px]"
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

      <div className="flex items-center space-x-2 mb-2 px-4">
        <input
          type="checkbox"
          id="smart-mode"
          checked={smartMode}
          onChange={(e) => setSmartMode(e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="smart-mode" className="text-sm text-gray-700">
          Smart mode
        </label>
      </div>

      <ChatInput
        variant="default"
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        className="mb-4"
      >
        <ChatInputTextArea placeholder="Type a message..." />
        <ChatInputSubmit />
      </ChatInput>
    </div>
  );
}
