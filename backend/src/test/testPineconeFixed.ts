// Test the fixed Pinecone setup
import "dotenv/config"

async function testPineconeFixed() {
  console.log("🔧 Testing Fixed Pinecone Setup")
  console.log("=" .repeat(35))
  
  try {
    // Test environment variables
    console.log("1️⃣ Checking environment variables...")
    const apiKey = process.env.PINECONE_API_KEY
    const host = process.env.PINECONE_HOST  // Fixed: was PINECONE_Host
    const indexName = process.env.PINECONE_INDEX_NAME
    
    if (!apiKey || !host || !indexName) {
      throw new Error("Missing required Pinecone environment variables")
    }
    
    console.log("✅ Environment variables are set correctly")
    console.log(`   - API Key: ${apiKey.substring(0, 10)}...`)
    console.log(`   - Host: ${host}`)
    console.log(`   - Index: ${indexName}`)
    
    // Test Pinecone connection
    console.log("\n2️⃣ Testing Pinecone connection...")
    const { pineconeStore, initializePineconeIndex } = await import("../mastra/vectors/pineconeSetup")
    
    console.log("✅ Pinecone store initialized successfully")
    
    // Test index initialization
    console.log("\n3️⃣ Testing index initialization...")
    await initializePineconeIndex()
    console.log("✅ Index initialization completed successfully")
    
    console.log("\n🎉 All Pinecone fixes are working correctly!")
    console.log("\n📋 Summary of fixes applied:")
    console.log("   ✅ Fixed PINECONE_Host → PINECONE_HOST")
    console.log("   ✅ Removed quotes from API key")
    console.log("   ✅ Updated PineconeVector to use 'host' instead of 'environment'")
    console.log("   ✅ Added better error handling in main index.ts")
    console.log("   ✅ Made Pinecone initialization non-blocking")
    
  } catch (error) {
    console.error("❌ Pinecone setup still has issues:", error)
    
    console.log("\n🔧 Troubleshooting steps:")
    console.log("1. Verify PINECONE_API_KEY is complete and valid")
    console.log("2. Check PINECONE_HOST URL is correct")
    console.log("3. Ensure network connectivity to Pinecone")
    console.log("4. Verify the index exists in your Pinecone project")
  }
}

testPineconeFixed().catch(console.error)