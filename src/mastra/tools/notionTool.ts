// src/mastra/tools/notionTool.ts

import { createTool } from "@mastra/core/tools"
import { Client } from "@notionhq/client"
import { z } from "zod"
import "dotenv/config"

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// Input schema for different Notion operations - simplified for Gemini compatibility
const NotionToolInputSchema = z.object({
  type: z.enum(["create_page", "append_blocks"]).describe("Type of Notion operation"),
  databaseId: z.string().optional().describe("Notion database ID where the page will be created (required for create_page)"),
  title: z.string().optional().describe("Page title (required for create_page)"),
  properties: z.record(z.any()).optional().describe("Database properties for the page (required for create_page)"),
  content: z.array(z.record(z.any())).optional().describe("Array of Notion block objects for page content"),
  pageId: z.string().optional().describe("Notion page ID to append blocks to (required for append_blocks)"),
  blocks: z.array(z.record(z.any())).optional().describe("Array of Notion block objects to append (required for append_blocks)"),
})

// Output schema
const NotionToolOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  pageUrl: z.string().optional().describe("URL of the created/updated Notion page"),
  pageId: z.string().optional().describe("ID of the created/updated Notion page"),
})

export const notionTool = createTool({
  id: "notion-tool",
  description: "General-purpose tool for interacting with Notion API - create pages and append blocks",
  inputSchema: NotionToolInputSchema,
  outputSchema: NotionToolOutputSchema,
  execute: async ({ context, runtimeContext }) => {
    try {
      if (!process.env.NOTION_API_KEY) {
        throw new Error("NOTION_API_KEY environment variable is not set")
      }

      switch (context.type) {
        case "create_page": {
          if (!context.databaseId || !context.title || !context.properties) {
            throw new Error("databaseId, title, and properties are required for create_page operation")
          }

          console.log(`🔄 Creating Notion page: ${context.title}`)

          const response = await notion.pages.create({
            parent: {
              database_id: context.databaseId,
            },
            properties: context.properties,
            children: context.content || [],
          })

          const pageUrl = `https://notion.so/${response.id.replace(/-/g, "")}`

          console.log(`✅ Successfully created Notion page: ${pageUrl}`)

          return {
            success: true,
            message: `Successfully created Notion page: ${context.title}`,
            pageUrl,
            pageId: response.id,
          }
        }

        case "append_blocks": {
          if (!context.pageId || !context.blocks) {
            throw new Error("pageId and blocks are required for append_blocks operation")
          }
          console.log(`🔄 Appending ${context.blocks.length} blocks to page ${context.pageId}`)

          await notion.blocks.children.append({
            block_id: context.pageId,
            children: context.blocks,
          })

          const pageUrl = `https://notion.so/${context.pageId.replace(/-/g, "")}`

          console.log(`✅ Successfully appended blocks to Notion page`)

          return {
            success: true,
            message: `Successfully appended ${context.blocks.length} blocks to page`,
            pageUrl,
            pageId: context.pageId,
          }
        }

        default:
          return {
            success: false,
            message: "Invalid operation type. Must be 'create_page' or 'append_blocks'",
          }
      }
    } catch (error) {
      console.error("❌ Notion API Error:", error)

      let errorMessage = "Unknown error occurred"
      if (error instanceof Error) {
        errorMessage = error.message
      }

      // Handle specific Notion API errors for better feedback
      if (errorMessage.includes("Invalid database_id")) {
        errorMessage = "Invalid database ID. Please check your NOTION_PRD_DATABASE_ID environment variable."
      } else if (errorMessage.includes("Unauthorized") || errorMessage.includes("token is invalid")) {
        errorMessage = "Unauthorized access. Please check your NOTION_API_KEY and ensure the integration has access to the database."
      } else if (errorMessage.includes("Object not found")) {
        errorMessage = "Database or page not found. Please verify the database/page ID and integration permissions."
      } else if (errorMessage.includes("body failed validation")) {
        errorMessage = `Notion API validation error: ${errorMessage}. Check your block JSON structure or property values.`
      }

      return {
        success: false,
        message: `Notion API error: ${errorMessage}`,
      }
    }
  },
})

// Helper functions for creating common Notion block types
export const createNotionBlocks = {
  heading1: (text: string) => ({
    object: "block",
    type: "heading_1",
    heading_1: {
      rich_text: [{ type: "text", text: { content: text } }],
    },
  }),

  heading2: (text: string) => ({
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: [{ type: "text", text: { content: text } }],
    },
  }),

  heading3: (text: string) => ({
    object: "block",
    type: "heading_3",
    heading_3: {
      rich_text: [{ type: "text", text: { content: text } }],
    },
  }),

  paragraph: (text: string) => ({
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [{ type: "text", text: { content: text } }],
    },
  }),

  bulletedList: (items: string[]) =>
    items.map(item => ({
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [{ type: "text", text: { content: item } }],
      },
    })),

  numberedList: (items: string[]) =>
    items.map(item => ({
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [{ type: "text", text: { content: item } }],
      },
    })),

  divider: () => ({
    object: "block",
    type: "divider",
    divider: {},
  }),

  callout: (text: string, emoji: string = "💡") => ({
    object: "block",
    type: "callout",
    callout: {
      rich_text: [{ type: "text", text: { content: text } }],
      icon: { type: "emoji", emoji },
    },
  }),

  code: (code: string, language: string = "plain text") => ({
    object: "block",
    type: "code",
    code: {
      rich_text: [{ type: "text", text: { content: code } }],
      language,
    },
  }),

  toggle: (title: string, children: any[]) => ({
    object: "block",
    type: "toggle",
    toggle: {
      rich_text: [{ type: "text", text: { content: title } }],
      children: children,
    },
  }),
}

// Test function for the Notion tool
export async function testNotionTool() {
  const databaseId = process.env.NOTION_PRD_DATABASE_ID

  if (!databaseId) {
    console.error("❌ NOTION_PRD_DATABASE_ID environment variable is not set")
    return {
      success: false,
      message: "NOTION_PRD_DATABASE_ID not configured"
    }
  }

  console.log("🧪 Testing Notion Tool...")

  // Test creating a page
  const result = await notionTool.execute({
    context: {
      type: "create_page",
      databaseId,
      title: "Test PRD - Product Maestro",
      properties: {
        Name: {
          title: [
            {
              text: {
                content: "Test PRD - Product Maestro",
              },
            },
          ],
        },
        Status: {
          select: {
            name: "Draft",
          },
        },
        Version: {
          rich_text: [
            {
              text: {
                content: "1.0",
              },
            },
          ],
        },
        Priority: {
          select: {
            name: "High",
          },
        },
      },
      content: [
        createNotionBlocks.heading1("Executive Summary"),
        createNotionBlocks.paragraph("This is a test PRD created by the Notion Tool to verify integration."),
        createNotionBlocks.heading2("Problem Statement"),
        createNotionBlocks.paragraph("Testing the integration between Product Maestro and Notion API."),
        createNotionBlocks.heading3("Features"),
        ...createNotionBlocks.bulletedList([
          "Feature 1: Test feature for validation",
          "Feature 2: Another test feature",
          "Feature 3: Integration verification feature",
        ]),
        createNotionBlocks.divider(),
        createNotionBlocks.callout("This is a test document generated automatically.", "🧪"),
      ],
    },
    runtimeContext: {} as any, // Required by Mastra tool interface
  })

  console.log("🔍 Test Result:", result)
  return result
}