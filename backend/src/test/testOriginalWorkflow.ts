// src/test/testOriginalWorkflow.ts

async function testOriginalWorkflow() {
  console.log("🔄 Testing original workflow...")
  
  try {
    const { productDevelopmentWorkflow } = await import("../mastra/workflows/productDevelopmentWorkflow.js")
    
    console.log("📝 Creating workflow run...")
    const run = await productDevelopmentWorkflow.createRunAsync()
    
    console.log("▶️ Starting workflow...")
    const result = await run.start({
      inputData: {
        rawIdea: "A note-taking app with AI features for students",
        enableSprintPlanning: false, // Disable to avoid Linear issues
      }
    })
    
    console.log("✅ Original workflow completed!")
    console.log(`📊 Status: ${result.status}`)
    console.log(`🎯 Current Step: ${result.currentStep}`)
    
    if (result.ideaAnalysis) {
      console.log(`💡 Idea: ${result.ideaAnalysis.refinedIdea?.title || 'Generated'}`)
    }
    
    if (result.userStoryAnalysis) {
      console.log(`📖 Stories: ${result.userStoryAnalysis.userStories?.length || 0}`)
    }
    
    return result
    
  } catch (error) {
    console.error("❌ Original workflow failed:", error.message)
    if (error.stack) {
      console.error("Stack trace:", error.stack.split('\n').slice(0, 5).join('\n'))
    }
    throw error
  }
}

testOriginalWorkflow().catch(console.error)