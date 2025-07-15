import { vectorStoreIndexPDFClient } from "@/lib/clients/vector-store-index.client";
import { cohereReranker } from "@/lib/llm/rag/pdf2/base-node-processor/cohere-reranker";
import {
  convertMessagesToChatHistory,
  createChatEngine,
  getQuery,
} from "@/lib/llm/rag/pdf2/chat-engine";
import { createQueryEngine } from "@/lib/llm/rag/pdf2/query-engine";
import { createRetriever } from "@/lib/llm/rag/pdf2/retriever";
import { createFilenameFilters } from "@/lib/tree/filter-converter";
import { createDataStreamResponse, LlamaIndexAdapter, UIMessage } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    selectedNodes,
    mode = "compact",
    similarityTopK = 20,
  } = (await req.json()) as {
    messages: UIMessage[];
    id: string;
    selectedNodes: string[];
    mode?: "refine" | "compact" | "tree_summarize" | "multi_modal";
    similarityTopK?: number;
  };

  const index = await vectorStoreIndexPDFClient;
  const retriever = createRetriever(
    index,
    similarityTopK,
    createFilenameFilters(
      selectedNodes.map((node) => node.replaceAll(".md", ".pdf"))
    )
  );

  const queryEngine = createQueryEngine(index, retriever, {
    mode,
    nodePostprocessors: [cohereReranker],
  });

  const chatEngine = createChatEngine(
    queryEngine,
    convertMessagesToChatHistory(messages)
  );

  const response = await chatEngine.chat({
    message: getQuery(messages),
    stream: true,
  });

  return createDataStreamResponse({
    status: 200,
    statusText: "OK",
    async execute(dataStream) {
      LlamaIndexAdapter.mergeIntoDataStream(response, {
        dataStream,
      });
    },
  });
}
