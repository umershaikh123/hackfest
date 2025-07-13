// src/test/simpleEndToEndTest.ts

console.log("🚀 Starting simple end-to-end test...")

/**
 * Simple end-to-end test to verify the conversational workflow system
 */

async function runSimpleTest() {
  console.log("🚀 SIMPLE END-TO-END TEST")
  console.log("=".repeat(50))
  
  let testsPassed = 0
  let testsTotal = 0
  
  // Test 1: Environment Variables
  testsTotal++
  console.log("\n🧪 Test 1: Environment Variables")
  try {
    const requiredEnvVars = ['GOOGLE_GENERATIVE_AI_API_KEY']
    const missingVars = requiredEnvVars.filter(key => !process.env[key])
    
    if (missingVars.length > 0) {
      console.log(`⚠️ Missing environment variables: ${missingVars.join(', ')}`)
      console.log("ℹ️ Some tests may fail without proper API keys")
    } else {
      console.log("✅ Core environment variables present")
      testsPassed++
    }
  } catch (error) {
    console.error("❌ Environment check failed:", error.message)
  }
  
  // Test 2: Agent Imports
  testsTotal++
  console.log("\n🧪 Test 2: Agent Imports")
  try {
    const { feedbackRouterAgent } = await import("../mastra/agents/feedbackRouterAgent.js")
    const { ideaGenerationAgent } = await import("../mastra/agents/ideaGenerationAgent.js")
    
    console.log("✅ Agents imported successfully")
    console.log(`  - Feedback Router: ${feedbackRouterAgent.name}`)
    console.log(`  - Idea Generation: ${ideaGenerationAgent.name}`)
    testsPassed++
  } catch (error) {
    console.error("❌ Agent import failed:", error.message)
  }
  
  // Test 3: Tool Imports
  testsTotal++
  console.log("\n🧪 Test 3: Tool Imports")
  try {
    const { feedbackRouterTool } = await import("../mastra/tools/feedbackRouterTool.js")
    const { ideaGenerationTool } = await import("../mastra/tools/ideaGenerationTool.js")
    
    console.log("✅ Tools imported successfully")
    console.log(`  - Feedback Router Tool: ${feedbackRouterTool.id}`)
    console.log(`  - Idea Generation Tool: ${ideaGenerationTool.id}`)
    testsPassed++
  } catch (error) {
    console.error("❌ Tool import failed:", error.message)
  }
  
  // Test 4: Workflow Import
  testsTotal++
  console.log("\n🧪 Test 4: Workflow Import")
  try {
    const { conversationalProductWorkflow } = await import("../mastra/workflows/conversationalProductWorkflow.js")
    
    console.log("✅ Conversational workflow imported successfully")
    console.log(`  - Workflow ID: ${conversationalProductWorkflow.id}`)
    testsPassed++
  } catch (error) {
    console.error("❌ Workflow import failed:", error.message)
  }
  
  // Test 5: Type Schema Import
  testsTotal++
  console.log("\n🧪 Test 5: Type Schema Import")
  try {
    const { FeedbackSchema, ProductIdeaSchema } = await import("../types/productMaestro.js")
    
    console.log("✅ Type schemas imported successfully")
    console.log(`  - Feedback Schema: ${FeedbackSchema._def.typeName}`)
    console.log(`  - Product Idea Schema: ${ProductIdeaSchema._def.typeName}`)
    testsPassed++
  } catch (error) {
    console.error("❌ Type schema import failed:", error.message)
  }
  
  // Test 6: Basic Agent Function Call (if API key available)
  testsTotal++
  console.log("\n🧪 Test 6: Basic Agent Function Call")
  try {
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      const { testFeedbackRouterAgent } = await import("../mastra/agents/feedbackRouterAgent.js")
      
      console.log("🔄 Running feedback router agent test...")
      const result = await testFeedbackRouterAgent()
      
      console.log("✅ Agent function call successful")
      console.log(`  - Response length: ${result.text?.length || 0} characters`)
      testsPassed++
    } else {
      console.log("⏭️ Skipping agent test (no API key)")
      testsTotal-- // Don't count this test
    }
  } catch (error) {
    console.error("❌ Agent function call failed:", error.message)
  }
  
  // Test Results
  console.log("\n📊 TEST RESULTS")
  console.log("=".repeat(50))
  const successRate = Math.round((testsPassed / testsTotal) * 100)
  
  console.log(`📈 Success Rate: ${successRate}% (${testsPassed}/${testsTotal})`)
  
  if (successRate >= 80) {
    console.log("🎉 TESTS PASSED - System ready for integration!")
  } else if (successRate >= 60) {
    console.log("⚠️ TESTS PARTIALLY PASSED - Some issues need attention")
  } else {
    console.log("❌ TESTS FAILED - Critical issues need to be resolved")
  }
  
  return { testsPassed, testsTotal, successRate }
}

// Export for use in other test files
export { runSimpleTest }

// Run test directly
runSimpleTest().catch(console.error)