import { embed } from "ai";
import { MetadataMode, NodeWithScore } from "llamaindex";
import { EmbeddingModel } from "../models/embedded";

interface RerankingOptions {
  strategy?: "semantic" | "hybrid";
  topK?: number;
  semanticWeight?: number;
}

interface RerankingResult {
  nodes: NodeWithScore[];
  originalCount: number;
  rerankedCount: number;
  strategy: string;
}

export class Reranker {
  constructor(private embeddingModel: EmbeddingModel) {}

  /**
   * Rerank nodes based on the selected strategy
   */
  async rerank(
    query: string,
    nodes: NodeWithScore[],
    options: RerankingOptions = {}
  ): Promise<RerankingResult> {
    const {
      strategy = "hybrid", // Default to hybrid reranking
      topK = nodes.length,
      semanticWeight = 0.7,
    } = options;

    console.log(`Reranking ${nodes.length} nodes using ${strategy} strategy`);

    let rerankedNodes: NodeWithScore[];

    switch (strategy) {
      case "semantic":
        rerankedNodes = await this.semanticRerank(query, nodes);
        break;
      case "hybrid":
        rerankedNodes = await this.hybridRerank(query, nodes, semanticWeight);
        break;
      default:
        rerankedNodes = nodes;
    }

    // Apply topK filtering
    const finalNodes = rerankedNodes.slice(0, topK);

    return {
      nodes: finalNodes,
      originalCount: nodes.length,
      rerankedCount: finalNodes.length,
      strategy,
    };
  }

  async contextAwareRerank(
    query: string,
    nodes: NodeWithScore[],
    contextNodeCount: number,
    options: {
      strategy: "semantic" | "hybrid";
      topK: number;
      contextWeightFactor: number;
    }
  ): Promise<{ nodes: NodeWithScore[] }> {
    const weightedNodes = nodes.map((node, index) => {
      if (index < contextNodeCount) {
        return {
          ...node,
          score: (node.score || 0) * options.contextWeightFactor,
        };
      }
      return node;
    });
    const rerankResult = await this.rerank(query, weightedNodes, {
      strategy: options.strategy,
      topK: options.topK,
    });
    return { nodes: rerankResult.nodes };
  }

  /**
   * Rerank based on semantic similarity using embeddings
   */
  private async semanticRerank(
    query: string,
    nodes: NodeWithScore[]
  ): Promise<NodeWithScore[]> {
    // Get query embedding
    const { embedding: queryEmbedding } = await embed({
      model: this.embeddingModel,
      value: query,
    });

    // Extract all content and create embedding promises in parallel
    const contents = nodes.map((nodeWithScore) =>
      nodeWithScore.node.getContent(MetadataMode.NONE)
    );

    // Get all content embeddings in parallel
    const contentEmbeddings = await Promise.all(
      contents.map((content) =>
        embed({
          model: this.embeddingModel,
          value: content,
        })
      )
    );

    // Calculate similarities and create reranked nodes
    const nodesWithSimilarity = nodes.map((nodeWithScore, index) => {
      const similarity = this.cosineSimilarity(
        queryEmbedding,
        contentEmbeddings[index].embedding
      );

      return {
        ...nodeWithScore,
        score: similarity,
      };
    });

    // Sort by similarity score (descending)
    return nodesWithSimilarity.sort((a, b) => b.score - a.score);
  }

  /**
   * Hybrid reranking combining semantic similarity and original retrieval scores
   */
  private async hybridRerank(
    query: string,
    nodes: NodeWithScore[],
    semanticWeight: number
  ): Promise<NodeWithScore[]> {
    // Get semantic scores
    const semanticRanked = await this.semanticRerank(query, nodes);

    // Create score maps
    const semanticScores = new Map<string, number>();
    const originalScores = new Map<string, number>();

    semanticRanked.forEach((node, index) => {
      semanticScores.set(node.node.id_, 1 - index / semanticRanked.length);
    });

    nodes.forEach((node) => {
      originalScores.set(node.node.id_, node.score || 0);
    });

    // Combine scores
    const hybridScored = nodes.map((nodeWithScore) => {
      const semanticScore = semanticScores.get(nodeWithScore.node.id_) || 0;
      const originalScore = originalScores.get(nodeWithScore.node.id_) || 0;

      const hybridScore =
        semanticWeight * semanticScore + (1 - semanticWeight) * originalScore;

      return {
        ...nodeWithScore,
        score: hybridScore,
      };
    });

    // Sort by hybrid score (descending)
    return hybridScored.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error("Vectors must have the same length");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }
}
