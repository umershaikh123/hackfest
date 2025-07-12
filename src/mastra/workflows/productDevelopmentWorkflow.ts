// src/mastra/workflows/productDevelopmentWorkflow.ts

import { createWorkflow } from "@mastra/core/workflows"
import { z } from "zod"
import { ideaGenerationStep } from "./steps/ideaGenerationStep"
import { userStoryGenerationStep } from "./steps/userStoryGenerationStep"

export const productDevelopmentWorkflow = createWorkflow({
  id: "product-development-workflow",
  description: "Complete product development workflow from idea to sprint plan",
  inputSchema: z.object({
    rawIdea: z.string().describe("Initial product idea from the user"),
    additionalContext: z.string().optional(),
    userEmail: z.string().optional().describe("User's email for tracking"),
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
    status: z.enum([
      "completed",
      "waiting_for_input",
      "error",
      "ready_for_wireframes",
    ]),
    nextStepSuggestions: z.array(z.string()),
  }),
})
  .then(ideaGenerationStep)
  .then(userStoryGenerationStep)
  .map(async ({ inputData, getStepResult }) => {
    const ideaResult = getStepResult(ideaGenerationStep)
    const userStoryResult = getStepResult(userStoryGenerationStep)

    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`

    // Determine current status based on results
    let status:
      | "completed"
      | "waiting_for_input"
      | "error"
      | "ready_for_wireframes" = "completed"
    let currentStep = "user-story-generation-completed"

    if (userStoryResult.readyForNextStep) {
      status = "ready_for_wireframes"
      currentStep = "ready-for-wireframes"
    } else if (ideaResult.clarifyingQuestions.length > 0) {
      status = "waiting_for_input"
      currentStep = "waiting-for-clarification"
    }

    // Generate next step suggestions
    const nextStepSuggestions: string[] = []
    if (userStoryResult.readyForNextStep) {
      nextStepSuggestions.push(
        "Create wireframes and visual mockups for key user stories",
        "Generate a comprehensive Product Requirements Document",
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
      status,
      nextStepSuggestions,
    }
  })
  .commit()

// Enhanced test function for the complete workflow
export async function testProductDevelopmentWorkflow() {
  console.log("🚀 Testing Enhanced Product Development Workflow")

  const run = await productDevelopmentWorkflow.createRunAsync()

  const result = await run.start({
    inputData: {
      rawIdea:
        "I want to create a habit tracking app that helps people build better daily routines with gamification elements",
      additionalContext:
        "Target audience is young professionals who struggle with consistency. Should include social features for accountability.",
      userEmail: "test@example.com",
    },
  })

  console.log("📊 Complete Workflow Result:")
  console.log("=".repeat(60))

  return result
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
