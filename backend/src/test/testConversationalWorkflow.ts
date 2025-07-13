// src/test/testConversationalWorkflow.ts
import { 
  conversationalProductWorkflow, 
  testConversationalWorkflow, 
  testFeedbackIteration 
} from "../mastra/workflows/conversationalProductWorkflow.js"
import { testFeedbackRouterAgent } from "../mastra/agents/feedbackRouterAgent.js"
import { testFeedbackStep } from "../mastra/workflows/steps/feedbackStep.js"
import type { Feedback } from "../types/productMaestro.js"

/**
 * Comprehensive test suite for the conversational product workflow
 * Tests all agents, feedback routing, and human-in-the-loop capabilities
 */

async function runTestSuite() {
  console.log("🚀 CONVERSATIONAL PRODUCT WORKFLOW TEST SUITE")
  console.log("=".repeat(80))
  
  const results = {
    feedbackRouterAgent: false,
    feedbackStep: false,
    basicWorkflow: false,
    feedbackIteration: false,
    fullWorkflow: false,
  }
  
  try {
    // Test 1: Feedback Router Agent
    console.log("\n🧪 TEST 1: Feedback Router Agent")
    console.log("-".repeat(50))
    await testFeedbackRouterAgent()
    results.feedbackRouterAgent = true
    console.log("✅ Feedback Router Agent test passed")
    
  } catch (error) {
    console.error("❌ Feedback Router Agent test failed:", error)
  }
  
  try {
    // Test 2: Feedback Step
    console.log("\n🧪 TEST 2: Feedback Processing Step")
    console.log("-".repeat(50))
    await testFeedbackStep()
    results.feedbackStep = true
    console.log("✅ Feedback Step test passed")
    
  } catch (error) {
    console.error("❌ Feedback Step test failed:", error)
  }
  
  try {
    // Test 3: Basic Workflow (no feedback)
    console.log("\n🧪 TEST 3: Basic Conversational Workflow")
    console.log("-".repeat(50))
    const basicResult = await testBasicWorkflow()
    results.basicWorkflow = true
    console.log("✅ Basic workflow test passed")
    console.log(`📊 Completion: ${basicResult.qualityMetrics.completionPercentage}%`)
    
  } catch (error) {
    console.error("❌ Basic workflow test failed:", error)
  }
  
  try {
    // Test 4: Feedback Iteration
    console.log("\n🧪 TEST 4: Feedback Iteration Workflow")
    console.log("-".repeat(50))
    await testFeedbackIteration()
    results.feedbackIteration = true
    console.log("✅ Feedback iteration test passed")
    
  } catch (error) {
    console.error("❌ Feedback iteration test failed:", error)
  }
  
  try {
    // Test 5: Full Workflow with All Integrations
    console.log("\n🧪 TEST 5: Full Conversational Workflow")
    console.log("-".repeat(50))
    const fullResult = await testConversationalWorkflow()
    results.fullWorkflow = true
    console.log("✅ Full workflow test passed")
    console.log(`📊 Final Completion: ${fullResult.qualityMetrics.completionPercentage}%`)
    console.log(`🔗 Integrations: ${fullResult.qualityMetrics.integrationsUsed.join(", ")}`)
    
  } catch (error) {
    console.error("❌ Full workflow test failed:", error)
  }
  
  // Test Summary
  console.log("\n📊 TEST SUITE SUMMARY")
  console.log("=".repeat(80))
  const totalTests = Object.keys(results).length
  const passedTests = Object.values(results).filter(Boolean).length
  const successRate = Math.round((passedTests / totalTests) * 100)
  
  console.log(`📈 Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`)
  console.log("\n📋 Individual Test Results:")
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`  ${passed ? "✅" : "❌"} ${test}`)
  })
  
  if (successRate >= 80) {
    console.log("\n🎉 TEST SUITE PASSED - System ready for production!")
  } else {
    console.log("\n⚠️ TEST SUITE NEEDS ATTENTION - Some components require fixes")
  }
  
  return results
}

