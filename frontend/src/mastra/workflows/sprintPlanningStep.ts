// src/mastra/workflows/sprintPlanningStep.ts - Sprint Planning Workflow Step
import { createStep } from "@mastra/core/workflows"
import { z } from "zod"
import { sprintPlannerAgent } from "../agents/sprintPlannerAgent.js"
import { SprintSchema } from "../../types.ts/productMaestro.js"

export const sprintPlanningStep = createStep({
  id: "sprintPlanning",
  inputSchema: z.object({
    productTitle: z.string(),
    features: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        acceptanceCriteria: z.array(z.string()),
        priority: z.enum(["high", "medium", "low"]),
      })
    ),
    userStories: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        persona: z.string(),
        userAction: z.string(),
        benefit: z.string(),
        acceptanceCriteria: z.array(z.string()),
        priority: z.enum(["low", "medium", "high", "critical"]),
        storyPoints: z.number(),
      })
    ),
    teamSize: z.number().default(4),
    sprintLength: z
      .enum(["1 week", "2 weeks", "3 weeks", "4 weeks"])
      .default("2 weeks"),
    totalSprints: z.number().default(3),
    createLinearProject: z.boolean().default(false),
    linearTeamId: z.string().optional(),
    sessionId: z.string(),
  }),
  outputSchema: z.object({
    sprints: z.array(SprintSchema),
    summary: z.object({
      totalStoryPoints: z.number(),
      estimatedDuration: z.string(),
      sprintVelocity: z.number(),
      riskFactors: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
    linearIntegration: z.object({
      enabled: z.boolean(),
      cyclesCreated: z
        .array(
          z.object({
            cycleId: z.string(),
            cycleName: z.string(),
            linearUrl: z.string().optional(),
          })
        )
        .optional(),
      issuesCreated: z
        .array(
          z.object({
            issueId: z.string(),
            issueIdentifier: z.string(),
            title: z.string(),
            cycleId: z.string(),
          })
        )
        .optional(),
      errors: z.array(z.string()).optional(),
    }),
    recommendations: z.array(z.string()),
    nextSteps: z.array(z.string()),
    sessionId: z.string(),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    try {
      console.log(
        `🏃‍♂️ Starting sprint planning for ${inputData.productTitle}...`
      )

      // Validate environment for Linear integration
      if (inputData.createLinearProject) {
        if (!process.env.LINEAR_API_KEY) {
          console.warn(
            "⚠️ Linear integration requested but LINEAR_API_KEY not found"
          )
        }
        if (!inputData.linearTeamId) {
          console.warn(
            "⚠️ Linear integration requested but linearTeamId not provided"
          )
        }
      }

      // Prepare sprint planning message for the agent
      const sprintPlanningMessage = `
        Please create a comprehensive sprint plan for "${
          inputData.productTitle
        }".

        ## Product Features (${inputData.features.length} total):
        ${inputData.features
          .map(f => `- ${f.name} (${f.priority} priority): ${f.description}`)
          .join("\n")}

        ## User Stories (${inputData.userStories.length} total):
        ${inputData.userStories
          .map(
            story =>
              `- ${story.title} (${story.priority}, ${story.storyPoints} points): As a ${story.persona}, I want to ${story.userAction} so that ${story.benefit}`
          )
          .join("\n")}

        ## Team Parameters:
        - Team Size: ${inputData.teamSize} developers
        - Sprint Length: ${inputData.sprintLength}
        - Total Sprints: ${inputData.totalSprints}
        - Linear Integration: ${inputData.createLinearProject ? "Yes" : "No"}
        ${
          inputData.linearTeamId
            ? `- Linear Team ID: ${inputData.linearTeamId}`
            : ""
        }

        Please:
        1. Create logical sprint groupings that maximize value delivery
        2. Estimate realistic timelines and effort
        3. Identify potential risks and dependencies
        4. Provide actionable recommendations for the team
        ${
          inputData.createLinearProject
            ? "5. Set up Linear cycles and issues for project management"
            : ""
        }

        Focus on creating a sustainable development velocity that the team can maintain.
      `

      // Execute sprint planning with the agent
      const agentResponse = await sprintPlannerAgent.generate(
        sprintPlanningMessage,
        {
          toolData: {
            sprintPlannerTool: {
              productTitle: inputData.productTitle,
              features: inputData.features,
              userStories: inputData.userStories,
              teamSize: inputData.teamSize,
              sprintLength: inputData.sprintLength,
              totalSprints: inputData.totalSprints,
              createLinearProject: inputData.createLinearProject,
              linearTeamId: inputData.linearTeamId,
            },
          },
        }
      )

      // Extract tool results if available
      let sprintPlanResult: any = null
      if (agentResponse.toolCalls && agentResponse.toolCalls.length > 0) {
        const sprintToolCall = agentResponse.toolCalls.find(
          call => call.toolName === "sprintPlannerTool"
        )
        if (sprintToolCall) {
          sprintPlanResult = sprintToolCall.result
        }
      }

      // If no tool result, create a basic structure (fallback)
      if (!sprintPlanResult) {
        console.warn(
          "⚠️ No sprint planner tool result found, creating fallback response"
        )
        sprintPlanResult = {
          sprints: [],
          summary: {
            totalStoryPoints: inputData.userStories.reduce(
              (sum, story) => sum + story.storyPoints,
              0
            ),
            estimatedDuration: `${inputData.totalSprints} sprints`,
            sprintVelocity: inputData.teamSize * 8,
            riskFactors: ["Manual sprint planning fallback used"],
            recommendations: ["Use sprint planner tool for detailed planning"],
          },
          linearIntegration: {
            enabled: false,
            errors: ["Sprint planner tool not executed"],
          },
        }
      }

      // Generate comprehensive recommendations
      const recommendations = [
        ...sprintPlanResult.summary.recommendations,
        "Conduct daily standups and sprint retrospectives",
        "Review and refine user stories during sprint planning",
        "Monitor team velocity and adjust future sprint planning",
        ...(sprintPlanResult.linearIntegration.enabled
          ? ["Use Linear cycles for sprint tracking and progress monitoring"]
          : [
              "Consider setting up Linear integration for better project visibility",
            ]),
      ]

      // Generate next steps
      const nextSteps = [
        "Review and approve the sprint plan with your development team",
        "Schedule sprint planning meetings with stakeholders",
        "Set up development environment and repositories",
        "Begin Sprint 1 with team kickoff meeting",
        ...(sprintPlanResult.linearIntegration.enabled
          ? ["Access Linear workspace to track sprint progress"]
          : ["Set up Linear API key and team ID for future integration"]),
        "Plan for sprint retrospectives and continuous improvement",
      ]

      console.log(`✅ Sprint planning completed for ${inputData.productTitle}`)
      console.log(
        `📊 Generated ${sprintPlanResult.sprints.length} sprints with ${sprintPlanResult.summary.sprintVelocity} velocity`
      )

      if (sprintPlanResult.linearIntegration.enabled) {
        console.log(
          `🔗 Linear integration: ${
            sprintPlanResult.linearIntegration.cyclesCreated?.length || 0
          } cycles created`
        )
      }

      return {
        sprints: sprintPlanResult.sprints,
        summary: sprintPlanResult.summary,
        linearIntegration: sprintPlanResult.linearIntegration,
        recommendations,
        nextSteps,
        sessionId: inputData.sessionId,
      }
    } catch (error) {
      console.error("❌ Sprint planning step failed:", error)
      throw new Error(`Sprint planning failed: ${error.message}`)
    }
  },
})

// Export test function for the sprint planning step
export async function testSprintPlanningStep() {
  console.log("🧪 Testing Sprint Planning Step...")

  const testInput = {
    productTitle: "EcoTracker App",
    features: [
      {
        name: "Carbon Footprint Tracking",
        description: "Track daily activities and calculate carbon emissions",
        acceptanceCriteria: [
          "Activity input form",
          "Emission calculations",
          "Daily/weekly/monthly views",
        ],
        priority: "high" as const,
      },
      {
        name: "Green Challenges",
        description: "Community challenges to reduce environmental impact",
        acceptanceCriteria: [
          "Challenge creation",
          "Progress tracking",
          "Leaderboards",
        ],
        priority: "medium" as const,
      },
    ],
    userStories: [
      {
        id: "US001",
        title: "Track daily commute",
        persona: "Environmental Conscious Commuter",
        userAction: "log my daily transportation methods",
        benefit: "I can see my transportation carbon footprint",
        acceptanceCriteria: [
          "Transportation type selection",
          "Distance input",
          "Emission calculation",
        ],
        priority: "high" as const,
        storyPoints: 8,
      },
      {
        id: "US002",
        title: "View progress dashboard",
        persona: "Eco-Warrior",
        userAction: "see my environmental impact over time",
        benefit: "I can track my improvement and stay motivated",
        acceptanceCriteria: [
          "Charts and graphs",
          "Trend analysis",
          "Goal progress",
        ],
        priority: "medium" as const,
        storyPoints: 5,
      },
    ],
    teamSize: 3,
    sprintLength: "2 weeks" as const,
    totalSprints: 2,
    createLinearProject: false,
    sessionId: "test-session-sprint-planning",
  }

  try {
    const result = await sprintPlanningStep.execute({
      context: {},
      input: testInput,
    })

    console.log("✅ Sprint Planning Step test passed!")
    console.log(`📋 Generated ${result.sprints.length} sprints`)
    console.log(`🎯 Sprint velocity: ${result.summary.sprintVelocity}`)
    console.log(`📝 Recommendations: ${result.recommendations.length}`)
    console.log(
      `🔗 Linear integration: ${
        result.linearIntegration.enabled ? "Enabled" : "Disabled"
      }`
    )

    return result
  } catch (error) {
    console.error("❌ Sprint Planning Step test failed:", error)
    throw error
  }
}
