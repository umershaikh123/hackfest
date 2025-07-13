// Quick test for Notion access only
import "dotenv/config"
import { testNotionTool } from "../mastra/tools/notionTool"

async function quickNotionTest() {
  console.log("🔍 Quick Notion Access Test")
  console.log("=".repeat(30))
  
  console.log("📋 Database ID:", process.env.NOTION_PRD_DATABASE_ID)
  console.log("🔑 API Key starts with:", process.env.NOTION_API_KEY?.substring(0, 10) + "...")
  
  console.log("\n🧪 Testing Notion connection...")
  
  try {
    const result = await testNotionTool()
    if (result?.success) {
      console.log("✅ SUCCESS! Notion integration is working!")
      console.log("🔗 Created page:", result.pageUrl)
    } else {
      console.log("❌ FAILED:", result?.message)
      console.log("\n🔧 Next steps:")
      console.log("1. Go to your Notion database")
      console.log("2. Click 'Share' in the top right")
      console.log("3. Add your integration to the database")
      console.log("4. Grant 'Can edit' permissions")
    }
  } catch (error) {
    console.log("❌ ERROR:", error)
  }
}

quickNotionTest()