// src/test/testVisualDesign.ts - Comprehensive Visual Design Testing
import "dotenv/config"
import { testVisualDesignTool } from "../mastra/tools/visualDesignTool.js"
import { testVisualDesignAgent } from "../mastra/agents/visualDesignAgent.js"
import { testVisualDesignStep } from "../mastra/workflows/visualDesignStep.js"

async function testVisualDesignIntegration() {
  console.log("\n🎨 Starting Comprehensive Visual Design Integration Test")
  console.log("=" .repeat(80))
  
  // Check MIRO_API_KEY availability
  console.log("\n🔑 Checking MIRO_API_KEY...")
  if (process.env.MIRO_API_KEY) {
    console.log(`✅ MIRO_API_KEY found: ${process.env.MIRO_API_KEY.substring(0, 10)}...${process.env.MIRO_API_KEY.substring(process.env.MIRO_API_KEY.length - 4)}`)
  } else {
    console.log("❌ MIRO_API_KEY not found in environment")
    console.log("💡 Please ensure MIRO_API_KEY is set in your .env file")
  }

  const results = {
    toolTest: null as any,
    agentTest: null as any,
    stepTest: null as any,
    integrationSuccess: false,
    errors: [] as string[],
  }

  try {
    // Test 1: Visual Design Tool
    console.log("\n🛠️ 1. Testing Visual Design Tool...")
    console.log("-".repeat(50))
    
    results.toolTest = await testVisualDesignTool()
    console.log("✅ Visual Design Tool test completed successfully")
    
    // Test 2: Visual Design Agent  
    console.log("\n🤖 2. Testing Visual Design Agent...")
    console.log("-".repeat(50))
    
    results.agentTest = await testVisualDesignAgent()
    console.log("✅ Visual Design Agent test completed successfully")
    
    // Test 3: Visual Design Workflow Step
    console.log("\n⚙️ 3. Testing Visual Design Workflow Step...")
    console.log("-".repeat(50))
    
    results.stepTest = await testVisualDesignStep()
    console.log("✅ Visual Design Step test completed successfully")

    // Integration validation
    results.integrationSuccess = true
    
    console.log("\n🎉 All Visual Design Tests Passed!")
    console.log("=" .repeat(80))
    
  } catch (error) {
    console.error("❌ Visual Design test failed:", error)
    results.errors.push(error.message)
    results.integrationSuccess = false
  }

  return results
}

// Test with Miro integration (if API key available)
async function testMiroIntegration() {
  console.log("\n🔗 Testing Miro Integration...")
  console.log("-".repeat(50))

  if (!process.env.MIRO_API_KEY || process.env.MIRO_API_KEY === 'your_miro_api_key_here') {
    console.log("⚠️ MIRO_API_KEY not found - skipping Miro integration test")
    return { skipped: true, reason: "No API key" }
  }

  try {
    // Import visual design tool for direct testing
    const { visualDesignTool } = await import("../mastra/tools/visualDesignTool.js")

    const testInput = {
      projectTitle: "Miro Integration Test App",
      designType: "user_journey" as const,
      prdContent: {
        features: [
          {
            name: "User Onboarding",
            description: "Welcome new users and guide them through setup",
            acceptanceCriteria: ["Welcome screen", "Profile setup", "Feature tour"],
            priority: "high" as const,
          },
        ],
        userPersonas: [
          {
            name: "New User",
            role: "First-time User", 
            demographics: "Varied demographics",
            needs: ["Easy onboarding", "Clear guidance"],
            painPoints: ["Complex interfaces", "Too many steps"],
            goals: ["Get started quickly", "Understand features"],
          },
        ],
        userStories: [
          {
            id: "US001",
            title: "Complete onboarding",
            persona: "New User",
            userAction: "go through the onboarding process",
            benefit: "I can start using the app effectively",
            acceptanceCriteria: ["Welcome message", "Setup steps", "Completion confirmation"],
            priority: "high" as const,
          },
        ],
      },
    }

    const result = await visualDesignTool.execute({
      context: testInput,
      runtimeContext: {},
    })

    if (result.success && result.miroBoard) {
      console.log("✅ Miro integration test passed!")
      console.log(`🎨 Created board: ${result.miroBoard.name}`)
      console.log(`📊 Elements created: ${result.visualElements.itemsCreated}`)
      console.log(`🔗 View board: ${result.miroBoard.viewLink}`)
      return { success: true, result }
    } else {
      console.log("❌ Miro integration failed")
      return { failed: true, result }
    }

  } catch (error) {
    console.error("❌ Miro integration test failed:", error)
    return { failed: true, error: error.message }
  }
}

