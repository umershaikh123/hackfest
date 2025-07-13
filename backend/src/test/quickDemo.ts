// Quick Visual Design Agent Demo
import "dotenv/config"
import { visualDesignAgent } from "../mastra/agents/visualDesignAgent.js"

async function quickDemo() {
  console.log("🎨 VISUAL DESIGN AGENT - QUICK DEMO")
  console.log("🚀 Showcasing Key Capabilities")
  console.log("=" .repeat(50))

  const demoPrompt = `
    I'm building a fitness tracking app called "FitTrack Pro" for busy professionals.

    Key Features:
    1. Quick 15-minute workout plans (High Priority)
    2. Progress tracking with visual charts (High Priority) 
    3. Social challenges with friends (Medium Priority)

    Target User:
    - Sarah (Marketing Manager, 32): Busy professional who wants efficient workouts

    User Story:
    - As Sarah, I want quick workout plans that fit into my lunch break so I can stay fit despite my busy schedule

    Please create a beautiful user journey map showing Sarah's experience from discovering the app to completing her first workout. Focus on her emotional states and key decision points.

    Make it visually appealing with modern design!
  `

  try {
    console.log("🎯 Creating visual design for FitTrack Pro...")
    
    const result = await visualDesignAgent.generate(demoPrompt, {
      conversationId: "fittrack-demo"
    })

    console.log("\n✅ Visual Design Complete!")
    console.log("🎨 Agent Response:")
    console.log(result.text)
    
    console.log("\n" + "=".repeat(50))
    console.log("🎉 DEMO COMPLETE!")
    console.log("🔗 Check the Miro board link above to see the visual design!")

  } catch (error) {
    console.error("❌ Demo failed:", error.message)
  }
}

// Run the quick demo
quickDemo().catch(console.error)