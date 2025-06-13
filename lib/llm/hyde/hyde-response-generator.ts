import { MetadataMode, SimpleChatEngine } from "llamaindex";
import { ResponseGeneratorBase } from "../ResponseGeneratorBase";

export class HyDEResponseGenerator extends ResponseGeneratorBase {
  private static readonly SYSTEM_PROMPT = `
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

  constructor(private chatEngine: SimpleChatEngine) {
    super();
  }

  async generateStreamingResponse(
    input: Parameters<ResponseGeneratorBase["generateStreamingResponse"]>[0]
  ): ReturnType<ResponseGeneratorBase["generateStreamingResponse"]> {
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
   * Build contextual prompt with documents
   */
  protected buildContextualPrompt(query: string, documents: string[]): string {
    return `
${HyDEResponseGenerator.SYSTEM_PROMPT}

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
