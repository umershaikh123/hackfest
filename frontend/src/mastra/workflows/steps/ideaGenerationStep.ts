import { createStep } from "@mastra/core/workflows"
import { z } from "zod"
import { ideaGenerationAgent } from "../../agents/ideaGenerationAgent"
import {
  ProductIdeaSchema,
  UserPersonaSchema,
} from "../../../types.ts/productMaestro"

export const ideaGenerationStep = createStep({
  id: "idea-generation-step",
  description: "Analyze and refine raw product ideas into structured concepts",
  inputSchema: z.object({
    rawIdea: z.string().describe("The initial product idea from the user"),
    additionalContext: z
      .string()
      .optional()
      .describe("Any additional context provided"),
    // FIXED: Match the workflow input schema
    userEmail: z.string().optional().describe("User's email for tracking"),
  }),
  outputSchema: z.object({
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
  }),
  execute: async ({ inputData, runtimeContext }) => {
    const { rawIdea, additionalContext, userEmail } = inputData

    // Construct the prompt for the agent
    let prompt = `I have a product idea I'd like to develop: "${rawIdea}"`

    if (additionalContext) {
      prompt += `\n\nAdditional context: ${additionalContext}`
    }

    if (userEmail) {
      prompt += `\n\nThis is for user: ${userEmail}`
    }

    prompt += `\n\nPlease help me refine this idea into a structured product concept with user personas, market analysis, and next steps.`

    // Call the idea generation agent
    const agentResponse = await ideaGenerationAgent.generate(prompt, {
      maxSteps: 5, // Allow the agent to use its tools
      runtimeContext,
    })

    // The agent should have used the ideaGenerationTool, which returns structured data
    let structuredOutput

    // Check if the agent used the idea generation tool and extract results
    if (agentResponse.steps && agentResponse.steps.length > 0) {
      for (const step of agentResponse.steps) {
        if (step.toolCalls && step.toolCalls.length > 0) {
          for (const toolCall of step.toolCalls) {
            if (
              toolCall.toolName === "ideaGenerationTool" &&
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
      structuredOutput = parseAgentResponseFallback(agentResponse.text, rawIdea)
    }

    return {
      refinedIdea: structuredOutput.refinedIdea,
      userPersonas: structuredOutput.userPersonas,
      clarifyingQuestions: structuredOutput.clarifyingQuestions,
      marketValidation: structuredOutput.marketValidation,
      nextSteps: structuredOutput.nextSteps,
      agentResponse: agentResponse.text,
    }
  },
})

// Fallback function to parse agent response if tool wasn't used
function parseAgentResponseFallback(agentText: string, rawIdea: string) {
  return {
    refinedIdea: {
      title: extractTitle(rawIdea) || "Product Concept",
      description: rawIdea.substring(0, 200),
      problemStatement: extractProblem(agentText) || "Solving user needs",
      targetAudience: extractAudience(agentText) || "General users",
      coreFeatures: extractFeatures(agentText),
      businessModel: extractBusinessModel(agentText) || "To be determined",
      marketCategory: "General Technology",
    },
    userPersonas: [
      {
        name: "Primary User",
        role: "Main target user",
        demographics: "Target demographic",
        needs: ["Core functionality", "Easy to use interface"],
        painPoints: ["Current solutions are inadequate"],
        goals: ["Achieve their objectives efficiently"],
      },
    ],
    clarifyingQuestions: extractQuestions(agentText),
    marketValidation: {
      similarProducts: ["Competitor 1", "Competitor 2"],
      uniqueValueProposition: "Unique approach to solving the problem",
      marketSize: "Market research needed",
      competitiveAdvantage: "Better user experience",
    },
    nextSteps: extractNextSteps(agentText),
  }
}

function extractTitle(text: string): string | null {
  const words = text.split(" ").slice(0, 3)
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("")
}

function extractProblem(text: string): string | null {
  const problemPatterns = [
    /problem[:\s]+([^.]+)/i,
    /challenge[:\s]+([^.]+)/i,
    /issue[:\s]+([^.]+)/i,
  ]

  for (const pattern of problemPatterns) {
    const match = text.match(pattern)
    if (match) return match[1].trim()
  }
  return null
}

function extractAudience(text: string): string | null {
  const audiencePatterns = [
    /target[^:]*:[^.]*?([^.]+)/i,
    /users?[:\s]+([^.]+)/i,
    /audience[:\s]+([^.]+)/i,
  ]

  for (const pattern of audiencePatterns) {
    const match = text.match(pattern)
    if (match) return match[1].trim()
  }
  return null
}

function extractFeatures(text: string): string[] {
  const features: string[] = []
  const featurePatterns = [
    /features?[:\s]+([^.]+)/i,
    /functionality[:\s]+([^.]+)/i,
    /capabilities[:\s]+([^.]+)/i,
  ]

  for (const pattern of featurePatterns) {
    const match = text.match(pattern)
    if (match) {
      const featureText = match[1]
      const splitFeatures = featureText.split(/[,;]/).map(f => f.trim())
      features.push(...splitFeatures)
    }
  }

  return features.length > 0
    ? features
    : ["Core functionality", "User interface", "Data management"]
}

function extractBusinessModel(text: string): string | null {
  const modelPatterns = [
    /business model[:\s]+([^.]+)/i,
    /monetization[:\s]+([^.]+)/i,
    /revenue[:\s]+([^.]+)/i,
  ]

  for (const pattern of modelPatterns) {
    const match = text.match(pattern)
    if (match) return match[1].trim()
  }
  return null
}

function extractQuestions(text: string): string[] {
  const questionMatches = text.match(/\?[^?]*\?/g) || []
  const questions = questionMatches.map(q => q.trim())

  if (questions.length === 0) {
    return [
      "What is the primary problem this product solves?",
      "Who is the target user?",
      "What features are most important for the MVP?",
    ]
  }

  return questions
}

function extractNextSteps(text: string): string[] {
  const stepsPatterns = [
    /next steps?[:\s]+([^.]+)/i,
    /recommendations?[:\s]+([^.]+)/i,
    /action items?[:\s]+([^.]+)/i,
  ]

  for (const pattern of stepsPatterns) {
    const match = text.match(pattern)
    if (match) {
      const stepsText = match[1]
      return stepsText.split(/[,;]/).map(s => s.trim())
    }
  }

  return [
    "Refine the product concept",
    "Create user stories",
    "Design wireframes",
    "Develop PRD",
  ]
}
