import { generateObject } from "ai";
import type { LLM } from "../../../models/llm";
import { DecisionAnalysis, ResponsePlan, ResponsePlanSchema } from "./schemas";

export class ResponsePlanner {
  constructor(private llm: LLM) {}

  async planResponse(
    query: string,
    analysis: DecisionAnalysis
  ): Promise<ResponsePlan> {
    const planningPrompt = `As an expert PDF document analyst, create a detailed response plan.

Query: <query>${query}</query>

Analysis Results: <analysis>${JSON.stringify(analysis, null, 2)}</analysis>

Create a comprehensive response plan considering:

1. Structure Requirements:
   - What components must be included?
   - How should information be organized?
   - What visual elements would enhance understanding?

2. Source Integration:
   - How to balance direct quotes vs synthesis?
   - Where to add contextual information?
   - How to handle citations and references?

3. Confidence Management:
   - Set confidence thresholds for different types of statements
   - Define verification requirements
   - Identify areas needing additional validation

4. Enhancement Opportunities:
   - Additional context needed
   - Explanatory elements to include
   - Supporting evidence requirements

Please provide a structured response plan optimized for PDF-based information retrieval.`;

    const result = await generateObject({
      model: this.llm,
      schema: ResponsePlanSchema,
      prompt: planningPrompt,
      temperature: 0.2,
    });

    return result.object;
  }

  /**
   * Create a simplified plan for quick responses
   */
  createFallbackPlan(): ResponsePlan {
    return {
      requiredComponents: ["main-answer", "sources"],
      sourcingStrategy: "hybrid",
      formatType: "text",
      citationRequirements: true,
      contentStructure: {
        introduction: false,
        mainPoints: ["direct-answer"],
        conclusion: false,
        visualElements: [],
      },
      contextualEnhancements: [],
      confidenceThresholds: {
        factual: 0.7,
        analytical: 0.6,
        inference: 0.5,
      },
    };
  }
}
