import { createWorkflow } from "@mastra/core/workflows"
import { z } from "zod"
import { ideaGenerationStep } from "./steps/ideaGenerationStep"

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
    status: z.enum(["completed", "waiting_for_input", "error"]),
  }),
})
  .then(ideaGenerationStep)
  // FIXED: Use async function for map
  .map(async ({ inputData, getStepResult }) => {
    const ideaResult = getStepResult(ideaGenerationStep)
    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`

    return {
      sessionId,
      currentStep: "idea-generation-completed",
      ideaAnalysis: {
        refinedIdea: ideaResult.refinedIdea,
        userPersonas: ideaResult.userPersonas,
        clarifyingQuestions: ideaResult.clarifyingQuestions,
        marketValidation: ideaResult.marketValidation,
        nextSteps: ideaResult.nextSteps,
      },
      status:
        ideaResult.clarifyingQuestions.length > 0
          ? "waiting_for_input"
          : ("completed" as const),
    }
  })
  .commit()
// Test function for the workflow
export async function testProductDevelopmentWorkflow() {
  console.log("🚀 Testing Product Development Workflow - Idea Generation Step")

  const run = await productDevelopmentWorkflow.createRunAsync()

  const result = await run.start({
    inputData: {
      rawIdea:
        "I want to create a habit tracking app that helps people build better daily routines with gamification elements",
      additionalContext:
        "Target audience is young professionals who struggle with consistency",
    },
  })

  console.log("📊 Workflow Result:")
  console.log(JSON.stringify(result, null, 2))

  return result
}
