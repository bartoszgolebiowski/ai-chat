import { ContextOnlyStrategy } from "../../../llm/rag/confluence/strategies/ContextOnlyStrategy";
import { ragContextManager } from "./rag-context-manager";
export { ContextOnlyStrategy };

// A real RagContextManager instance must be provided in your DI setup.
export const contextOnlyStrategy = new ContextOnlyStrategy(
  ragContextManager
);
