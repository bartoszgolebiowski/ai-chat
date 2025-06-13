import { hydeRagEngine } from "@/lib/clients/hyde/hyde-rag-engine";
import { createDataStreamResponse, LlamaIndexAdapter, UIMessage } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = (await req.json()) as {
    messages: UIMessage[];
  };

  return createDataStreamResponse({
    status: 200,
    statusText: "OK",
    async execute(dataStream) {
      const userQuery = messages[messages.length - 1].content;

      // Execute complete HyDE-enhanced RAG pipeline
      const ragResult = await hydeRagEngine.execute(userQuery, {
        retrievalTopK: 10,
        rerankTopK: 5,
        rerankStrategy: "hybrid",
      });

      LlamaIndexAdapter.mergeIntoDataStream(ragResult.stream, {
        dataStream,
        callbacks: {
          onFinal: () => {
            ragResult.sources.forEach((source) => {
              dataStream.writeSource(source);
            });
          },
        },
      });
    },
  });
}
