import { mastra } from "../mastra/index"
import { populateKnowledgeBase } from "../mastra/setup/populateKnowledgeBase"
import { ragKnowledgeTool } from "../mastra/tools/ragKnowledgeTool"
import { ideaGenerationAgent } from "../mastra/agents/ideaGenerationAgent"
import { RuntimeContext } from "@mastra/core/di"

async function testRAGSetup() {
  console.log("🧪 Testing Complete RAG Setup with Pinecone\n")

  try {
    // Step 1: Populate knowledge base
    console.log("=".repeat(60))
    console.log("STEP 1: Populating Knowledge Base")
    console.log("=".repeat(60))

    await populateKnowledgeBase()

    // Step 2: Test RAG tool directly
    console.log("\n" + "=".repeat(60))
    console.log("STEP 2: Testing RAG Knowledge Tool")
    console.log("=".repeat(60))

    const runtimeContext = new RuntimeContext()

    const ragResult = await ragKnowledgeTool.execute({
      context: {
        query: "How to create user personas?",
        topK: 2,
      },
      runtimeContext,
    })

    console.log("RAG Tool Results:")
    console.log("Summary:", ragResult.summary)
    console.log("Found", ragResult.results.length, "results")
    ragResult.results.forEach((result, i) => {
      console.log(`\nResult ${i + 1}:`)
      console.log(`- Score: ${result.score}`)
      console.log(`- Content preview: ${result.content.substring(0, 200)}...`)
    })

    // Step 3: Test agent with RAG
    console.log("\n" + "=".repeat(60))
    console.log("STEP 3: Testing Agent with RAG")
    console.log("=".repeat(60))

    const response = await ideaGenerationAgent.generate(
      "I want to build a mobile app for fitness tracking. Can you help me create user personas and use best practices from your knowledge base?"
    )

    console.log("Agent Response:")
    console.log(response.text)

    console.log("\n✅ RAG Setup Test Complete!")
  } catch (error) {
    console.error("❌ Test failed:", error)
    process.exit(1)
  }
}

// Run the test
// if (require.main === module) {
//   testRAGSetup()
// }

testRAGSetup()
  .then(() => {
    console.log("\n🎉 Rag tests completed successfully!")
    console.log("\n📋 Summary:")
    console.log("- ✅ Pinecone knowledge base setup")
  })
  .catch(error => {
    console.error("💥 Test suite failed:", error)
    process.exit(1)
  })
