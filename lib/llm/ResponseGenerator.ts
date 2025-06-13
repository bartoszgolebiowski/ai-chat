import { MetadataMode, NodeWithScore, SimpleChatEngine } from "llamaindex";

interface GenerateResponseInput {
  query: string;
  nodes: NodeWithScore[];
}

export class ResponseGenerator {
  constructor(private chatEngine: SimpleChatEngine) {}

  /**
   * Generate a streaming response
   */
  async generateStreamingResponse(input: GenerateResponseInput) {
    const { query, nodes } = input;

    const contents = nodes.map((node) =>
      node.node.getContent(MetadataMode.NONE)
    );

    const contextualPrompt = this.buildContextualPrompt(query, contents);

    return {
      sources: this.extractSources(nodes),
      stream: await this.chatEngine.chat({
        message: contextualPrompt,
        stream: true,
      }),
    };
  }

  /**
   * Extract sources from nodes
   */
  private extractSources(nodes: NodeWithScore[]) {
    return nodes.map((node) => {
      const id = node.node.id_;
      const fileName = node.node.metadata.filename || "Unknown";

      return {
        id,
        sourceType: "url" as const,
        title: this.extractTitle(fileName),
        url: this.extractURL(fileName),
      };
    });
  }

  private extractTitle(fileName: string): string {
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
  private extractURL(fileName: string): string {
    const id = this.extractIdFromPageId(fileName);
    return `https://connect.ttpsc.com/confluence/spaces/TTPSC/pages/${id}`;
  }

  private extractIdFromPageId(pageId: string): string {
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

  /**
   * Get default system prompt
   */
  private getDefaultSystemPrompt(): string {
    return `
Jesteś asystentem, który odpowiada na pytania na podstawie dostarczonych dokumentów. 

<zadanie>
1. Przeanalizuj pytanie i dostarczone dokumenty
2. Jeśli znajdziesz odpowiedź w dokumentach, udziel zwięzłej i precyzyjnej odpowiedzi
3. Odpowiadaj tylko na podstawie dostarczonych dokumentów, nie wymyślaj dodatkowych informacji
4. Jeżeli odpowiedź nie jest zawarta bezpośrednio w dokumentach, poinformuj użytkownika, że nie znalazłeś odpowiedzi
5. Jeżeli jesteś w stanie za pomocą dedukcji dojść do odpowiedzi, to ją podaj
6. Jeżeli nie jesteś w stanie za pomocą dedukcji dojść do odpowiedzi, to poinformuj użytkownika, że nie znalazłeś odpowiedzi
</zadanie>

Odpowiadaj krótko i rzeczowo w języku polskim.
`;
  }

  /**
   * Build contextual prompt with documents
   */
  private buildContextualPrompt(query: string, documents: string[]): string {
    return `
${this.getDefaultSystemPrompt()}

<pytanie> 
${query}
</pytanie>

<dokumenty>
${documents.join("\n\n")}
</dokumenty>

Na podstawie powyższych dokumentów odpowiedz na pytanie.
`;
  }
}
