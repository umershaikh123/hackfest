// src/test/testFeedbackRouter.ts
import { testFeedbackRouterAgent } from "../mastra/agents/feedbackRouterAgent.js"
import { testFeedbackStep } from "../mastra/workflows/steps/feedbackStep.js"

/**
 * Test the feedback routing system components
 */

async function testFeedbackRouter() {
  console.log("🔄 FEEDBACK ROUTER TEST SUITE")
  console.log("=".repeat(50))
  
  try {
    console.log("\n🧪 Testing Feedback Router Agent...")
    await testFeedbackRouterAgent()
    console.log("✅ Feedback Router Agent test passed")
    
    console.log("\n🧪 Testing Feedback Step...")
    await testFeedbackStep()
    console.log("✅ Feedback Step test passed")
    
    console.log("\n🎉 All feedback router tests passed!")
    
  } catch (error) {
    console.error("❌ Feedback router test failed:", error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testFeedbackRouter().catch(console.error)
}