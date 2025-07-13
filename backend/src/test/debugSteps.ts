// src/test/debugSteps.ts

async function debugSteps() {
  console.log("🔍 Debugging workflow steps...")
  
  try {
    // Test idea generation step
    console.log("\n1️⃣ Testing Idea Generation Step...")
    const { ideaGenerationStep } = await import("../mastra/workflows/steps/ideaGenerationStep.js")
    
    const ideaResult = await ideaGenerationStep.execute({
      inputData: {
        rawIdea: "A note-taking app with AI features",
        additionalContext: "For students",
      },
      runtimeContext: {},
    })
    
    console.log("✅ Idea step result keys:", Object.keys(ideaResult))
    console.log("📋 Refined idea:", ideaResult.refinedIdea?.title || "No title found")
    console.log("👥 Personas:", ideaResult.userPersonas?.length || 0)
    
    // Test user story generation step  
    console.log("\n2️⃣ Testing User Story Generation Step...")
    const { userStoryGenerationStep } = await import("../mastra/workflows/steps/userStoryGenerationStep.js")
    
    const userStoryResult = await userStoryGenerationStep.execute({
      inputData: {
        refinedIdea: ideaResult.refinedIdea,
        userPersonas: ideaResult.userPersonas,
      },
      runtimeContext: {},
    })
    
    console.log("✅ User story step result keys:", Object.keys(userStoryResult))
    console.log("📖 User stories:", userStoryResult.userStories?.length || 0)
    
    // Check what PRD step would need
    console.log("\n3️⃣ Checking PRD Step Requirements...")
    console.log("PRD step needs:")
    console.log("  - productIdea: ✅", !!ideaResult.refinedIdea)
    console.log("  - userPersonas: ✅", !!ideaResult.userPersonas)  
    console.log("  - userStories: ✅", !!userStoryResult.userStories)
    
    const prdInputData = {
      productIdea: ideaResult.refinedIdea,
      userPersonas: ideaResult.userPersonas,
      userStories: userStoryResult.userStories,
    }
    
    console.log("\n4️⃣ Testing PRD Step with correct data...")
    const { prdGenerationStep } = await import("../mastra/workflows/steps/prdGenerationStep.js")
    
    const prdResult = await prdGenerationStep.execute({
      inputData: prdInputData,
      runtimeContext: {},
    })
    
    console.log("✅ PRD step result:", prdResult.success ? "Success" : "Failed")
    console.log("📄 PRD Title:", prdResult.prdTitle)
    
  } catch (error) {
    console.error("❌ Debug failed:", error.message)
    if (error.stack) {
      console.error("Stack trace:", error.stack.split('\n').slice(0, 5).join('\n'))
    }
  }
}

debugSteps().catch(console.error)