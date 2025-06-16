import { NodeWithScore } from "llamaindex";
import { EnhancedPDFRagOptions } from "../engine";

export interface IPDFRagStrategy {
  run({
    query,
    options,
  }: {
    query: string;
    options: EnhancedPDFRagOptions;
  }): Promise<{ nodes: NodeWithScore[] }>;
}
