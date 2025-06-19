import { NodeWithScore } from "llamaindex";
import { PdfRagEngineParams } from "../pdf-rag-engine";
import { IPdfRetrievalStrategy } from "./pdf-retrieval-strategy.interface";

export class PdfRetrival {
  private strategies: Record<string, IPdfRetrievalStrategy> = {};

  constructor() {}

  registerStrategy(name: string, strategy: IPdfRetrievalStrategy) {
    this.strategies[name] = strategy;
  }

  async retrieve(
    query: string,
    options: PdfRagEngineParams = {}
  ): Promise<{ nodes: NodeWithScore[] }> {
    const { retrivalStrategy = "new-search" } = options;
    const strategy = this.strategies[retrivalStrategy];
    if (!retrivalStrategy) {
      throw new Error(`Retrival strategy '${retrivalStrategy}' not found.`);
    }
    return strategy.run({
      query,
      options,
    });
  }
}