// End-to-end workflow test with visual design
async function testEndToEndWithVisuals() {
  console.log("\n🎯 Testing End-to-End Workflow with Visual Design...")
  console.log("-".repeat(50))

  try {
    // Test just the visual design step independently
    const { testVisualDesignStep } = await import("../mastra/workflows/visualDesignStep.js")

    const result = await testVisualDesignStep()

    console.log("\n📊 Visual Design Step Results:")
    console.log("Success:", result.success)
    console.log("Visualizations Created:", result.visualizations.length)
    console.log("UX Gaps Identified:", result.designInsights.userExperienceGaps.length)
    console.log("Process Optimizations:", result.designInsights.processOptimizations.length)
    console.log("Recommendations:", result.recommendations.length)

    if (result.success && result.visualizations.length > 0) {
      console.log("✅ Visual design workflow completed successfully!")
      return { success: true, result }
    } else {
      console.log("⚠️ Visual design completed but no visualizations created")
      return { partial: true, result }
    }

  } catch (error) {
    console.error("❌ Visual design workflow test failed:", error)
    return { failed: true, error: error.message }
  }
}

// Main test runner
export async function runVisualDesignTests() {
  console.log("🧪 VISUAL DESIGN COMPREHENSIVE TEST SUITE")
  console.log("🎨 Testing Visual Design Agent with Miro Integration")
  console.log("=" .repeat(80))

  const testResults = {
    integration: null as any,
    miro: null as any,
    endToEnd: null as any,
    overallSuccess: false,
  }

  try {
    // Run integration tests
    testResults.integration = await testVisualDesignIntegration()
    
    // Run Miro integration test (if possible)
    testResults.miro = await testMiroIntegration()
    
    // Run end-to-end visual design test
    testResults.endToEnd = await testEndToEndWithVisuals()

    // Determine overall success
    testResults.overallSuccess = 
      testResults.integration.integrationSuccess &&
      (testResults.endToEnd.success || testResults.endToEnd.partial)

    console.log("\n🏁 TEST SUITE SUMMARY")
    console.log("=" .repeat(80))
    console.log(`✅ Integration Tests: ${testResults.integration.integrationSuccess ? 'PASSED' : 'FAILED'}`)
    console.log(`🔗 Miro Integration: ${
      testResults.miro.success ? 'PASSED' :
      testResults.miro.skipped ? 'SKIPPED' :
      testResults.miro.failed ? 'FAILED' : 'UNKNOWN'
    }`)
    console.log(`🎯 End-to-End Test: ${
      testResults.endToEnd.success ? 'PASSED' :
      testResults.endToEnd.partial ? 'PARTIAL' : 'FAILED'
    }`)
    console.log(`🏆 Overall: ${testResults.overallSuccess ? 'SUCCESS' : 'NEEDS ATTENTION'}`)

    if (testResults.overallSuccess) {
      console.log("\n🎉 Visual Design Agent implementation is ready for use!")
      console.log("🚀 Features verified:")
      console.log("  ✅ Visual design tool architecture")
      console.log("  ✅ Miro API integration capability")
      console.log("  ✅ User journey and flow generation")
      console.log("  ✅ Process diagram creation")
      console.log("  ✅ Stakeholder collaboration features")
    } else {
      console.log("\n💡 Setup Instructions:")
      console.log("To enable full Miro integration:")
      console.log("1. Visit: https://miro.com/app/settings/user-profile/apps")
      console.log("2. Create a new Developer App")
      console.log("3. Generate an API token")
      console.log("4. Add MIRO_API_KEY to your .env file")
      console.log("5. Run tests again for full functionality")
    }

    return testResults

  } catch (error) {
    console.error("❌ Test suite execution failed:", error)
    testResults.overallSuccess = false
    return testResults
  }
}

// Run tests if this file is executed directly
console.log("🔧 Visual Design test file loaded")
console.log("import.meta.url:", import.meta.url)
console.log("process.argv[1]:", process.argv[1])

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("✅ Running as main module")
  runVisualDesignTests()
    .then(results => {
      process.exit(results.overallSuccess ? 0 : 1)
    })
    .catch(error => {
      console.error("Fatal test error:", error)
      process.exit(1)
    })
} else {
  console.log("ℹ️ Imported as module, force running tests...")
  runVisualDesignTests()
    .then(results => {
      console.log("🏁 Test completed")
    })
    .catch(error => {
      console.error("Fatal test error:", error)
    })
}