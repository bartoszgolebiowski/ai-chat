import { MetadataFilters, VectorStoreIndex } from "llamaindex";

export const createRetriever = (
  index: VectorStoreIndex,
  similarityTopK: number,
  filters: MetadataFilters | undefined,
) =>
  index.asRetriever({
    //@ts-expect-error typescript error
    mode: "hybrid",
    similarityTopK,
    filters,
  });
