import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import { pineconeStore } from "../rag/pineconeStore"
import { openai } from "@ai-sdk/openai"
import { embed } from "ai"
import "dotenv/config"
export const ragKnowledgeTool = createTool({
  id: "rag-knowledge-query",
  description: "Search through product management knowledge base using RAG",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
    topK: z
      .number()
      .optional()
      .default(3)
      .describe("Number of results to return"),
    namespace: z
      .string()
      .optional()
      .describe("Pinecone namespace to search in"),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        id: z.string(),
        score: z.number(),
        content: z.string(),
        metadata: z.record(z.any()),
      })
    ),
    summary: z.string().describe("Summary of the retrieved knowledge"),
  }),
  execute: async ({ context }) => {
    const { query, topK, namespace } = context
    const indexName =
      process.env.PINECONE_INDEX_NAME || "product-maestro-knowledge"

    try {
      // Generate embedding for the query
      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: query,
      })

      // Search Pinecone for similar content
      const searchResults = await pineconeStore.query({
        indexName,
        queryVector: embedding,
        topK,
        namespace,
      })

      // Transform results
      const results = searchResults.map(result => ({
        id: result.id,
        score: result.score,
        content: result.metadata?.content || result.metadata?.text || "",
        metadata: result.metadata || {},
      }))

      // Create a summary of the retrieved content
      const summary =
        results.length > 0
          ? `Found ${
              results.length
            } relevant knowledge items about "${query}". Top result has ${Math.round(
              results[0].score * 100
            )}% relevance.`
          : `No relevant knowledge found for "${query}".`

      return {
        results,
        summary,
      }
    } catch (error) {
      console.error("RAG Knowledge Tool Error:", error)
      return {
        results: [],
        summary: `Error searching knowledge base: ${error.message}`,
      }
    }
  },
})