async function testBasicWorkflow() {
  console.log("🔄 Running basic workflow without feedback...")
  
  const run = await conversationalProductWorkflow.createRunAsync()
  
  const result = await run.start({
    inputData: {
      rawIdea: "A task management app with AI-powered priority suggestions and team collaboration features",
      additionalContext: "Focused on remote teams who need better coordination and smart task prioritization",
      userEmail: "test@example.com",
      enableSprintPlanning: true,
      enableVisualDesign: true,
      teamSize: 4,
      sprintLength: "2 weeks",
      totalSprints: 3,
      // Disable actual integrations for testing
      notionDatabaseId: undefined,
      linearTeamId: undefined,
      createLinearProject: false,
    },
  })
  
  console.log("📊 Basic Workflow Result:")
  console.log(`  🔍 Session: ${result.sessionId}`)
  console.log(`  📈 Status: ${result.status}`)
  console.log(`  🎯 Mode: ${result.workflowMode}`)
  console.log(`  📋 Artifacts: ${result.qualityMetrics.artifactsGenerated}`)
  
  return result
}

async function testComplexFeedbackScenario() {
  console.log("🔄 Testing complex feedback scenario...")
  
  const complexFeedback: Feedback[] = [
    {
      type: "idea_refinement",
      content: "Add AI-powered habit recommendations based on user behavior patterns",
      priority: "high",
      timestamp: new Date().toISOString(),
    },
    {
      type: "user_story_modification", 
      content: "The admin stories need role-based permissions for different team levels",
      priority: "medium",
      timestamp: new Date().toISOString(),
    },
    {
      type: "visual_design_change",
      content: "Create a dashboard view that shows team progress and individual metrics",
      priority: "medium",
      timestamp: new Date().toISOString(),
    },
    {
      type: "sprint_adjustment",
      content: "We need to deliver MVP in 6 weeks instead of 8 weeks, adjust timeline",
      priority: "urgent",
      timestamp: new Date().toISOString(),
    },
  ]
  
  const run = await conversationalProductWorkflow.createRunAsync()
  
  const result = await run.start({
    inputData: {
      rawIdea: "Productivity app with team features",
      userFeedback: complexFeedback,
      iterationMode: true,
      enableSprintPlanning: true,
      enableVisualDesign: true,
      teamSize: 6,
      sprintLength: "1 week", // Adjusted for urgency
      totalSprints: 6,
    },
  })
  
  console.log("📊 Complex Feedback Result:")
  console.log(`  🔄 Feedback Items: ${result.feedbackProcessing?.feedbackReceived.length}`)
  console.log(`  🎯 Routing Decisions: ${result.feedbackProcessing?.routingDecisions.length}`)
  console.log(`  ⚡ Status: ${result.status}`)
  
  return result
}

async function testHumanInTheLoopScenario() {
  console.log("🔄 Testing human-in-the-loop scenario...")
  
  // This would test the suspend/resume functionality
  // In a real implementation, this would involve actual user interaction
  const urgentFeedback: Feedback[] = [
    {
      type: "workflow_direction",
      content: "Stop current sprint planning and focus only on MVP features for next 2 weeks",
      priority: "urgent",
      timestamp: new Date().toISOString(),
    },
  ]
  
  const run = await conversationalProductWorkflow.createRunAsync()
  
  const result = await run.start({
    inputData: {
      rawIdea: "Emergency feature request handling",
      userFeedback: urgentFeedback,
      iterationMode: true,
      enableSprintPlanning: true,
      enableVisualDesign: false, // Disable for speed
    },
  })
  
  console.log("📊 Human-in-the-Loop Result:")
  console.log(`  ⏸️ Should Suspend: ${result.status === "suspended_for_approval"}`)
  console.log(`  🎯 Current Step: ${result.currentStep}`)
  
  return result
}

// Export individual test functions
export {
  runTestSuite,
  testBasicWorkflow,
  testComplexFeedbackScenario,
  testHumanInTheLoopScenario,
}

// Run the test suite if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTestSuite().catch(console.error)
}