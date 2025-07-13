// src/test/quickWorkflowTest.ts

console.log("🚀 Testing Conversational Workflow...")

async function testBasicWorkflow() {
  try {
    console.log("📝 Importing workflow...")
    const { conversationalProductWorkflow } = await import("../mastra/workflows/conversationalProductWorkflow.js")
    
    console.log("🔄 Creating workflow run...")
    const run = await conversationalProductWorkflow.createRunAsync()
    
    console.log("▶️ Starting workflow...")
    const result = await run.start({
      inputData: {
        rawIdea: "A simple note-taking app for students with AI-powered study suggestions",
        additionalContext: "Should help students organize notes and get personalized study recommendations",
        enableSprintPlanning: false, // Disable to avoid Linear/API issues
        enableVisualDesign: false,   // Disable to avoid Miro/API issues
        teamSize: 3,
        sprintLength: "2 weeks",
        totalSprints: 2,
      },
    })
    
    console.log("✅ Workflow completed!")
    console.log(`📊 Session ID: ${result.sessionId}`)
    console.log(`📈 Status: ${result.status}`)
    console.log(`🎯 Current Step: ${result.currentStep}`)
    console.log(`📋 Completion: ${result.qualityMetrics.completionPercentage}%`)
    
    if (result.ideaAnalysis) {
      console.log(`💡 Idea Analysis: ${result.ideaAnalysis.refinedIdea?.title || 'Generated'}`)
    }
    
    if (result.userStoryAnalysis) {
      console.log(`📖 User Stories: ${result.userStoryAnalysis.userStories?.length || 0} generated`)
    }
    
    if (result.prdAnalysis) {
      console.log(`📄 PRD: ${result.prdAnalysis.success ? 'Generated' : 'Failed'}`)
    }
    
    return result
    
  } catch (error) {
    console.error("❌ Workflow test failed:", error.message)
    // Print stack trace for debugging
    if (error.stack) {
      console.error("Stack trace:", error.stack.split('\n').slice(0, 10).join('\n'))
    }
    throw error
  }
}

// Run the test
testBasicWorkflow().catch(console.error)