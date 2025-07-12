// src/mastra/workflows/productDevelopmentWorkflow.ts

import { createWorkflow } from "@mastra/core/workflows"
import { z } from "zod"
import { ideaGenerationStep } from "./steps/ideaGenerationStep"
import { userStoryGenerationStep } from "./steps/userStoryGenerationStep"
import { prdGenerationStep } from "./steps/prdGenerationStep"

export const productDevelopmentWorkflow = createWorkflow({
  id: "product-development-workflow",
  description: "Complete product development workflow from idea to sprint plan",
  inputSchema: z.object({
    rawIdea: z.string().describe("Initial product idea from the user"),
    additionalContext: z.string().optional(),
    userEmail: z.string().optional().describe("User's email for tracking"),
    notionDatabaseId: z.string().optional().describe("Notion database ID for PRD publishing"),
  }),
  outputSchema: z.object({
    sessionId: z.string(),
    currentStep: z.string(),
    ideaAnalysis: z.object({
      refinedIdea: z.any(),
      userPersonas: z.array(z.any()),
      clarifyingQuestions: z.array(z.string()),
      marketValidation: z.any(),
      nextSteps: z.array(z.string()),
    }),
    userStoryAnalysis: z.object({
      epics: z.array(z.any()),
      userStories: z.array(z.any()),
      implementationOrder: z.array(z.string()),
      mvpStories: z.array(z.string()),
      totalEstimate: z.any(),
      recommendations: z.array(z.string()),
      readyForNextStep: z.boolean(),
    }),
    prdAnalysis: z.object({
      success: z.boolean(),
      message: z.string(),
      notionPageUrl: z.string().optional(),
      notionPageId: z.string().optional(),
      prdTitle: z.string(),
      timestamp: z.string(),
      readyForNextStep: z.boolean(),
      recommendations: z.array(z.string()),
      nextSteps: z.array(z.string()),
    }).optional(),
    status: z.enum([
      "completed",
      "waiting_for_input",
      "error",
      "ready_for_wireframes",
      "prd_published",
      "prd_failed",
    ]),
    nextStepSuggestions: z.array(z.string()),
  }),
})
  .then(ideaGenerationStep)
  .then(userStoryGenerationStep)
  .then(prdGenerationStep)
  .map(async ({ inputData, getStepResult }) => {
    const ideaResult = getStepResult(ideaGenerationStep)
    const userStoryResult = getStepResult(userStoryGenerationStep)
    const prdResult = getStepResult(prdGenerationStep)

    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`

    // Determine current status based on results
    let status:
      | "completed"
      | "waiting_for_input"
      | "error"
      | "ready_for_wireframes"
      | "prd_published"
      | "prd_failed" = "completed"
    let currentStep = "prd-generation-completed"

    if (prdResult?.success) {
      status = "prd_published"
      currentStep = "prd-published"
    } else if (prdResult && !prdResult.success) {
      status = "prd_failed"
      currentStep = "prd-failed"
    } else if (userStoryResult.readyForNextStep) {
      status = "ready_for_wireframes"
      currentStep = "ready-for-wireframes"
    } else if (ideaResult.clarifyingQuestions.length > 0) {
      status = "waiting_for_input"
      currentStep = "waiting-for-clarification"
    }

    // Generate next step suggestions based on PRD generation status
    const nextStepSuggestions: string[] = []
    if (prdResult?.success) {
      nextStepSuggestions.push(
        "Review the generated PRD in Notion with stakeholders",
        "Create wireframes and visual mockups based on PRD requirements",
        "Plan development sprints using the PRD as reference",
        "Conduct technical feasibility assessment"
      )
    } else if (prdResult && !prdResult.success) {
      nextStepSuggestions.push(
        "Fix Notion integration configuration issues",
        "Retry PRD generation after resolving errors",
        "Contact support if Notion integration problems persist"
      )
    } else if (userStoryResult.readyForNextStep) {
      nextStepSuggestions.push(
        "Generate comprehensive Product Requirements Document",
        "Create wireframes and visual mockups for key user stories",
        "Plan initial development sprints"
      )
    } else {
      nextStepSuggestions.push(
        "Review and refine the generated user stories",
        "Add more detailed acceptance criteria",
        "Consider additional edge cases and user scenarios"
      )
    }

    return {
      sessionId,
      currentStep,
      ideaAnalysis: {
        refinedIdea: ideaResult.refinedIdea,
        userPersonas: ideaResult.userPersonas,
        clarifyingQuestions: ideaResult.clarifyingQuestions,
        marketValidation: ideaResult.marketValidation,
        nextSteps: ideaResult.nextSteps,
      },
      userStoryAnalysis: {
        epics: userStoryResult.epics,
        userStories: userStoryResult.userStories,
        implementationOrder: userStoryResult.implementationOrder,
        mvpStories: userStoryResult.mvpStories,
        totalEstimate: userStoryResult.totalEstimate,
        recommendations: userStoryResult.recommendations,
        readyForNextStep: userStoryResult.readyForNextStep,
      },
      prdAnalysis: prdResult ? {
        success: prdResult.success,
        message: prdResult.message,
        notionPageUrl: prdResult.notionPageUrl,
        notionPageId: prdResult.notionPageId,
        prdTitle: prdResult.prdTitle,
        timestamp: prdResult.timestamp,
        readyForNextStep: prdResult.readyForNextStep,
        recommendations: prdResult.recommendations,
        nextSteps: prdResult.nextSteps,
      } : undefined,
      status,
      nextStepSuggestions,
    }
  })
  .commit()

// Enhanced test function for the complete workflow
export async function testProductDevelopmentWorkflow() {
  console.log("🚀 Testing Enhanced Product Development Workflow with PRD Generation")

  const run = await productDevelopmentWorkflow.createRunAsync()

  const result = await run.start({
    inputData: {
      rawIdea:
        "I want to create a habit tracking app that helps people build better daily routines with gamification elements",
      additionalContext:
        "Target audience is young professionals who struggle with consistency. Should include social features for accountability.",
      userEmail: "test@example.com",
      notionDatabaseId: process.env.NOTION_PRD_DATABASE_ID,
    },
  })

  console.log("📊 Complete Workflow Result:")
  console.log("=".repeat(60))
  console.log("🔍 Session ID:", result.sessionId)
  console.log("🔍 Current Step:", result.currentStep)
  console.log("🔍 Status:", result.status)
  
  if (result.prdAnalysis) {
    console.log("📄 PRD Analysis:")
    console.log("  ✅ Success:", result.prdAnalysis.success)
    console.log("  📝 Message:", result.prdAnalysis.message)
    console.log("  🔗 Notion URL:", result.prdAnalysis.notionPageUrl)
    console.log("  🚀 Ready for Next Step:", result.prdAnalysis.readyForNextStep)
  }
  
  console.log("💡 Next Step Suggestions:", result.nextStepSuggestions)

  return result
}

// Test function specifically for PRD generation workflow
export async function testPRDWorkflow() {
  console.log("📋 Testing PRD Generation Workflow")

  // Test the PRD generation step directly
  const { testPRDGenerationStep } = await import("./steps/prdGenerationStep")
  
  const prdResult = await testPRDGenerationStep()
  
  console.log("📊 PRD Generation Step Test Complete")
  console.log("✅ Success:", prdResult.success)
  console.log("🔗 Notion URL:", prdResult.notionPageUrl)
  
  return prdResult
}

export async function testUserStoryGeneration() {
  console.log("📋 Testing User Story Generation Step")

  // Test the agent directly instead of the step
  const { testUserStoryGeneratorAgent } = await import(
    "../agents/userStoryGeneratorAgent"
  )

  const userStoryResult = await testUserStoryGeneratorAgent()

  console.log("📊 User Story Generation Agent Test Complete")
  console.log("✅ Agent responded successfully")

  return userStoryResult
}
