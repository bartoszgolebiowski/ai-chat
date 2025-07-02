import { UIMessage } from "ai";
import {
  ChatMessage,
  CondenseQuestionChatEngine,
  RetrieverQueryEngine,
} from "llamaindex";
import { condenseMessagePrompt } from "./prompts/chat-engine";

export const createChatEngine = (
  queryEngine: RetrieverQueryEngine,
  chatHistory: ChatMessage[]
) =>
  new CondenseQuestionChatEngine({
    queryEngine,
    chatHistory,
    condenseMessagePrompt,
  });

export const convertMessagesToChatHistory = (
  messages: UIMessage[]
): ChatMessage[] => {
  return messages
    .map((msg) => {
      if (msg.role === "system") {
        return { role: "system" as const, content: msg.content };
      }
      if (msg.role === "user") {
        return { role: "user" as const, content: msg.content };
      }
      if (msg.role === "assistant") {
        return { role: "assistant" as const, content: msg.content };
      }
      return null;
    })
    .filter((msg) => msg !== null);
};

export const getQuery = (messages: UIMessage[]) =>
  messages[messages.length - 1].content;
