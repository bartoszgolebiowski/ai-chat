import { pdfDocumentRagEngine } from "@/lib/clients/rag/pdf/pdf-rag-engine";
import { conversationMemoryCache } from "@/lib/llm/cache/conversation-memory-cache";
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
    `PDF Chat ${id}: Received ${messages.length} messages for processing`
  );

  console.log(`Length of the selected nodes: ${selectedNodes.length}`);

  return createDataStreamResponse({
    status: 200,
    statusText: "OK",
    async execute(dataStream) {
      const lastUserQuery = messages[messages.length - 1].content;

      // Get conversation history from cache
      const conversationHistory = conversationMemoryCache.getConversation(id);

      const ragResult = await pdfDocumentRagEngine.execute(lastUserQuery, {
        previousContext: conversationHistory?.turns.map((turn) => ({
          userQuery: turn.userQuery,
          chatResponse: turn.response,
          contextNodes: turn.nodes,
        })),
        selectedNodes: selectedNodes,
      });

      LlamaIndexAdapter.mergeIntoDataStream(ragResult.stream, {
        dataStream,
        callbacks: {
          onFinal: (response) => {
            // Store the complete conversation turn in memory cache
            conversationMemoryCache.addTurn(
              id,
              lastUserQuery,
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
