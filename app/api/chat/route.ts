import { conversationMemoryCache } from "@/lib/cache/conversation-memory-cache";
import { ragEngineEnhanced } from "@/lib/clients/rag/rag-engine-enhanced";
import { createDataStreamResponse, LlamaIndexAdapter, UIMessage } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, id, selectedNodes } = (await req.json()) as {
    messages: UIMessage[];
    id: string;
    selectedNodes: string[];
  };

  console.log(
    `Chat ${id}: Received ${messages.length} messages for processing`
  );

  console.log(`Length of the selected nodes: ${selectedNodes.length}`);

  return createDataStreamResponse({
    status: 200,
    statusText: "OK",
    async execute(dataStream) {
      const userQuery = messages[messages.length - 1].content;

      // Get conversation history from cache
      const conversationHistory = conversationMemoryCache.getConversation(id);

      const ragResult = await ragEngineEnhanced.execute(userQuery, {
        retrievalTopK: 10,
        rerankTopK: 5,
        rerankStrategy: "hybrid",
        previousContext: conversationHistory?.turns.map((turn) => ({
          query: turn.userQuery,
          response: turn.response,
          nodes: turn.nodes,
        })),
        selectedNodes: selectedNodes,
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
    },
  });
}
