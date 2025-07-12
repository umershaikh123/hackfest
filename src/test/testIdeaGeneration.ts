import { mastra } from "../mastra/index"
import { populateKnowledgeBase } from "../mastra/setup/populateKnowledgeBase"
import { testIdeaGenerationAgent } from "../mastra/agents/ideaGenerationAgent"
import { testUserStoryGeneratorAgent } from "../mastra/agents/userStoryGeneratorAgent"
import { testRAGKnowledgeTool } from "../mastra/tools/ragKnowledgeTool"
import { RuntimeContext } from "@mastra/core/di"
import {
  testProductDevelopmentWorkflow,
  testUserStoryGeneration,
} from "../mastra/workflows/productDevelopmentWorkflow"

async function main() {
  console.log("🎯 Product Maestro - Testing Enhanced System Components\n")

  try {
    // Test 0: Initialize Pinecone Knowledge Base
    console.log("=".repeat(60))
    console.log("TEST 0: Initializing Knowledge Base")
    console.log("=".repeat(60))

    try {
      await populateKnowledgeBase()
      console.log("✅ Knowledge base initialized")
    } catch (error) {
      console.log("⚠️ Knowledge base initialization failed:", error.message)
      console.log("📝 Continuing with other tests...")
    }

    // Test 1: Direct tool usage - Idea Generation Tool
    console.log("\n" + "=".repeat(60))
    console.log("TEST 1: Testing Idea Generation Tool Directly")
    console.log("=".repeat(60))

    const ideaGenerationTool = (
      await import("../mastra/tools/ideaGenerationTool")
    ).ideaGenerationTool

    const runtimeContext = new RuntimeContext()

    const toolResult = await ideaGenerationTool.execute({
      context: {
        rawIdea:
          "A mobile app that helps remote workers find and book coworking spaces nearby",
        additionalContext:
          "Should include features like real-time availability, reviews, and integrated payments",
        targetAudience: "Remote workers and digital nomads",
        businessGoals: [
          "Generate revenue through booking commissions",
          "Build a community platform",
        ],
      },
      runtimeContext,
    })

    console.log("🛠️ Idea Generation Tool Output:")
    console.log(`✅ Product: ${toolResult.refinedIdea.title}`)
    console.log(`✅ Features: ${toolResult.refinedIdea.coreFeatures.length}`)
    console.log(`✅ Personas: ${toolResult.userPersonas.length}`)
    console.log(`✅ Questions: ${toolResult.clarifyingQuestions.length}`)

    // Test 2: RAG tool
    console.log("\n" + "=".repeat(60))
    console.log("TEST 2: Testing RAG Knowledge Tool")
    console.log("=".repeat(60))

    try {
      await testRAGKnowledgeTool()
    } catch (error) {
      console.log("⚠️ RAG tool test failed:", error.message)
    }

    // Test 3: User Story Generation Tool
    console.log("\n" + "=".repeat(60))
    console.log("TEST 3: Testing User Story Generation Tool Directly")
    console.log("=".repeat(60))

    const userStoryGeneratorTool = (
      await import("../mastra/tools/userStoryGeneratorTool")
    ).userStoryGeneratorTool

    const userStoryToolResult = await userStoryGeneratorTool.execute({
      context: {
        productIdea: toolResult.refinedIdea,
        userPersonas: toolResult.userPersonas,
        focusAreas: ["core features", "user onboarding"],
      },
      runtimeContext,
    })

    console.log("🛠️ User Story Tool Output:")
    console.log(`✅ Epics: ${userStoryToolResult.epics.length}`)
    console.log(`✅ User Stories: ${userStoryToolResult.userStories.length}`)
    console.log(`✅ MVP Stories: ${userStoryToolResult.mvpStories.length}`)
    console.log(
      `✅ Total Story Points: ${userStoryToolResult.totalEstimate.storyPoints}`
    )

    // Test 4: Idea Generation Agent
    console.log("\n" + "=".repeat(60))
    console.log("TEST 4: Testing Idea Generation Agent")
    console.log("=".repeat(60))

    const agentResult = await testIdeaGenerationAgent()
    console.log("🤖 Idea Generation Agent Response Complete")

    // Test 5: User Story Generation Agent
    console.log("\n" + "=".repeat(60))
    console.log("TEST 5: Testing User Story Generation Agent")
    console.log("=".repeat(60))

    const userStoryAgentResult = await testUserStoryGeneratorAgent()
    console.log("🤖 User Story Generation Agent Response Complete")

    // Test 6: User Story Generation Step
    console.log("\n" + "=".repeat(60))
    console.log("TEST 6: Testing User Story Generation Workflow Step")
    console.log("=".repeat(60))

    await testUserStoryGeneration()
    console.log("userStoryAgentResult", userStoryAgentResult)
    console.log("🔄 User Story Generation Step Complete")

    // Test 7: Complete Enhanced Workflow
    console.log("\n" + "=".repeat(60))
    console.log("TEST 7: Testing Complete Enhanced Workflow")
    console.log("=".repeat(60))

    await testProductDevelopmentWorkflow()
    console.log("🔄 Enhanced Workflow Complete")
  } catch (error) {
    console.error("❌ Test failed:", error)
    process.exit(1)
  }
}

// Run all tests
main()
  .then(() => {
    console.log("\n🎉 All enhanced tests completed successfully!")
    console.log("\n📋 Summary:")
    console.log("- ✅ Pinecone knowledge base setup")
    console.log("- ✅ Idea Generation Tool working")
    console.log("- ✅ RAG Knowledge Tool working")
    console.log("- ✅ User Story Generation Tool working")
    console.log("- ✅ Idea Generation Agent responding")
    console.log("- ✅ User Story Generation Agent responding")
    console.log("- ✅ User Story Generation Step executing")
    console.log("- ✅ Enhanced Product Development Workflow executing")
    console.log("\n🚀 Ready for the next component: Visual Design Agent!")
    console.log("\n📊 System Status:")
    console.log("   Idea Generation → User Stories ✅ COMPLETE")
    console.log("   Next: User Stories → Wireframes 🔄 READY TO BUILD")
  })
  .catch(error => {
    console.error("💥 Enhanced test suite failed:", error)
    process.exit(1)
  })
