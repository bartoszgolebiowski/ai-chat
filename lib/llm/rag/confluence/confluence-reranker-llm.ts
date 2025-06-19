import { LLM } from "@/lib/models/llm";
import { generateObject } from "ai";
import { MetadataMode, NodeWithScore } from "llamaindex";
import { z } from "zod";

export class ConfluenceLlmReranker {
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

    // Polish prompt
    const prompt = `Jesteś ekspertem asystującym przy analizie dokumentów. Otrzymujesz zapytanie użytkownika oraz zestaw fragmentów dokumentów. Twoim zadaniem jest ocenić, na ile każdy fragment jest powiązany (może dostarczyć istotnego kontekstu) z zapytaniem. Każdy fragment jest przedstawiony w formacie XML z nazwą pliku i treścią. Dla każdego fragmentu zwróć ocenę od 0 (nieistotny) do 1 (bardzo istotny) jako tablicę JSON obiektów z polami 'index' i 'score'.\n\nZapytanie: ${query}\n\nFragmenty:\n${xmlChunks}\n\n`;

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
