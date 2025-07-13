// src/mastra/workflows/steps/prdGenerationStep.ts

import { createStep } from "@mastra/core/workflows"
import { z } from "zod"
import "dotenv/config"
import { ProductIdeaSchema, UserPersonaSchema, UserStorySchema } from "../../../types/productMaestro"
import { generateAndPublishPRD } from "../../agents/prdAgent"

// Input schema for PRD generation step
const PRDGenerationStepInputSchema = z.object({
  productIdea: ProductIdeaSchema,
  userPersonas: z.array(UserPersonaSchema),
  userStories: z.array(UserStorySchema),
  additionalContext: z.string().optional(),
  databaseId: z.string().optional().describe("Notion database ID - will use env var if not provided"),
})

// Output schema for PRD generation step
const PRDGenerationStepOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  notionPageUrl: z.string().optional(),
  notionPageId: z.string().optional(),
  prdTitle: z.string(),
  timestamp: z.string(),
  readyForNextStep: z.boolean(),
  recommendations: z.array(z.string()),
  nextSteps: z.array(z.string()),
})

export const prdGenerationStep = createStep({
  id: "prd-generation-step",
  description: "Generate comprehensive Product Requirements Document and publish to Notion",
  inputSchema: PRDGenerationStepInputSchema,
  outputSchema: PRDGenerationStepOutputSchema,
  execute: async ({ inputData }) => {
    try {
      console.log(`🔄 Executing PRD Generation Step for: ${inputData.productIdea.title}`)

      // Validate required environment variables
      const databaseId = inputData.databaseId || process.env.NOTION_PRD_DATABASE_ID
      
      if (!databaseId) {
        return {
          success: false,
          message: "Notion database ID not configured. Please set NOTION_PRD_DATABASE_ID environment variable.",
          prdTitle: inputData.productIdea.title,
          timestamp: new Date().toISOString(),
          readyForNextStep: false,
          recommendations: [
            "Configure Notion integration by setting NOTION_API_KEY and NOTION_PRD_DATABASE_ID environment variables",
            "Create a Notion database for PRDs with appropriate properties",
            "Ensure the Notion integration has write access to the database"
          ],
          nextSteps: [
            "Set up Notion integration",
            "Retry PRD generation once Notion is configured"
          ],
        }
      }

      if (!process.env.NOTION_API_KEY) {
        return {
          success: false,
          message: "Notion API key not configured. Please set NOTION_API_KEY environment variable.",
          prdTitle: inputData.productIdea.title,
          timestamp: new Date().toISOString(),
          readyForNextStep: false,
          recommendations: [
            "Create a Notion integration and obtain an API key",
            "Set the NOTION_API_KEY environment variable",
            "Ensure the integration has access to your PRD database"
          ],
          nextSteps: [
            "Configure Notion API credentials",
            "Retry PRD generation"
          ],
        }
      }

      // Generate and publish PRD using the PRD agent
      const result = await generateAndPublishPRD({
        productIdea: inputData.productIdea,
        userPersonas: inputData.userPersonas,
        userStories: inputData.userStories,
        additionalContext: inputData.additionalContext,
        databaseId,
      })

      // Determine next steps and recommendations based on success
      let recommendations: string[] = []
      let nextSteps: string[] = []
      let readyForNextStep = false

      if (result.success) {
        readyForNextStep = true
        recommendations = [
          "Review the generated PRD with stakeholders for feedback",
          "Share the PRD with development team for technical feasibility review",
          "Use the PRD as input for sprint planning and project estimation",
          "Consider creating wireframes and visual mockups based on the PRD requirements"
        ]
        nextSteps = [
          "Stakeholder review and approval",
          "Technical feasibility assessment", 
          "Sprint planning and roadmap creation",
          "Design and prototyping phase"
        ]
      } else {
        recommendations = [
          "Check Notion integration configuration and permissions",
          "Verify that the database ID is correct and accessible",
          "Review error messages and resolve any configuration issues",
          "Consider retrying PRD generation after fixing issues"
        ]
        nextSteps = [
          "Troubleshoot Notion integration issues",
          "Retry PRD generation",
          "Contact support if issues persist"
        ]
      }

      console.log(`${result.success ? '✅' : '❌'} PRD Generation Step completed: ${result.message}`)

      return {
        success: result.success,
        message: result.message,
        notionPageUrl: result.notionPageUrl,
        notionPageId: result.notionPageId,
        prdTitle: result.prdTitle || inputData.productIdea.title,
        timestamp: new Date().toISOString(),
        readyForNextStep,
        recommendations,
        nextSteps,
      }
    } catch (error) {
      console.error("❌ PRD Generation Step Error:", error)
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      
      return {
        success: false,
        message: `PRD generation failed: ${errorMessage}`,
        prdTitle: inputData.productIdea.title,
        timestamp: new Date().toISOString(),
        readyForNextStep: false,
        recommendations: [
          "Check application logs for detailed error information",
          "Verify all required environment variables are set",
          "Ensure Notion integration is properly configured",
          "Contact technical support if the issue persists"
        ],
        nextSteps: [
          "Review and fix configuration issues",
          "Retry PRD generation",
          "Escalate to technical support if needed"
        ],
      }
    }
  },
})

// Test function for the PRD generation step
export async function testPRDGenerationStep() {
  console.log("🧪 Testing PRD Generation Step...")

  const sampleInput = {
    productIdea: {
      title: "EcoTracker",
      description: "A sustainability tracking app that helps individuals and families monitor their environmental impact",
      problemStatement: "People want to be more environmentally conscious but lack visibility into their daily impact",
      targetAudience: "Environmentally conscious individuals and families",
      coreFeatures: [
        "Carbon footprint tracking",
        "Sustainable habit suggestions",
        "Impact visualization",
        "Community challenges",
        "Local eco-friendly business directory"
      ],
      businessModel: "Freemium with premium sustainability insights",
      marketCategory: "Sustainability & Lifestyle"
    },
    userPersonas: [
      {
        name: "Eco-Conscious Parent",
        role: "Primary User",
        demographics: "30-45 year old parent with environmental awareness",
        needs: ["Easy tracking", "Family engagement", "Actionable insights"],
        painPoints: ["Complex carbon calculators", "Lack of family-friendly features", "No local recommendations"],
        goals: ["Reduce family carbon footprint", "Teach kids about sustainability", "Find eco-friendly alternatives"]
      }
    ],
    userStories: [
      {
        id: "US001",
        title: "Track Daily Carbon Footprint",
        persona: "Eco-Conscious Parent",
        userAction: "I want to easily log my daily activities",
        benefit: "so that I can understand my environmental impact",
        acceptanceCriteria: [
          "User can log transportation, energy, and consumption activities",
          "App automatically calculates carbon footprint",
          "Daily, weekly, and monthly summaries are available",
          "User receives tips for reducing impact"
        ],
        priority: "high" as const,
        storyPoints: 8
      }
    ],
    additionalContext: "Focus on simplicity and family engagement features"
  }

  const result = await prdGenerationStep.execute({ inputData: sampleInput })
  
  console.log("🔍 PRD Generation Step Test Result:")
  console.log("✅ Success:", result.success)
  console.log("📄 Message:", result.message)
  console.log("🔗 Notion URL:", result.notionPageUrl)
  console.log("🚀 Ready for Next Step:", result.readyForNextStep)
  console.log("💡 Recommendations:", result.recommendations)
  
  return result
}