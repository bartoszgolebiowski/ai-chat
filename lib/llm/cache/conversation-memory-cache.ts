import { NodeWithScore } from "llamaindex";
import { Metadata } from "next";
import { Source } from "../rag/rag-response-sources";

export interface ConversationTurn {
  id: string;
  timestamp: Date;
  userQuery: string;
  response: string;
  nodes: NodeWithScore[];
  sources: Source[];
}

export interface ConversationHistory {
  chatId: string;
  turns: ConversationTurn[];
  createdAt: Date;
  updatedAt: Date;
}

export type ChatHistory = {
  userQuery: string;
  chatResponse: string;
  contextNodes: NodeWithScore<Metadata>[];
}[];

export class ConversationMemoryCache {
  private cache = new Map<string, ConversationHistory>();

  /**
   * Add a new turn to the conversation
   */
  addTurn(
    chatId: string,
    userQuery: string,
    response: string,
    nodes: NodeWithScore[],
    sources: Source[]
  ): void {
    const turnId = `${chatId}-${Date.now()}`;
    const turn: ConversationTurn = {
      id: turnId,
      timestamp: new Date(),
      userQuery,
      response,
      nodes,
      sources,
    };

    if (this.cache.has(chatId)) {
      const conversation = this.cache.get(chatId)!;
      conversation.turns.push(turn);
      conversation.updatedAt = new Date();
    } else {
      const newConversation: ConversationHistory = {
        chatId,
        turns: [turn],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.cache.set(chatId, newConversation);
    }
  }

  /**
   * Get complete conversation history
   */
  getConversation(chatId: string): ConversationHistory | undefined {
    return this.cache.get(chatId);
  }

  /**
   * Get all chunks (nodes) for a conversation
   */
  getAllChunks(chatId: string): NodeWithScore[] {
    const conversation = this.cache.get(chatId);
    if (!conversation) return [];

    return conversation.turns.flatMap((turn) => turn.nodes);
  }

  /**
   * Get all sources for a conversation
   */
  getAllSources(chatId: string): Source[] {
    const conversation = this.cache.get(chatId);
    if (!conversation) return [];

    const uniqueSources = new Map<string, Source>();
    conversation.turns.forEach((turn) => {
      turn.sources.forEach((source) => {
        uniqueSources.set(source.id, source);
      });
    });

    return Array.from(uniqueSources.values());
  }

  /**
   * Clear conversation from cache
   */
  clearConversation(chatId: string): boolean {
    return this.cache.delete(chatId);
  }

  /**
   * Get all conversation IDs
   */
  getAllConversationIds(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Clear all conversations (useful for cleanup)
   */
  clearAll(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const conversationMemoryCache = new ConversationMemoryCache();
