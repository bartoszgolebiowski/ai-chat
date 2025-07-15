import { BaseNodePostprocessor, NodeWithScore } from "llamaindex";

interface DynamicSimilarityOptions {
  similarityCutoff?: number;
  minNodes?: number;
  maxNodes?: number;
  scoreThresholds?: {
    high: number; // Score threshold for high quality matches
    medium: number; // Score threshold for medium quality matches
    low: number; // Score threshold for low quality matches
  };
  nodeQuantities?: {
    high: number; // Number of nodes to take for high quality matches
    medium: number; // Number of nodes to take for medium quality matches
    low: number; // Number of nodes to take for low quality matches
  };
}

export class SimilarityPostprocessor implements BaseNodePostprocessor {
  similarityCutoff?: number;
  minNodes: number;
  maxNodes: number;
  scoreThresholds: {
    high: number;
    medium: number;
    low: number;
  };
  nodeQuantities: {
    high: number;
    medium: number;
    low: number;
  };

  constructor(options?: DynamicSimilarityOptions) {
    this.similarityCutoff = options?.similarityCutoff;
    this.minNodes = options?.minNodes ?? 2;
    this.maxNodes = options?.maxNodes ?? 20;

    // Default score thresholds (assuming scores are between 0 and 1)
    this.scoreThresholds = {
      high: options?.scoreThresholds?.high ?? 0.8,
      medium: options?.scoreThresholds?.medium ?? 0.6,
      low: options?.scoreThresholds?.low ?? 0.4,
      ...options?.scoreThresholds,
    };

    // Default node quantities for each quality tier
    this.nodeQuantities = {
      high: options?.nodeQuantities?.high ?? 15,
      medium: options?.nodeQuantities?.medium ?? 8,
      low: options?.nodeQuantities?.low ?? 3,
      ...options?.nodeQuantities,
    };
  }

  async postprocessNodes(nodes: NodeWithScore[]) {
    if (!nodes.length) return nodes;

    // Sort nodes by score in descending order
    const sortedNodes = nodes
      .filter((node) => node.score !== undefined && node.score !== null)
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    if (!sortedNodes.length) return nodes;

    // Apply basic similarity cutoff if specified
    const filteredNodes =
      this.similarityCutoff !== undefined
        ? sortedNodes.filter(
            (node) => (node.score || 0) >= this.similarityCutoff!
          )
        : sortedNodes;

    if (!filteredNodes.length) return [];

    // Determine dynamic quantity based on the highest score
    const maxScore = filteredNodes[0].score || 0;
    const dynamicQuantity = this.calculateDynamicQuantity(
      maxScore,
      filteredNodes
    );

    // Take the calculated number of nodes, respecting min/max bounds
    const finalQuantity = Math.min(
      Math.max(dynamicQuantity, this.minNodes),
      this.maxNodes,
      filteredNodes.length
    );

    const result = filteredNodes.slice(0, finalQuantity);
    console.log(`Selected ${result.length} nodes based on dynamic scoring strategy.`);
    console.log(`Max score: ${maxScore}, Dynamic quantity: ${dynamicQuantity}`);
    console.log(`Score thresholds: ${JSON.stringify(this.scoreThresholds)}`);
    console.log(`Node quantities: ${JSON.stringify(this.nodeQuantities)}`);
    return result;
  }

  private calculateDynamicQuantity(
    maxScore: number,
    nodes: NodeWithScore[]
  ): number {
    // Strategy 1: Base quantity on the highest score
    let baseQuantity: number;

    if (maxScore >= this.scoreThresholds.high) {
      baseQuantity = this.nodeQuantities.high;
    } else if (maxScore >= this.scoreThresholds.medium) {
      baseQuantity = this.nodeQuantities.medium;
    } else if (maxScore >= this.scoreThresholds.low) {
      baseQuantity = this.nodeQuantities.low;
    } else {
      // Very low scores - take minimal nodes
      return this.minNodes;
    }

    // Strategy 2: Adjust based on score distribution
    const adjustmentFactor = this.calculateScoreDistributionFactor(nodes);

    // Strategy 3: Apply adjustment
    return Math.round(baseQuantity * adjustmentFactor);
  }

  private calculateScoreDistributionFactor(nodes: NodeWithScore[]): number {
    if (nodes.length < 2) return 1.0;

    const scores = nodes.map((node) => node.score || 0);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const avgScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Calculate how many nodes have high scores (within 10% of max score)
    const highScoreThreshold = maxScore * 0.9;
    const highScoreCount = scores.filter(
      (score) => score >= highScoreThreshold
    ).length;
    const highScoreRatio = highScoreCount / nodes.length;

    // Calculate score variance (normalized)
    const scoreRange = maxScore - minScore;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) /
      scores.length;
    const normalizedVariance =
      scoreRange > 0 ? Math.sqrt(variance) / scoreRange : 0;

    // Adjustment factors:
    // 1. More high-scoring nodes -> take more nodes (up to 1.5x)
    const highScoreAdjustment = 0.8 + highScoreRatio * 0.7;

    // 2. Higher variance -> take fewer nodes (concentration on best matches)
    const varianceAdjustment = 1.2 - normalizedVariance * 0.4;

    // 3. Higher average score -> slight increase in nodes
    const avgScoreAdjustment = 0.9 + avgScore * 0.2;

    // Combine adjustments with weights
    const combinedFactor =
      highScoreAdjustment * 0.5 +
      varianceAdjustment * 0.3 +
      avgScoreAdjustment * 0.2;

    // Clamp the factor between 0.3 and 2.0 to avoid extreme values
    return Math.max(0.3, Math.min(2.0, combinedFactor));
  }
}

export const similarityPostprocessor = new SimilarityPostprocessor();
