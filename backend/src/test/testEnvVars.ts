// Test environment variables
import "dotenv/config"

console.log("🔍 Testing Environment Variables...")
console.log("=".repeat(50))

console.log("✅ NOTION_API_KEY:", process.env.NOTION_API_KEY ? "✅ Set" : "❌ Missing")
console.log("✅ NOTION_PRD_DATABASE_ID:", process.env.NOTION_PRD_DATABASE_ID ? "✅ Set" : "❌ Missing")

if (process.env.NOTION_API_KEY) {
  console.log("   NOTION_API_KEY starts with:", process.env.NOTION_API_KEY.substring(0, 10) + "...")
}

if (process.env.NOTION_PRD_DATABASE_ID) {
  console.log("   NOTION_PRD_DATABASE_ID:", process.env.NOTION_PRD_DATABASE_ID)
}

console.log("=".repeat(50))