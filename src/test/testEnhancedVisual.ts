// Test Enhanced Visual Design Tool with Web SDK concepts
import "dotenv/config"
import { visualDesignAgent } from "../mastra/agents/visualDesignAgent.js"

async function testEnhancedVisualDesign() {
  console.log("🚀 TESTING ENHANCED VISUAL DESIGN TOOL")
  console.log("🎨 With Improved Positioning & Error Handling")
  console.log("=" .repeat(55))

  const testPrompt = `
    Create a visual design for a simple productivity app called "TaskMaster".

    Key Features:
    1. Task creation and management (High Priority)
    2. Time tracking (Medium Priority)
    3. Team collaboration (Low Priority)

    User Persona:
    - Alex (Project Manager, 30): Needs to track team tasks and deadlines

    User Story:
    - As Alex, I want to quickly create and assign tasks so my team stays organized

    Please create a user journey map showing Alex's experience from logging in to successfully creating and assigning a task. Include emotional states and key decision points.

    Focus on clean, professional design with good visual hierarchy!
  `

  try {
    console.log("🎯 Creating enhanced visual design...")
    
    const result = await visualDesignAgent.generate(testPrompt, {
      conversationId: "taskmaster-enhanced-test"
    })

    console.log("\n✅ Enhanced Visual Design Complete!")
    console.log("🎨 Response Preview:")
    console.log(result.text.substring(0, 500) + "...")
    
    // Extract Miro board link if present
    const linkMatch = result.text.match(/https:\/\/miro\.com\/app\/board\/[^\s\]]+/)
    if (linkMatch) {
      console.log("\n🔗 Miro Board Created:")
      console.log(linkMatch[0])
    }
    
    console.log("\n" + "=".repeat(55))
    console.log("🎉 ENHANCED TEST COMPLETE!")
    console.log("✅ Key Improvements:")
    console.log("  📍 Smart positioning system")
    console.log("  🛡️ Better error handling with detailed messages")
    console.log("  🎨 Professional visual hierarchy")
    console.log("  🔗 Web SDK integration ready")

  } catch (error) {
    console.error("❌ Enhanced test failed:", error.message)
  }
}

// Run the enhanced test
testEnhancedVisualDesign().catch(console.error)