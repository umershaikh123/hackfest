// src/mastra/workflows/steps/userStoryGenerationStep.ts

import { createStep } from "@mastra/core/workflows"
import { z } from "zod"
import { userStoryGeneratorAgent } from "../../agents/userStoryGeneratorAgent"
import {
  ProductIdeaSchema,
  UserPersonaSchema,
  UserStorySchema,
} from "../../../types/productMaestro"

export const userStoryGenerationStep = createStep({
  id: "user-story-generation-step",
  description:
    "Generate comprehensive user stories from refined product ideas and user personas",
  inputSchema: z.object({
    refinedIdea: ProductIdeaSchema,
    userPersonas: z.array(UserPersonaSchema),
    clarifyingQuestions: z.array(z.string()),
    marketValidation: z.object({
      similarProducts: z.array(z.string()),
      uniqueValueProposition: z.string(),
      marketSize: z.string(),
      competitiveAdvantage: z.string(),
    }),
    nextSteps: z.array(z.string()),
    agentResponse: z
      .string()
      .describe("Full response from the idea generation agent"),
    userFeedback: z
      .string()
      .optional()
      .describe("User responses to clarifying questions"),
    focusAreas: z
      .array(z.string())
      .optional()
      .describe("Specific areas to focus on"),
    userEmail: z.string().optional().describe("User's email for tracking"),
  }),
  outputSchema: z.object({
    epics: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        stories: z.array(z.string()), // Story IDs
      })
    ),
    userStories: z.array(UserStorySchema),
    implementationOrder: z.array(z.string()),
    mvpStories: z.array(z.string()),
    totalEstimate: z.object({
      storyPoints: z.number(),
      estimatedSprints: z.number(),
    }),
    recommendations: z.array(z.string()),
    agentResponse: z
      .string()
      .describe("Full response from the user story agent"),
    readyForNextStep: z
      .boolean()
      .describe("Whether we have enough stories to proceed"),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    const {
      refinedIdea,
      userPersonas,
      clarifyingQuestions,
      marketValidation,
      nextSteps,
      agentResponse: previousAgentResponse,
      userFeedback,
      focusAreas,
      userEmail,
    } = inputData

    // Construct the prompt for the agent
    let prompt = `
I need to create comprehensive user stories for my product. Here are the details:

**Product Idea:**
- Title: ${refinedIdea.title}
- Description: ${refinedIdea.description}
- Problem: ${refinedIdea.problemStatement}
- Target Audience: ${refinedIdea.targetAudience}
- Core Features: ${refinedIdea.coreFeatures.join(", ")}
- Business Model: ${refinedIdea.businessModel}
- Market Category: ${refinedIdea.marketCategory}

**User Personas:**
${userPersonas
  .map(
    persona => `
- ${persona.name} (${persona.role}):
  Demographics: ${persona.demographics}
  Needs: ${persona.needs.join(", ")}
  Pain Points: ${persona.painPoints.join(", ")}
  Goals: ${persona.goals.join(", ")}
`
  )
  .join("")}
`

    // Add user feedback if provided
    if (userFeedback && clarifyingQuestions?.length) {
      prompt += `\n**Additional Context from User:**\n${userFeedback}\n`
    }

    // Add focus areas if specified
    if (focusAreas?.length) {
      prompt += `\n**Focus Areas:**\n${focusAreas.join(", ")}\n`
    }

    prompt += `
Please generate a comprehensive set of user stories that includes:

1. **User Onboarding & Account Management** - Registration, profile setup, initial configuration
2. **Core Feature Stories** - Based on the core features identified
3. **User Experience Stories** - Navigation, search, settings, accessibility
4. **Advanced Feature Stories** - Secondary features that add value

For each story, please provide:
- Clear user story format (As a [persona], I want to [action] so that [benefit])
- Detailed acceptance criteria
- Appropriate priority level (critical/high/medium/low)
- Story point estimate (1, 2, 3, 5, 8, 13)

Organize the stories into logical epics and provide implementation recommendations.
`

    if (userEmail) {
      prompt += `\nThis is for user: ${userEmail}`
    }

    // Call the user story generation agent
    const agentResponse = await userStoryGeneratorAgent.generate(prompt, {
      maxSteps: 5,
      runtimeContext,
    })

    // Extract structured output from agent tool usage
    let structuredOutput

    // Check if the agent used the user story generation tool
    if (agentResponse.steps && agentResponse.steps.length > 0) {
      for (const step of agentResponse.steps) {
        if (step.toolCalls && step.toolCalls.length > 0) {
          for (const toolCall of step.toolCalls) {
            if (
              toolCall.toolName === "userStoryGeneratorTool" &&
              step.toolResults
            ) {
              const toolResult = step.toolResults.find(
                r => r.toolCallId === toolCall.toolCallId
              )
              if (toolResult) {
                structuredOutput = toolResult.result
                break
              }
            }
          }
        }
      }
    }

    // If we don't have structured output from the tool, create a fallback
    if (!structuredOutput) {
      structuredOutput = parseAgentResponseFallback(
        agentResponse.text,
        refinedIdea,
        userPersonas
      )
    }

    // Determine if we're ready for the next step
    const readyForNextStep =
      structuredOutput.userStories.length >= 5 &&
      structuredOutput.mvpStories.length >= 3

    return {
      epics: structuredOutput.epics,
      userStories: structuredOutput.userStories,
      implementationOrder: structuredOutput.implementationOrder,
      mvpStories: structuredOutput.mvpStories,
      totalEstimate: structuredOutput.totalEstimate,
      recommendations: structuredOutput.recommendations,
      agentResponse: agentResponse.text,
      readyForNextStep,
    }
  },
})

