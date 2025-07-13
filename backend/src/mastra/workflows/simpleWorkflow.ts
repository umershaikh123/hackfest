// src/mastra/workflows/simpleWorkflow.ts
import { createWorkflow } from "@mastra/core/workflows"
import { z } from "zod"
import { ideaGenerationStep } from "./steps/ideaGenerationStep"
import { userStoryGenerationStep } from "./steps/userStoryGenerationStep"

const SimpleWorkflowInput = z.object({
  rawIdea: z.string(),
  additionalContext: z.string().optional(),
})

const SimpleWorkflowOutput = z.object({
  sessionId: z.string(),
  status: z.enum(["completed", "failed", "waiting_for_input"]),
  ideaTitle: z.string().optional(),
  userStoriesCount: z.number().optional(),
  message: z.string(),
})

export const simpleWorkflow = createWorkflow({
  id: "simple-workflow",
  description: "Simple workflow to test step chaining",
  inputSchema: SimpleWorkflowInput,
  outputSchema: SimpleWorkflowOutput,
})
  .then(ideaGenerationStep)
  .then(userStoryGenerationStep)
  .map(async ({ inputData, getStepResult }) => {
    const sessionId = `session_${Date.now()}`

    try {
      // Get results from previous steps
      const ideaResult = getStepResult(ideaGenerationStep)
      const userStoryResult = getStepResult(userStoryGenerationStep)

      console.log("🔍 Idea result keys:", Object.keys(ideaResult))
      console.log("🔍 User story result keys:", Object.keys(userStoryResult))
      console.log("📋 Idea title:", ideaResult.refinedIdea?.title)
      console.log("📖 User stories count:", userStoryResult.userStories?.length)

      return {
        sessionId,
        status: "completed" as const,
        ideaTitle: ideaResult.refinedIdea?.title,
        userStoriesCount: userStoryResult.userStories?.length || 0,
        message: `Successfully processed idea: ${ideaResult.refinedIdea?.title || "Unknown"} with ${userStoryResult.userStories?.length || 0} user stories`,
      }
    } catch (error) {
      console.error("❌ Simple workflow error:", error)
      return {
        sessionId,
        status: "failed" as const,
        message: `Workflow failed: ${error}`,
      }
    }
  })
  .commit()

export async function testSimpleWorkflow() {
  console.log("🧪 Testing Simple Workflow...")

  const run = await simpleWorkflow.createRunAsync()

  const result = await run.start({
    inputData: {
      rawIdea: "A simple habit tracker for students",
      additionalContext: "Should be easy to use and gamified",
    },
  })

  console.log("✅ Simple workflow result:")

  console.log(`📈 Status: ${result.status}`)

  return result
}
