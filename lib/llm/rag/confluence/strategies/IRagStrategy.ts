import { NodeWithScore } from "llamaindex";
import { EnhancedRagOptions } from "../engine";

export interface IRagStrategy {
  run(params: {
    query: string;
    options: EnhancedRagOptions;
  }): Promise<{ nodes: NodeWithScore[] }>;
}
