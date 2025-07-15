import { NodeWithScore } from "llamaindex";
import { describe, expect, it } from 'vitest';
import { SimilarityPostprocessor } from "./similarity";

// Simplified mock for testing purposes
const createMockNode = (score: number, id: string = `node-${score}`): NodeWithScore => ({
  node: {
    getContent: () => `Content for node ${id}`,
    getMetadata: () => ({}),
  } as any,
  score
});

describe('SimilarityPostprocessor', () => {
  describe('Constructor and Default Values', () => {
    it('should initialize with default values', () => {
      const processor = new SimilarityPostprocessor();
      
      expect(processor.minNodes).toBe(2);
      expect(processor.maxNodes).toBe(20);
      expect(processor.scoreThresholds.high).toBe(0.8);
      expect(processor.scoreThresholds.medium).toBe(0.6);
      expect(processor.scoreThresholds.low).toBe(0.4);
      expect(processor.nodeQuantities.high).toBe(15);
      expect(processor.nodeQuantities.medium).toBe(8);
      expect(processor.nodeQuantities.low).toBe(3);
    });

    it('should accept custom configuration', () => {
      const processor = new SimilarityPostprocessor({
        similarityCutoff: 0.5,
        minNodes: 1,
        maxNodes: 10,
        scoreThresholds: {
          high: 0.9,
          medium: 0.7,
          low: 0.5
        },
        nodeQuantities: {
          high: 8,
          medium: 5,
          low: 2
        }
      });

      expect(processor.similarityCutoff).toBe(0.5);
      expect(processor.minNodes).toBe(1);
      expect(processor.maxNodes).toBe(10);
      expect(processor.scoreThresholds.high).toBe(0.9);
      expect(processor.nodeQuantities.medium).toBe(5);
    });
  });

  describe('Basic Functionality', () => {
    it('should return empty array for empty input', async () => {
      const processor = new SimilarityPostprocessor();
      const result = await processor.postprocessNodes([]);
      expect(result).toEqual([]);
    });

    it('should filter nodes without scores', async () => {
      const processor = new SimilarityPostprocessor();
      const nodes = [
        createMockNode(0.9),
        { ...createMockNode(0.8), score: undefined },
        createMockNode(0.6)
      ];

      const result = await processor.postprocessNodes(nodes);
      expect(result).toHaveLength(2);
      expect(result[0].score).toBe(0.9);
      expect(result[1].score).toBe(0.6);
    });

    it('should sort nodes by score in descending order', async () => {
      const processor = new SimilarityPostprocessor();
      const nodes = [
        createMockNode(0.5),
        createMockNode(0.9),
        createMockNode(0.3),
        createMockNode(0.7)
      ];

      const result = await processor.postprocessNodes(nodes);
      expect(result[0].score).toBe(0.9);
      expect(result[1].score).toBe(0.7);
      expect(result[2].score).toBe(0.5);
      expect(result[3].score).toBe(0.3);
    });
  });

  describe('Similarity Cutoff', () => {
    it('should apply similarity cutoff', async () => {
      const processor = new SimilarityPostprocessor({ similarityCutoff: 0.6 });
      const nodes = [
        createMockNode(0.9),
        createMockNode(0.7),
        createMockNode(0.5),
        createMockNode(0.3)
      ];

      const result = await processor.postprocessNodes(nodes);
      expect(result).toHaveLength(2);
      expect(result[0].score).toBe(0.9);
      expect(result[1].score).toBe(0.7);
    });

    it('should return empty array when no nodes meet cutoff', async () => {
      const processor = new SimilarityPostprocessor({ similarityCutoff: 0.8 });
      const nodes = [
        createMockNode(0.5),
        createMockNode(0.3),
        createMockNode(0.1)
      ];

      const result = await processor.postprocessNodes(nodes);
      expect(result).toEqual([]);
    });
  });

  describe('Dynamic Quantity Selection', () => {
    describe('High Score Scenarios', () => {
      it('should take many nodes for high scores', async () => {
        const processor = new SimilarityPostprocessor();
        const nodes = Array.from({ length: 20 }, (_, i) => 
          createMockNode(0.85 + (i * 0.001), `high-${i}`)
        );

        const result = await processor.postprocessNodes(nodes);
        expect(result.length).toBeGreaterThan(10);
        expect(result.length).toBeLessThanOrEqual(20);
      });

      it('should respect maxNodes limit even with high scores', async () => {
        const processor = new SimilarityPostprocessor({ maxNodes: 5 });
        const nodes = Array.from({ length: 20 }, (_, i) => 
          createMockNode(0.9, `high-${i}`)
        );

        const result = await processor.postprocessNodes(nodes);
        expect(result).toHaveLength(5);
      });
    });

    describe('Medium Score Scenarios', () => {
      it('should take moderate nodes for medium scores', async () => {
        const processor = new SimilarityPostprocessor();
        const nodes = Array.from({ length: 15 }, (_, i) => 
          createMockNode(0.65 + (i * 0.001), `medium-${i}`)
        );

        const result = await processor.postprocessNodes(nodes);
        expect(result.length).toBeGreaterThan(5);
        expect(result.length).toBeLessThan(12);
      });
    });

    describe('Low Score Scenarios', () => {
      it('should take few nodes for low scores', async () => {
        const processor = new SimilarityPostprocessor();
        const nodes = Array.from({ length: 10 }, (_, i) => 
          createMockNode(0.45 + (i * 0.001), `low-${i}`)
        );

        const result = await processor.postprocessNodes(nodes);
        expect(result.length).toBeLessThanOrEqual(5);
        expect(result.length).toBeGreaterThanOrEqual(2);
      });

      it('should take minimum nodes for very low scores', async () => {
        const processor = new SimilarityPostprocessor();
        const nodes = Array.from({ length: 10 }, (_, i) => 
          createMockNode(0.2 + (i * 0.001), `verylow-${i}`)
        );

        const result = await processor.postprocessNodes(nodes);
        expect(result).toHaveLength(2); // minNodes
      });
    });

    describe('Mixed Score Scenarios', () => {
      it('should handle mixed quality scores appropriately', async () => {
        const processor = new SimilarityPostprocessor();
        const nodes = [
          createMockNode(0.95, "excellent"),
          createMockNode(0.85, "very-good"),
          createMockNode(0.65, "good"),
          createMockNode(0.45, "ok"),
          createMockNode(0.25, "poor")
        ];

        const result = await processor.postprocessNodes(nodes);
        expect(result.length).toBeGreaterThan(2);
        expect(result[0].score).toBe(0.95); // Best score first
      });
    });
  });

  describe('Min/Max Boundaries', () => {
    it('should respect minNodes boundary', async () => {
      const processor = new SimilarityPostprocessor({ minNodes: 5 });
      const nodes = [createMockNode(0.2)]; // Very low score, single node

      const result = await processor.postprocessNodes(nodes);
      expect(result).toHaveLength(1); // Can't exceed available nodes
    });

    it('should respect maxNodes boundary', async () => {
      const processor = new SimilarityPostprocessor({ maxNodes: 3 });
      const nodes = Array.from({ length: 10 }, (_, i) => 
        createMockNode(0.9, `node-${i}`)
      );

      const result = await processor.postprocessNodes(nodes);
      expect(result).toHaveLength(3);
    });

    it('should handle case where minNodes is larger than available nodes', async () => {
      const processor = new SimilarityPostprocessor({ minNodes: 10 });
      const nodes = [
        createMockNode(0.9),
        createMockNode(0.8),
        createMockNode(0.7)
      ];

      const result = await processor.postprocessNodes(nodes);
      expect(result).toHaveLength(3); // Can't exceed available
    });
  });

  describe('Score Distribution Factor', () => {
    it('should increase nodes when many high scores are present', async () => {
      const processor = new SimilarityPostprocessor();
      
      // All nodes have high scores (concentrated high quality)
      const highQualityNodes = Array.from({ length: 10 }, (_, i) => 
        createMockNode(0.85 + (i * 0.01), `high-${i}`)
      );

      // Mixed quality nodes
      const mixedQualityNodes = [
        createMockNode(0.9),
        createMockNode(0.5),
        createMockNode(0.3),
        createMockNode(0.1)
      ];

      const highQualityResult = await processor.postprocessNodes(highQualityNodes);
      const mixedQualityResult = await processor.postprocessNodes(mixedQualityNodes);

      // High quality should generally return more nodes
      expect(highQualityResult.length).toBeGreaterThanOrEqual(mixedQualityResult.length);
    });

    it('should handle single node case', async () => {
      const processor = new SimilarityPostprocessor();
      const nodes = [createMockNode(0.9)];

      const result = await processor.postprocessNodes(nodes);
      expect(result).toHaveLength(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle all nodes having same score', async () => {
      const processor = new SimilarityPostprocessor();
      const nodes = Array.from({ length: 8 }, (_, i) => 
        createMockNode(0.7, `same-${i}`)
      );

      const result = await processor.postprocessNodes(nodes);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(8);
    });

    it('should handle zero scores', async () => {
      const processor = new SimilarityPostprocessor();
      const nodes = [
        createMockNode(0),
        createMockNode(0),
        createMockNode(0)
      ];

      const result = await processor.postprocessNodes(nodes);
      expect(result).toHaveLength(2); // minNodes
    });

    it('should handle perfect scores', async () => {
      const processor = new SimilarityPostprocessor();
      const nodes = Array.from({ length: 5 }, (_, i) => 
        createMockNode(1.0, `perfect-${i}`)
      );

      const result = await processor.postprocessNodes(nodes);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Integration Scenarios', () => {
    it('should work with realistic RAG retrieval scenario', async () => {
      const processor = new SimilarityPostprocessor({
        similarityCutoff: 0.3,
        minNodes: 3,
        maxNodes: 15,
        scoreThresholds: {
          high: 0.8,
          medium: 0.6,
          low: 0.4
        }
      });

      // Simulate typical RAG retrieval results
      const nodes = [
        createMockNode(0.92, "exact-match"),
        createMockNode(0.87, "very-relevant"),
        createMockNode(0.81, "highly-relevant"),
        createMockNode(0.75, "relevant"),
        createMockNode(0.68, "somewhat-relevant"),
        createMockNode(0.55, "loosely-relevant"),
        createMockNode(0.42, "marginally-relevant"),
        createMockNode(0.35, "barely-relevant"),
        createMockNode(0.28, "not-relevant"), // Below cutoff
        createMockNode(0.15, "irrelevant")    // Below cutoff
      ];

      const result = await processor.postprocessNodes(nodes);
      
      // Should filter out nodes below cutoff
      expect(result.every(node => (node.score || 0) >= 0.3)).toBe(true);
      
      // Should have reasonable number of nodes for high-quality results
      expect(result.length).toBeGreaterThan(5);
      expect(result.length).toBeLessThanOrEqual(15);
      
      // Should be sorted by score
      for (let i = 1; i < result.length; i++) {
        expect(result[i-1].score || 0).toBeGreaterThanOrEqual(result[i].score || 0);
      }
    });
  });
});
