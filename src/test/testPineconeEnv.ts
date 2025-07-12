// Test Pinecone environment variables
import "dotenv/config"

async function testPineconeEnv() {
  console.log("🔍 Testing Pinecone Environment Variables")
  console.log("=" .repeat(45))
  
  const requiredVars = {
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_HOST: process.env.PINECONE_HOST,
    PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME,
  }
  
  let allValid = true
  
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      console.log(`❌ ${key}: NOT SET`)
      allValid = false
    } else {
      const displayValue = key.includes('KEY') ? `${value.substring(0, 10)}...` : value
      console.log(`✅ ${key}: ${displayValue}`)
    }
  }
  
  if (allValid) {
    console.log("\n🎉 All Pinecone environment variables are properly set!")
    
    // Test Pinecone connection
    try {
      console.log("\n🧪 Testing Pinecone connection...")
      const { pineconeStore } = await import("../mastra/vectors/pineconeSetup")
      
      const indexes = await pineconeStore.listIndexes()
      console.log("✅ Successfully connected to Pinecone!")
      console.log("📋 Available indexes:", indexes)
      
      if (indexes.includes(process.env.PINECONE_INDEX_NAME!)) {
        console.log(`✅ Target index '${process.env.PINECONE_INDEX_NAME}' exists`)
      } else {
        console.log(`⚠️ Target index '${process.env.PINECONE_INDEX_NAME}' does not exist`)
      }
      
    } catch (error) {
      console.log("❌ Pinecone connection failed:", error)
    }
  } else {
    console.log("\n❌ Please set all required Pinecone environment variables")
  }
}

testPineconeEnv().catch(console.error)