// Fallback function to parse agent response if tool wasn't used
function parseAgentResponseFallback(
  agentText: string,
  refinedIdea: any,
  userPersonas: any[]
) {
  // Extract user stories from the agent text using simple parsing
  const userStories = extractUserStoriesFromText(agentText, userPersonas)

  // Create basic epics
  const epics = [
    {
      name: "User Onboarding",
      description: "User registration and initial setup",
      stories: userStories
        .filter(s => s.id.includes("onboard") || s.id.includes("register"))
        .map(s => s.id),
    },
    {
      name: "Core Features",
      description: "Main product functionality",
      stories: userStories
        .filter(s => !s.id.includes("onboard") && !s.id.includes("register"))
        .map(s => s.id),
    },
  ]

  // Basic implementation order (critical first)
  const implementationOrder = userStories
    .sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
    .map(s => s.id)

  // MVP is critical and high priority stories
  const mvpStories = userStories
    .filter(s => s.priority === "critical" || s.priority === "high")
    .map(s => s.id)

  const totalStoryPoints = userStories.reduce(
    (sum, story) => sum + story.storyPoints,
    0
  )

  return {
    epics,
    userStories,
    implementationOrder,
    mvpStories,
    totalEstimate: {
      storyPoints: totalStoryPoints,
      estimatedSprints: Math.ceil(totalStoryPoints / 20),
    },
    recommendations: [
      "Start with critical user stories for MVP",
      "Focus on core functionality before advanced features",
      "Consider user feedback for story refinement",
    ],
  }
}

function extractUserStoriesFromText(text: string, personas: any[]): any[] {
  // This is a simplified parser - in production, you'd want more sophisticated parsing
  const stories: any[] = []
  let storyCounter = 1

  // Look for "As a" patterns
  const storyMatches =
    text.match(/As a [^,]+, I want [^,]+, so that [^.]+/gi) || []

  storyMatches.forEach((match, index) => {
    const parts = match.match(/As a ([^,]+), I want ([^,]+), so that (.+)/i)
    if (parts) {
      const persona = parts[1].trim()
      const action = parts[2].trim()
      const benefit = parts[3].trim()

      stories.push({
        id: `story-${storyCounter++}`,
        title: action.charAt(0).toUpperCase() + action.slice(1),
        persona,
        userAction: action,
        benefit,
        acceptanceCriteria: [
          "Feature works as described",
          "User interface is intuitive",
          "Performance is acceptable",
        ],
        priority: index < 3 ? "critical" : index < 6 ? "high" : "medium",
        storyPoints: index < 3 ? 5 : index < 6 ? 3 : 2,
      })
    }
  })

  // Add some default stories if none were found
  if (stories.length === 0) {
    stories.push(
      {
        id: "story-1",
        title: "User Registration",
        persona: personas[0]?.name || "User",
        userAction: "create an account",
        benefit: "I can access the app securely",
        acceptanceCriteria: [
          "User can register with email and password",
          "Email verification is required",
          "User profile is created successfully",
        ],
        priority: "critical",
        storyPoints: 3,
      },
      {
        id: "story-2",
        title: "Core Feature Access",
        persona: personas[0]?.name || "User",
        userAction: "access main features",
        benefit: "I can accomplish my primary goals",
        acceptanceCriteria: [
          "Main features are accessible from dashboard",
          "Features work as expected",
          "User can navigate easily",
        ],
        priority: "critical",
        storyPoints: 5,
      }
    )
  }

  return stories
}
