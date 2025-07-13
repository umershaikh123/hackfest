// src/mastra/tools/ragKnowledgeTool.ts
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
      const summary = await generateKnowledgeSummary(query, results)
      const suggestions = generateActionableSuggestions(query, results)

      return {
        results,
        summary,
        suggestions,
      }
    } catch (error) {
      console.error("RAG Knowledge Tool Error:", error)
      return {
        results: [],
        summary: `Error searching knowledge base: ${error}`,
      }
    }
  },
})

async function generateKnowledgeSummary(
  query: string,
  results: any[]
): Promise<string> {
  if (results.length === 0) {
    return `No specific knowledge found for "${query}". Consider adding relevant content to the knowledge base.`
  }

  // Combine the top results
  const combinedContent = results
    .slice(0, 3)
    .map(result => `${result.title}: ${result.content}`)
    .join("\n\n")

  // Create a simple summary
  const wordCount = combinedContent.split(" ").length
  if (wordCount > 100) {
    // For longer content, provide a structured summary
    return `Based on ${
      results.length
    } relevant documents, here are the key insights for "${query}":

${results[0].title}: ${results[0].content.substring(0, 200)}...

This knowledge can help guide your decision-making and ensure you're following established best practices.`
  } else {
    // For shorter content, return as-is
    return combinedContent
  }
}

// Helper function to generate actionable suggestions
function generateActionableSuggestions(
  query: string,
  results: any[]
): string[] {
  const suggestions: string[] = []

  if (results.length === 0) {
    return [
      "Research industry best practices for this topic",
      "Consult with experienced practitioners",
      "Document learnings for future reference",
    ]
  }

  // Generate suggestions based on query type
  const queryLower = query.toLowerCase()

  if (queryLower.includes("persona") || queryLower.includes("user")) {
    suggestions.push(
      "Create detailed user personas based on real data",
      "Validate personas through user interviews",
      "Use personas to guide feature prioritization"
    )
  }

  if (queryLower.includes("story") || queryLower.includes("requirement")) {
    suggestions.push(
      "Write user stories in the standard format",
      "Include detailed acceptance criteria",
      "Prioritize stories based on user value"
    )
  }

  if (queryLower.includes("mvp") || queryLower.includes("minimum")) {
    suggestions.push(
      "Focus on core value proposition for MVP",
      "Limit initial features to essentials",
      "Plan for rapid iteration based on feedback"
    )
  }

  if (queryLower.includes("priorit") || queryLower.includes("backlog")) {
    suggestions.push(
      "Use frameworks like RICE or MoSCoW for prioritization",
      "Consider both user value and technical complexity",
      "Review priorities regularly as you learn more"
    )
  }

  // Add generic suggestions based on knowledge base content
  results.forEach(result => {
    if (result.category === "user-personas") {
      suggestions.push(
        "Apply user persona best practices from the knowledge base"
      )
    }
    if (result.category === "prd-templates") {
      suggestions.push("Use the PRD template structure for documentation")
    }
    if (result.category === "prioritization") {
      suggestions.push(
        "Apply prioritization frameworks from the knowledge base"
      )
    }
  })

  // Remove duplicates and limit to 5 suggestions
  return [...new Set(suggestions)].slice(0, 5)
}

// Test function for the RAG tool
export async function testRAGKnowledgeTool() {
  console.log("🧠 Testing RAG Knowledge Tool")

  const testQueries = [
    "user persona best practices",
    "how to write effective user stories",
    "MVP strategy and planning",
    "prioritization frameworks for product management",
  ]

  for (const query of testQueries) {
    console.log(`\n📋 Testing query: "${query}"`)

    try {
      const result = await ragKnowledgeTool.execute({
        context: { query, topK: 3 },
        runtimeContext: {} as any,
      })

      console.log(`✅ Found ${result.results.length} results`)
      console.log(`📄 Summary: ${result.summary.substring(0, 100)}...`)
    } catch (error) {
      console.log(`❌ Query failed: ${error}`)
    }
  }

  return "RAG Knowledge Tool test completed"
}
