import { embed, generateText } from "ai";
import { EmbeddingModel } from "../models/embedded";
import { LLM } from "../models/llm";
import { FileCache } from "../utils/cache";

interface HyDEOptions {
  maxTokens?: number;
  temperature?: number;
  documentType?: "general" | "technical" | "business" | "confluence";
}

interface HyDEResult {
  originalQuery: string;
  hypotheticalDocument: string;
  optimizedEmbedding: number[];
}

export class HyDEQueryTransformer {
  private cache = new FileCache<HyDEResult>("hyde-cache");

  constructor(private llm: LLM, private embeddingModel: EmbeddingModel) {}

  /**
   * Transforms a user query using HyDE approach
   */
  async transformQuery(
    query: string,
    options: HyDEOptions = {}
  ): Promise<HyDEResult> {
    const {
      maxTokens = 500,
      temperature = 0.7,
      documentType = "general",
    } = options;

    // Create cache key from query and options
    const cacheKey = this.createCacheKey(query, options);

    // Try to get from cache first
    const cachedResult = await this.cache.get(cacheKey);
    if (cachedResult) {
      console.log(
        "HyDE cache hit for query:",
        query.substring(0, 50) + "..."
      );
      return cachedResult;
    }

    console.log(
      "HyDE cache miss, generating new document for query:",
      query.substring(0, 50) + "..."
    );

    const hypotheticalDocument = await this.generateHypotheticalDocument(
      query,
      { maxTokens, temperature, documentType }
    );

    // Step 2: Create embedding of the hypothetical document (optional)
    const optimizedEmbedding = await this.createEmbedding(hypotheticalDocument);

    const result: HyDEResult = {
      originalQuery: query,
      hypotheticalDocument,
      optimizedEmbedding,
    };

    // Cache the result (TTL: 24 hours)
    await this.cache.set(cacheKey, result, 24 * 60 * 60 * 1000);

    return result;
  }

  /**
   * Creates a cache key from query and options
   */
  private createCacheKey(query: string, options: HyDEOptions): string {
    const normalizedOptions = {
      maxTokens: options.maxTokens || 500,
      temperature: options.temperature || 0.7,
      documentType: options.documentType || "general",
    };

    return `${query}|${JSON.stringify(normalizedOptions)}`;
  }

  /**
   * Clear the cache
   */
  async clearCache(): Promise<void> {
    await this.cache.clear();
  }

  /**
   * Generates a hypothetical document that answers the query
   */
  private async generateHypotheticalDocument(
    query: string,
    options: Pick<HyDEOptions, "maxTokens" | "temperature" | "documentType">
  ): Promise<string> {
    const {
      maxTokens = 500,
      temperature = 0.7,
      documentType = "general",
    } = options;

    const prompt = this.buildPrompt(query, documentType);

    const { text } = await generateText({
      model: this.llm,
      prompt,
      maxTokens,
      temperature,
    });

    return text;
  }

  /**
   * Creates embedding for the given text
   */
  private async createEmbedding(text: string): Promise<number[]> {
    const { embedding } = await embed({
      model: this.embeddingModel,
      value: text,
    });

    return embedding;
  }

  /**
   * Builds the prompt for generating hypothetical document
   */
  private buildPrompt(
    query: string,
    documentType: HyDEOptions["documentType"]
  ): string {
    const prompts = {
      general: `
Napisz szczegółowy, informatywny dokument, który odpowiada na następujące pytanie lub temat.
Dokument powinien być napisany w stylu artykułu eksperckiego, zawierającym konkretne informacje i przykłady.

Pytanie/Temat: ${query}

Napisz dokument, który:
1. Bezpośrednio odpowiada na pytanie
2. Zawiera konkretne informacje i szczegóły
3. Jest napisany w profesjonalnym stylu
4. Obejmuje kluczowe aspekty tematu
5. Jest napisany w języku polskim

Dokument:`,

      technical: `
Napisz szczegółowy dokument techniczny, który odpowiada na następujące pytanie.
Dokument powinien zawierać konkretne informacje techniczne, przykłady kodu (jeśli dotyczy) i najlepsze praktyki.

Pytanie: ${query}

Napisz dokument techniczny, który:
1. Zawiera szczegółowe wyjaśnienie technicznej koncepcji
2. Podaje konkretne przykłady implementacji
3. Opisuje najlepsze praktyki
4. Wymienia potencjalne problemy i rozwiązania
5. Jest napisany w języku polskim

Dokument:`,

      business: `
Napisz dokument biznesowy, który odpowiada na następujące pytanie lub zagadnienie.
Dokument powinien być napisany z perspektywy biznesowej, zawierając praktyczne informacje i rekomendacje.

Pytanie/Zagadnienie: ${query}

Napisz dokument biznesowy, który:
1. Analizuje zagadnienie z perspektywy biznesowej
2. Zawiera praktyczne rekomendacje
3. Opisuje korzyści i wyzwania
4. Podaje konkretne przykłady i przypadki użycia
5. Jest napisany w języku polskim

Dokument:`,

      confluence: `
Napisz dokument w stylu dokumentacji Confluence, który odpowiada na następujące pytanie.
Dokument powinien być strukturalny, jasny i zawierać praktyczne informacje.

Pytanie: ${query}

Napisz dokument Confluence, który:
1. Ma jasną strukturę z nagłówkami
2. Zawiera praktyczne instrukcje i przykłady
3. Jest napisany w stylu dokumentacji korporacyjnej
4. Obejmuje najważniejsze informacje na temat
5. Jest napisany w języku polskim

Dokument:`,
    };

    if (!documentType) {
      return prompts["general"];
    }
    return prompts[documentType];
  }
}
