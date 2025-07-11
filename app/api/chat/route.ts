import { ragEngineConfluenceEnhanced } from "@/lib/clients/rag/confluence/confluence-rag-engine.client";
import { conversationMemoryCache } from "@/lib/llm/cache/conversation-memory-cache";
import { createDataStreamResponse, LlamaIndexAdapter, UIMessage } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, id } = (await req.json()) as {
    messages: UIMessage[];
    id: string;
  };

  console.log(
    `Confluence Chat ${id}: Received ${messages.length} messages for processing`
  );

  return createDataStreamResponse({
    status: 200,
    statusText: "OK",
    async execute(dataStream) {
      const userQuery = messages[messages.length - 1].content;

      // Get conversation history from cache
      const conversationHistory = conversationMemoryCache.getConversation(id);

      try {
        const ragResult = await ragEngineConfluenceEnhanced.execute(userQuery, {
          previousContext: conversationHistory?.turns.map((turn) => ({
            userQuery: turn.userQuery,
            chatResponse: turn.response,
            contextNodes: turn.nodes,
          })),
        });

        LlamaIndexAdapter.mergeIntoDataStream(ragResult.stream, {
          dataStream,
          callbacks: {
            onFinal: (response) => {
              ragResult.sources.forEach((source) =>
                dataStream.writeSource(source)
              );

              // Store the complete conversation turn in memory cache
              conversationMemoryCache.addTurn(
                id,
                userQuery,
                response,
                ragResult.nodes,
                ragResult.sources
              );

              console.log(
                `Chat ${id}: Stored new turn. Total turns: ${
                  conversationMemoryCache.getConversation(id)?.turns.length
                }`
              );
            },
          },
        });
      } catch (error) {
        console.log(`Chat ${id}: Error processing query`, error);
      }
    },
  });
}
