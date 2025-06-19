import { LLM } from "@/lib/models/llm";
import { generateObject } from "ai";
import { MetadataMode, NodeWithScore } from "llamaindex";
import { z } from "zod";
import { IPdfRerankerStrategy } from "./pdf-reranker.interface";

export class PdfLlmRerankerStrategy implements IPdfRerankerStrategy {
  constructor(private llm: LLM) {}

  /**
   * Rerank nodes using an LLM to judge relevance.
   * @param query The user query
   * @param nodes List of nodes with scores
   * @param threshold Minimum score (0-1) to consider a chunk as matching
   */
  async rerank(
    query: string,
    nodes: NodeWithScore[],
    threshold: number = 0.5
  ): Promise<NodeWithScore[]> {
    // Build XML chunks for prompt
    const xmlChunks = nodes
      .map((node, i) => {
        const filename = node.node.metadata?.filename || `chunk_${i}`;
        const content = node.node.getContent(MetadataMode.NONE);
        return `<chunk id="${i}" filename="${filename}"><content>${content}</content></chunk>`;
      })
      .join("\n");

    // Zod schema for output: array of { index, score }
    const schema = z.object({
      scores: z.array(
        z.object({
          index: z
            .number()
            .int()
            .min(0)
            .max(nodes.length - 1),
          score: z.number().min(0).max(1),
        })
      ),
    });

    // High quality prompt
    const prompt = `You are an expert document assistant. Given a user query and a set of document chunks, your task is to evaluate how much each chunk is in correlation (can provide meaningful context) with the query. Each chunk is provided in XML format with filename and content. For each chunk, return a score between 0 (not relevant) and 1 (highly relevant) as a JSON array of objects with 'index' and 'score'.\n\nQuery: ${query}\n\nChunks:\n${xmlChunks}\n\n`;

    // Use generateObject with OpenAI model
    const { object } = await generateObject({
      model: this.llm,
      schema,
      prompt,
      temperature: 0.2,
    });

    // Filter and sort by score
    const filtered = object.scores
      .filter(
        (item: { index: number; score: number }) => item.score >= threshold
      )
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score);
    const result = filtered.map((item: { index: number }) => nodes[item.index]);

    console.log(
      `Reranked ${nodes.length} nodes to ${result.length} based on threshold ${threshold}`
    );

    return result;
  }
}
