import { createVectorQueryTool } from "@mastra/rag"
import { openai } from "@ai-sdk/openai"
import { PINECONE_PROMPT } from "@mastra/pinecone"
import { Agent } from "@mastra/core/agent"
import "dotenv/config"
export const vectorQueryTool = createVectorQueryTool({
  vectorStoreName: "pinecone",
  indexName: process.env.PINECONE_INDEX_NAME || "product-maestro-knowledge",
  model: openai.embedding("text-embedding-3-small"),
  databaseConfig: {
    pinecone: {
      namespace: "default", // Use namespaces to organize your data
    },
  },
})

// 6. Example agent with vector query tool
export const ragAgent = new Agent({
  name: "Product Management RAG Agent",
  model: openai("gpt-4o-mini"),
  instructions: `
    You are a product management expert with access to a comprehensive knowledge base.
    
    Use the vector query tool to search for relevant information when users ask about:
    - User personas and customer research
    - Product requirements and PRDs
    - Prioritization frameworks like RICE
    - MVP strategy and development
    - Agile methodologies
    - Product management best practices
    
    Always search the knowledge base first, then provide detailed, actionable advice based on the retrieved information.
    
    ${PINECONE_PROMPT}
  `,
  tools: { vectorQueryTool },
})
