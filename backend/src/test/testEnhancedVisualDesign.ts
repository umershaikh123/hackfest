// Test Enhanced Visual Design Tool
import { testVisualDesignTool } from "../mastra/tools/visualDesignTool.js"

async function runEnhancedTest() {
  console.log("🧪 Testing Enhanced Visual Design Tool...")
  
  try {
    const result = await testVisualDesignTool()
    console.log("✅ Enhanced Visual Design Tool test completed!")
    console.log(`🎨 Items Created: ${result.visualElements.itemsCreated}`)
    console.log(`🔗 Board URL: ${result.miroBoard.viewLink}`)
    console.log(`💡 Success: ${result.success}`)
    console.log(`📊 Elements Breakdown:`, result.visualElements.elementsBreakdown)
    
    return result
  } catch (error) {
    console.error("❌ Enhanced Visual Design test failed:", error.message)
    throw error
  }
}

// Run if called directly
if (import.meta.url.includes(process.argv[1])) {
  runEnhancedTest()
    .then(() => console.log("🏁 Enhanced test completed"))
    .catch(console.error)
}

export { runEnhancedTest }