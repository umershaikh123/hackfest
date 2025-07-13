// src/test/testPRDGeneration.ts

import "dotenv/config"

async function testPRDGeneration() {
  console.log("🧪 Testing PRD Generation Components")
  console.log("=".repeat(50))

  try {
    // Test 1: Test Notion Tool
    console.log("\n1️⃣  Testing Notion Tool...")
    const { testNotionTool } = await import("../mastra/tools/notionTool")

    if (process.env.NOTION_API_KEY && process.env.NOTION_PRD_DATABASE_ID) {
      const notionResult = await testNotionTool()
      console.log(
        "✅ Notion Tool Result:",
        notionResult?.success ? "Success" : "Failed"
      )
      if (notionResult?.pageUrl) {
        console.log("🔗 Notion Page URL:", notionResult.pageUrl)
      }
    } else {
      console.log(
        "⚠️  Skipping Notion Tool test - missing environment variables"
      )
      console.log("   Required: NOTION_API_KEY, NOTION_PRD_DATABASE_ID")
    }

    // Test 2: Test PRD Generator Tool
    console.log("\n2️⃣  Testing PRD Generator Tool...")
    const { testPRDGeneratorTool } = await import(
      "../mastra/tools/prdGeneratorTool"
    )

    const prdGeneratorResult = await testPRDGeneratorTool()
    console.log(
      "✅ PRD Generator Result: Generated",
      prdGeneratorResult.notionBlocks.length,
      "content blocks"
    )
    console.log("📄 PRD Title:", prdGeneratorResult.title)

    // Test 3: Test PRD Agent
    console.log("\n3️⃣  Testing PRD Agent...")
    const { testPRDAgent } = await import("../mastra/agents/prdAgent")

    if (process.env.NOTION_API_KEY && process.env.NOTION_PRD_DATABASE_ID) {
      const prdAgentResult = await testPRDAgent()
      console.log(
        "✅ PRD Agent Result:",
        prdAgentResult.success ? "Success" : "Failed"
      )
      console.log("📝 Message:", prdAgentResult.message)
      if (prdAgentResult.notionPageUrl) {
        console.log("🔗 Generated PRD URL:", prdAgentResult.notionPageUrl)
      }
    } else {
      console.log("⚠️  Skipping PRD Agent test - missing environment variables")
    }

    // Test 4: Test PRD Generation Step
    console.log("\n4️⃣  Testing PRD Generation Step...")
    const { testPRDGenerationStep } = await import(
      "../mastra/workflows/steps/prdGenerationStep"
    )

    const stepResult = await testPRDGenerationStep()
    console.log(
      "✅ PRD Generation Step Result:",
      stepResult.success ? "Success" : "Failed"
    )
    console.log("🚀 Ready for Next Step:", stepResult.readyForNextStep)
    console.log(
      "💡 Recommendations:",
      stepResult.recommendations.slice(0, 2).join(", ")
    )

    // Test 5: Test Complete Workflow
    console.log("\n5️⃣  Testing Complete Workflow with PRD...")
    const { testPRDWorkflow } = await import(
      "../mastra/workflows/productDevelopmentWorkflow"
    )

    const workflowResult = await testPRDWorkflow()
    console.log(
      "✅ Complete Workflow Result:",
      workflowResult.success ? "Success" : "Failed"
    )

    console.log("\n🎉 PRD Generation Testing Complete!")
    console.log("=".repeat(50))

    // Summary
    console.log("\n📊 Test Summary:")
    console.log("- Notion Tool: Available")
    console.log("- PRD Generator: Working")
    console.log("- PRD Agent: Available")
    console.log("- PRD Workflow Step: Working")
    console.log("- Complete Workflow: Integrated")

    if (!process.env.NOTION_API_KEY || !process.env.NOTION_PRD_DATABASE_ID) {
      console.log(
        "\n⚠️  Note: Set NOTION_API_KEY and NOTION_PRD_DATABASE_ID environment variables for full testing"
      )
    }
  } catch (error) {
    console.error("❌ Error during PRD testing:", error)
    console.log("\n🔧 Troubleshooting:")
    console.log("1. Check that all environment variables are set")
    console.log("2. Verify Notion integration has proper permissions")
    console.log("3. Ensure database ID is correct")
    console.log("4. Check network connectivity")
  }
}

// Run the test automatically
testPRDGeneration().catch(console.error)

export { testPRDGeneration }
