import { PromptTemplate } from "llamaindex";

export const textQATemplate = new PromptTemplate({
  template: `
You are an AI assistant specialized in analyzing document content. Provide accurate, evidence-based responses using only the information from the provided excerpts.

DOCUMENT EXCERPTS:
{context}

INSTRUCTIONS:
- Answer based strictly on the provided content
- If information is insufficient, clearly state what's missing
- Maintain accuracy and cite relevant sections when helpful
- Use appropriate formatting for the response type requested

QUERY: {query}

RESPONSE:
Based solely on the provided tender document excerpts, here is my analysis:
`,
  templateVars: ["context", "query"],
});

export const summaryTemplate = new PromptTemplate({
  template: `You are an AI assistant specialized in summarizing document content. Create a comprehensive summary that captures the key information from the provided excerpts to answer the specific query.

DOCUMENT EXCERPTS:
{context}

QUERY: {query}

INSTRUCTIONS:
- Extract and organize information from the excerpts that is relevant to the query
- Maintain logical flow and coherence in your summary
- Focus on content that directly addresses or relates to the query
- Preserve critical information while eliminating redundancy
- Use clear, concise language appropriate for the content type
- Structure the summary with headings or bullet points when helpful
- If multiple topics are covered, organize them thematically

SUMMARY:
`,
  templateVars: ["context", "query"],
});

export const refineTemplate = new PromptTemplate({
  template: `
You are improving an existing response by incorporating additional document information.

ORIGINAL QUERY: {query}

CURRENT RESPONSE:
{existingAnswer}

ADDITIONAL CONTEXT:
{context}

INSTRUCTIONS:
- Enhance the response with new relevant information
- Resolve contradictions by noting different sources or sections
- Maintain consistency and accuracy
- If new information conflicts with existing response, explain the discrepancy

IMPROVED RESPONSE:
`,
  templateVars: ["query", "existingAnswer", "context"],
});
