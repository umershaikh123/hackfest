// End-to-end PRD generation test
import "dotenv/config"

async function testEndToEndPRD() {
  console.log("🚀 End-to-End PRD Generation Test")
  console.log("=".repeat(40))

  try {
    // Step 1: Generate PRD content
    console.log("\n1️⃣ Generating PRD content...")
    const { testPRDGeneratorTool } = await import("../mastra/tools/prdGeneratorTool")
    
    const prdContent = await testPRDGeneratorTool()
    console.log(`✅ Generated ${prdContent.notionBlocks.length} content blocks`)
    
    // Step 2: Publish to Notion
    console.log("\n2️⃣ Publishing to Notion...")
    const { notionTool } = await import("../mastra/tools/notionTool")
    
    const notionResult = await notionTool.execute({
      context: {
        type: "create_page",
        databaseId: process.env.NOTION_PRD_DATABASE_ID!,
        title: prdContent.title,
        properties: prdContent.notionProperties,
        content: prdContent.notionBlocks,
      },
      runtimeContext: {} as any,
    })

    if (notionResult.success) {
      console.log("✅ Initial page created successfully!")
      console.log("📄 PRD Title:", prdContent.title)
      console.log("📊 Initial blocks:", prdContent.notionBlocks.length)
      console.log("🔗 Notion URL:", notionResult.pageUrl)

      // Append additional blocks if they exist
      if (prdContent.additionalBlocks && prdContent.additionalBlocks.length > 0) {
        console.log(`\n3️⃣ Appending ${prdContent.additionalBlocks.length} additional blocks...`)
        
        const appendResult = await notionTool.execute({
          context: {
            type: "append_blocks",
            pageId: notionResult.pageId!,
            blocks: prdContent.additionalBlocks,
          },
          runtimeContext: {} as any,
        })

        if (appendResult.success) {
          console.log("✅ Additional blocks appended successfully!")
          console.log("🎉 SUCCESS! Complete PRD generated and published!")
          console.log(`📊 Total blocks: ${prdContent.notionBlocks.length + prdContent.additionalBlocks.length}`)
          console.log("\n✨ Your PRD is ready in Notion!")
        } else {
          console.log("⚠️ Initial page created but failed to append additional blocks:", appendResult.message)
        }
      } else {
        console.log("🎉 SUCCESS! Complete PRD generated and published!")
        console.log("\n✨ Your PRD is ready in Notion!")
      }
    } else {
      console.log("❌ Failed to publish:", notionResult.message)
    }

  } catch (error) {
    console.error("❌ Error:", error)
  }
}

testEndToEndPRD()