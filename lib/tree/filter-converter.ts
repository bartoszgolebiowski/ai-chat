import { MetadataFilters } from "llamaindex";

/**
 * Converts an array of filenames into MetadataFilters for RAG queries
 * @param filenames Array of filenames to filter by
 * @returns MetadataFilters object or undefined if no filenames provided
 */
export function createFilenameFilters(
  filenames: string[]
): MetadataFilters | undefined {
  if (!filenames || filenames.length === 0) {
    return undefined;
  }

  // If only one filename, use exact match
  if (filenames.length === 1) {
    return {
      filters: [
        {
          key: "filename",
          value: filenames[0],
          operator: "==", // Ensure type is ExactMatch
        },
      ],
      condition: "or",
    };
  }

  // For multiple filenames, use OR condition
  return {
    filters: filenames.map((filename) => ({
      key: "filename",
      value: filename,
      operator: "==", // Ensure type is ExactMatch
    })),

    condition: "or",
  };
}
