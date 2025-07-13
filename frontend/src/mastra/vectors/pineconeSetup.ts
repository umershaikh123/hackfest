import { PineconeVector } from "@mastra/pinecone"
import "dotenv/config"

// Initialize Pinecone store with error handling
export const pineconeStore = new PineconeVector({
  apiKey: process.env.PINECONE_API_KEY!,
  environment: process.env.PINECONE_ENVIRONMENT!,
})

// Initialize index if it doesn't exist
export async function initializePineconeIndex() {
  const indexName = process.env.PINECONE_INDEX_NAME!

  try {
    // Check if index exists
    const indexes = await pineconeStore.listIndexes()

    if (!indexes.includes(indexName)) {
      console.log(`🔧 Creating Pinecone index: ${indexName}`)

      // Create index with proper dimensions for text-embedding-3-small (1536 dimensions)
      await pineconeStore.createIndex({
        indexName,
        dimension: 1536, // OpenAI text-embedding-3-small dimensions
        metric: "cosine", // Use cosine for semantic similarity
      })

      console.log(`✅ Created Pinecone index: ${indexName}`)
    } else {
      console.log(`✅ Pinecone index already exists: ${indexName}`)
    }
  } catch (error) {
    console.error(`❌ Error initializing Pinecone index:`, error)
    throw error
  }
}
