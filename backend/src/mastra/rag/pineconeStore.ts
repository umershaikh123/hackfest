import { PineconeVector } from "@mastra/pinecone"
import "dotenv/config"
// Create Pinecone instance for RAG operations
export const pineconeStore = new PineconeVector({
  apiKey: process.env.PINECONE_API_KEY!,
  // Note: Remove 'environment' parameter - it's deprecated in newer versions
})

// Initialize index if it doesn't exist
export async function initializePineconeIndex() {
  const indexName =
    process.env.PINECONE_INDEX_NAME || "product-maestro-knowledge"

  try {
    // Check if index exists
    const indexes = await pineconeStore.listIndexes()
    console.log("Available indexes:", indexes)

    if (!indexes.includes(indexName)) {
      console.log(`🔧 Creating Pinecone index: ${indexName}`)

      // Create index with proper dimensions for text-embedding-3-small (1536 dimensions)
      await pineconeStore.createIndex({
        indexName,
        dimension: 1536, // OpenAI text-embedding-3-small dimensions
        metric: "cosine", // Use cosine for semantic similarity
      })

      console.log(`✅ Created Pinecone index: ${indexName}`)

      // Wait a bit for index to be ready
      console.log("⏳ Waiting for index to be ready...")
      await new Promise(resolve => setTimeout(resolve, 10000))
    } else {
      console.log(`✅ Pinecone index already exists: ${indexName}`)
    }
  } catch (error) {
    console.error(`❌ Error initializing Pinecone index:`, error)
    throw error
  }
}
