import { EngineResponse, NodeWithScore } from "llamaindex";

export interface GenerateResponseInput {
  query: string;
  nodes: NodeWithScore[];
}

export interface Source {
  id: string;
  sourceType: "url";
  title: string;
  url: string;
}

export interface StreamingResponseResult {
  sources: Source[];
  stream: AsyncIterable<EngineResponse>;
}

export class ResponseSources {
  /**
   * Extract sources from nodes
   */
  public static extractSources(nodes: NodeWithScore[]): Source[] {
    return nodes.map((node) => {
      const id = node.node.id_;
      const fileName = node.node.metadata.filename || "Unknown";

      return {
        id,
        sourceType: "url" as const,
        title: ResponseSources.extractTitle(fileName),
        url: ResponseSources.extractURL(fileName),
      };
    });
  }

  private static extractTitle(fileName: string): string {
    const match = fileName.match(/^(.*?)(?:_\d+)?\.md$/);
    if (match) {
      return match[1].replace(/-/g, " ").trim();
    }

    // Jeśli nie ma podkreślenia, zwróć cały fileName bez rozszerzenia
    const matchWithoutUnderscore = fileName.match(/^(\d+)\.md$/);
    if (matchWithoutUnderscore) {
      return matchWithoutUnderscore[1];
    }

    return fileName.replace(/\.md$/, "").replace(/-/g, " ").trim();
  }

  /**
   * Extract URL from file name
   */
  private static extractURL(fileName: string): string {
    const id = ResponseSources.extractIdFromPageId(fileName);
    return `https://connect.ttpsc.com/confluence/spaces/TTPSC/pages/${id}`;
  }

  private static extractIdFromPageId(pageId: string): string {
    const match = pageId.match(/_(\d+)\.md$/);
    if (match) {
      return match[1];
    }
    // Jeśli nie ma podkreślenia, zwróć cały pageId bez rozszerzenia
    const matchWithoutUnderscore = pageId.match(/(\d+)\.md$/);
    if (matchWithoutUnderscore) {
      return matchWithoutUnderscore[1];
    }

    // Jeśli nie ma dopasowania, zwróć oryginalny pageId bez rozszerzenia
    return pageId.replace(/\.md$/, "");
  }
}
