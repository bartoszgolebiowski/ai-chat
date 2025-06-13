import { contextChatEngineClient } from "@/lib/clients/context-chat-engine";
import { queryEngineEnhanced } from "@/lib/clients/query-engine-enhanced";
import { reranker } from "@/lib/clients/reranker";
import { responseGenerator } from "@/lib/clients/response-generator";
import { createDataStreamResponse, LlamaIndexAdapter, UIMessage } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, smart } = (await req.json()) as {
    messages: UIMessage[];
    smart: boolean;
  };

  if (!smart) {
    const stream = await contextChatEngineClient.chat({
      message: messages[messages.length - 1].content,
      stream: true,
    });

    return LlamaIndexAdapter.toDataStreamResponse(stream);
  }

  return createDataStreamResponse({
    status: 200,
    statusText: "OK",
    async execute(dataStream) {
      const userQuery = messages[messages.length - 1].content;

      // Use enhanced query engine with HyDE (without built-in reranking)
      const queryResult = await queryEngineEnhanced.query(userQuery, 10);

      // Apply reranking to improve relevance
      const rerankResult = await reranker.rerank(userQuery, queryResult.nodes, {
        strategy: "hybrid",
        topK: 5, // Final top-K after reranking
      });

      console.log(
        `Reranked ${rerankResult.originalCount} nodes to ${rerankResult.rerankedCount} using ${rerankResult.strategy} strategy`
      );

      // Generate streaming response using ResponseGenerator
      const { stream, sources } =
        await responseGenerator.generateStreamingResponse({
          query: userQuery,
          nodes: rerankResult.nodes,
        });

      LlamaIndexAdapter.mergeIntoDataStream(stream, {
        dataStream,
        callbacks: {
          onFinal: () => {
            sources.forEach((source) => {
              dataStream.writeSource(source);
            });
          },
        },
      });
    },
  });
}
