import { mastra } from "../mastra/index"

import { testIdeaGenerationAgent } from "../mastra/agents/ideaGenerationAgent"
import { RuntimeContext } from "@mastra/core/di"

async function main() {
  console.log("🎯 Product Maestro - Testing Idea Generation Components\n")

  try {
    // Test 1: Direct tool usage - FIXED
    console.log("=".repeat(60))
    console.log("TEST 1: Testing Idea Generation Tool Directly")
    console.log("=".repeat(60))

    const ideaGenerationTool = (
      await import("../mastra/tools/ideaGenerationTool")
    ).ideaGenerationTool

    // FIXED: Provide runtimeContext as required
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
      runtimeContext, // FIXED: Added required runtimeContext
    })

    console.log("🛠️ Tool Output:")
    console.log(JSON.stringify(toolResult, null, 2))

    // Test 2: Agent interaction
    console.log("\n" + "=".repeat(60))
    console.log("TEST 2: Testing Idea Generation Agent")
    console.log("=".repeat(60))

    const agentResult = await testIdeaGenerationAgent()
    console.log("🤖 Agent Response Complete")

    // Test 3: Full workflow
    console.log("\n" + "=".repeat(60))
    console.log("TEST 3: Testing Complete Workflow")
    console.log("=".repeat(60))

    await testProductDevelopmentWorkflow()
    console.log("🔄 Workflow Complete")
  } catch (error) {
    console.error("❌ Test failed:", error)
    process.exit(1)
  }
}

async function testProductDevelopmentWorkflow() {
  console.log("🚀 Testing Product Development Workflow - Idea Generation Step")

  const workflow = mastra.getWorkflow("productDevelopmentWorkflow")

  if (!workflow) {
    throw new Error("Workflow not found")
  }

  const run = await workflow.createRunAsync()

  const result = await run.start({
    inputData: {
      rawIdea:
        "I want to create a habit tracking app that helps people build better daily routines with gamification elements",
      additionalContext:
        "Target audience is young professionals who struggle with consistency",
    },
  })

  console.log("📊 Workflow Result:")
  console.log(JSON.stringify(result, null, 2))

  return result
}

// Run all tests
main()
  .then(() => {
    console.log("\n🎉 All tests completed successfully!")
    console.log("\n📋 Summary:")
    console.log("- ✅ Idea Generation Tool working")
    console.log("- ✅ Idea Generation Agent responding")
    console.log("- ✅ Product Development Workflow executing")
    console.log("\n🚀 Ready to build the next component!")
  })
  .catch(error => {
    console.error("💥 Test suite failed:", error)
    process.exit(1)
  })
