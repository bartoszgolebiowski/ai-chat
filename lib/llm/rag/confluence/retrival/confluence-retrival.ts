import { NodeWithScore } from "llamaindex";
import { ConfluenceRagEngineParams } from "../confluence-rag-engine";
import { IConfluenceRetrievalStrategy } from "./confluence-retrieval-strategy.interface";

export class ConfluenceRetrival {
  private strategies: Record<string, IConfluenceRetrievalStrategy> = {};

  constructor() {}

  registerStrategy(name: string, strategy: IConfluenceRetrievalStrategy) {
    this.strategies[name] = strategy;
  }

  async retrieve(
    query: string,
    options: ConfluenceRagEngineParams = {}
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
