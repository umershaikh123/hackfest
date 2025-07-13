// src/mastra/tools/sprintPlannerTool.ts - Sprint Planning Tool with Linear Integration
import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import { SprintSchema } from "../../types/productMaestro.js"

// Linear API integration schemas
const LinearTeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
})

const LinearCycleSchema = z.object({
  id: z.string(),
  number: z.number(),
  name: z.string(),
  description: z.string().optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  team: LinearTeamSchema,
})

const LinearIssueSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  title: z.string(),
  description: z.string().optional(),
  estimate: z.number().optional(),
  priority: z.number().optional(),
  state: z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
  }),
})

// Linear GraphQL queries
const CREATE_CYCLE_MUTATION = `
  mutation CreateCycle($input: CycleCreateInput!) {
    cycleCreate(input: $input) {
      success
      cycle {
        id
        number
        name
        description
        startsAt
        endsAt
        team {
          id
          name
          key
        }
      }
    }
  }
`

const CREATE_ISSUE_MUTATION = `
  mutation CreateIssue($input: IssueCreateInput!) {
    issueCreate(input: $input) {
      success
      issue {
        id
        identifier
        title
        description
        estimate
        priority
        state {
          id
          name
          type
        }
      }
    }
  }
`

const GET_TEAMS_QUERY = `
  query GetTeams {
    teams {
      nodes {
        id
        name
        key
      }
    }
  }
`

// Linear API client
class LinearAPIClient {
  private apiKey: string
  private baseUrl = "https://api.linear.app/graphql"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async request(query: string, variables?: any) {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.apiKey,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    if (!response.ok) {
      throw new Error(`Linear API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.errors) {
      throw new Error(`Linear GraphQL error: ${data.errors[0].message}`)
    }

    return data.data
  }

  async getTeams() {
    const data = await this.request(GET_TEAMS_QUERY)
    return data.teams.nodes as z.infer<typeof LinearTeamSchema>[]
  }

  async createCycle(input: {
    name: string
    description?: string
    teamId: string
    startsAt: string
    endsAt: string
  }) {
    const data = await this.request(CREATE_CYCLE_MUTATION, { input })
    return data.cycleCreate.cycle as z.infer<typeof LinearCycleSchema>
  }

  async createIssue(input: {
    title: string
    description?: string
    teamId: string
    cycleId?: string
    estimate?: number
    priority?: number
  }) {
    const data = await this.request(CREATE_ISSUE_MUTATION, { input })
    return data.issueCreate.issue as z.infer<typeof LinearIssueSchema>
  }
}

// Sprint Planner Tool implementation
export const sprintPlannerTool = createTool({
  id: "sprintPlannerTool",
  description: `
    Creates comprehensive sprint plans from user stories and features, with optional Linear integration.
    
    This tool:
    1. Analyzes user stories and features to create logical sprint groupings
    2. Estimates development effort and timeline
    3. Creates tasks with dependencies and assignments
    4. Optionally creates cycles and issues in Linear for project management
    5. Provides sprint recommendations and risk assessments
    
    Input: Product features, user stories, and team parameters
    Output: Structured sprint plan with Linear integration (if API key provided)
  `,
  inputSchema: z.object({
    productTitle: z.string().describe("Product name for sprint planning"),
    features: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          acceptanceCriteria: z.array(z.string()),
          priority: z.enum(["high", "medium", "low"]),
        })
      )
      .describe("List of product features to plan sprints for"),
    userStories: z
      .array(
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
      )
      .describe("User stories to include in sprint planning"),
    teamSize: z
      .number()
      .min(1)
      .max(20)
      .default(4)
      .describe("Number of developers on the team"),
    sprintLength: z
      .enum(["1 week", "2 weeks", "3 weeks", "4 weeks"])
      .default("2 weeks")
      .describe("Length of each sprint"),
    totalSprints: z
      .number()
      .min(1)
      .max(10)
      .default(3)
      .describe("Number of sprints to plan"),
    createLinearProject: z
      .boolean()
      .default(false)
      .describe("Whether to create cycles and issues in Linear"),
    linearTeamId: z
      .string()
      .optional()
      .describe("Linear team ID (required if createLinearProject is true)"),
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
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const {
        productTitle,
        features,
        userStories,
        teamSize,
        sprintLength,
        totalSprints,
        createLinearProject,
        linearTeamId,
      } = context

      // Calculate team velocity (conservative estimate: 8 story points per developer per 2-week sprint)
      const baseVelocity = teamSize * 8
      const sprintDurationMultiplier =
        sprintLength === "1 week"
          ? 0.5
          : sprintLength === "3 weeks"
            ? 1.5
            : sprintLength === "4 weeks"
              ? 2
              : 1
      const sprintVelocity = Math.round(baseVelocity * sprintDurationMultiplier)

      // Sort user stories by priority and story points for optimal sprint planning
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      const sortedStories = [...userStories].sort((a, b) => {
        const priorityDiff =
          priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        return a.storyPoints - b.storyPoints // Smaller stories first within same priority
      })

      const sprints: z.infer<typeof SprintSchema>[] = []
      let currentStoryIndex = 0

      // Create sprints
      for (let sprintNum = 1; sprintNum <= totalSprints; sprintNum++) {
        const sprintUserStories: string[] = []
        let currentSprintPoints = 0

        // Fill sprint with user stories up to velocity limit
        while (
          currentStoryIndex < sortedStories.length &&
          currentSprintPoints + sortedStories[currentStoryIndex].storyPoints <=
            sprintVelocity
        ) {
          const story = sortedStories[currentStoryIndex]
          sprintUserStories.push(story.id)
          currentSprintPoints += story.storyPoints
          currentStoryIndex++
        }

        // Generate tasks from user stories and features
        const sprintTasks = sprintUserStories.map((storyId, index) => {
          const story = userStories.find(s => s.id === storyId)!
          const estimatedHours = story.storyPoints * 6 // Conservative 6 hours per story point

          return {
            title: `Implement: ${story.title}`,
            description: `${story.userAction} - ${story.benefit}\n\nAcceptance Criteria:\n${story.acceptanceCriteria.join("\n")}`,
            estimatedHours,
            assignee: `Developer ${(index % teamSize) + 1}`,
            dependencies:
              sprintNum > 1 ? [`Sprint ${sprintNum - 1} completion`] : [],
          }
        })

        // Add feature-specific tasks for high-priority features
        const relevantFeatures = features.filter(
          f => f.priority === "high" && sprintNum <= 2
        )
        relevantFeatures.forEach(feature => {
          sprintTasks.push({
            title: `Architecture: ${feature.name}`,
            description: `Technical implementation planning for ${feature.description}`,
            estimatedHours: 8,
            assignee: "Tech Lead",
            dependencies: [],
          })
        })

        const sprint: z.infer<typeof SprintSchema> = {
          sprintNumber: sprintNum,
          goal:
            sprintNum === 1
              ? `Establish core foundation and implement critical user flows`
              : sprintNum === 2
                ? `Build primary features and user experience`
                : `Polish, optimize, and prepare for launch`,
          duration: sprintLength,
          userStories: sprintUserStories,
          tasks: sprintTasks,
          deliverables:
            sprintNum === 1
              ? [
                  "Core user authentication",
                  "Basic UI framework",
                  "Database setup",
                ]
              : sprintNum === 2
                ? [
                    "Primary feature implementation",
                    "User workflow completion",
                    "Basic testing",
                  ]
                : [
                    "Performance optimization",
                    "Bug fixes",
                    "Production deployment",
                  ],
          risks:
            sprintNum === 1
              ? ["Technology setup delays", "Team onboarding time"]
              : [
                  "Scope creep",
                  "Integration complexity",
                  "Testing bottlenecks",
                ],
        }

        sprints.push(sprint)

        // Break if we've allocated all user stories
        if (currentStoryIndex >= sortedStories.length) break
      }

      // Calculate summary metrics
      const totalStoryPoints = userStories.reduce(
        (sum, story) => sum + story.storyPoints,
        0
      )
      const allocatedStoryPoints = sprints.reduce(
        (sum, sprint) =>
          sum +
          sprint.userStories.reduce((sprintSum, storyId) => {
            const story = userStories.find(s => s.id === storyId)
            return sprintSum + (story?.storyPoints || 0)
          }, 0),
        0
      )

      const riskFactors = [
        ...(allocatedStoryPoints < totalStoryPoints
          ? ["Some user stories may not fit in planned sprints"]
          : []),
        ...(teamSize < 3
          ? ["Small team size may limit parallel development"]
          : []),
        ...(sprintLength === "1 week"
          ? ["Short sprints may limit feature delivery"]
          : []),
        ...(features.filter(f => f.priority === "high").length > 5
          ? ["High number of priority features may cause scope creep"]
          : []),
      ]

      const recommendations = [
        `Maintain sprint velocity of ${sprintVelocity} story points`,
        "Conduct daily standups and sprint retrospectives",
        "Plan for 20% buffer time in each sprint",
        ...(allocatedStoryPoints < totalStoryPoints
          ? ["Consider adding additional sprints or reducing scope"]
          : []),
        ...(sprintLength === "2 weeks"
          ? ["Consider mid-sprint check-ins for longer user stories"]
          : []),
      ]

      // Linear integration
      let linearIntegration: any = {
        enabled: createLinearProject,
        cyclesCreated: [],
        issuesCreated: [],
        errors: [],
      }

      if (createLinearProject && process.env.LINEAR_API_KEY && linearTeamId) {
        try {
          const linearClient = new LinearAPIClient(process.env.LINEAR_API_KEY)

          // Create cycles for each sprint
          for (const sprint of sprints) {
            const startDate = new Date()
            startDate.setDate(
              startDate.getDate() + (sprint.sprintNumber - 1) * 14
            ) // 2 weeks per sprint
            const endDate = new Date(startDate)
            endDate.setDate(
              endDate.getDate() + (sprintLength === "1 week" ? 7 : 14)
            )

            const cycle = await linearClient.createCycle({
              name: `${productTitle} - Sprint ${sprint.sprintNumber}`,
              description: `${sprint.goal}\n\nDeliverables: ${sprint.deliverables.join(", ")}`,
              teamId: linearTeamId,
              startsAt: startDate.toISOString(),
              endsAt: endDate.toISOString(),
            })

            linearIntegration.cyclesCreated.push({
              cycleId: cycle.id,
              cycleName: cycle.name,
              linearUrl: `https://linear.app/cycle/${cycle.id}`,
            })

            // Create issues for each task in the sprint
            for (const task of sprint.tasks) {
              const issue = await linearClient.createIssue({
                title: task.title,
                description: task.description,
                teamId: linearTeamId,
                cycleId: cycle.id,
                estimate: Math.ceil(task.estimatedHours / 8), // Convert hours to days
                priority: 3, // Medium priority by default
              })

              linearIntegration.issuesCreated.push({
                issueId: issue.id,
                issueIdentifier: issue.identifier,
                title: issue.title,
                cycleId: cycle.id,
              })
            }
          }
        } catch (error) {
          linearIntegration.errors.push(`Linear integration failed: ${error}`)
        }
      } else if (createLinearProject) {
        linearIntegration.errors.push(
          "Linear integration requested but API key or team ID missing"
        )
      }

      return {
        sprints,
        summary: {
          totalStoryPoints,
          estimatedDuration: `${sprints.length} sprints (${sprints.length * (sprintLength === "1 week" ? 1 : 2)} weeks)`,
          sprintVelocity,
          riskFactors,
          recommendations,
        },
        linearIntegration,
      }
    } catch (error) {
      throw new Error(`Sprint planning failed: ${error}`)
    }
  },
})

// Export test function for validation
export async function testSprintPlannerTool() {
  console.log("🧪 Testing Sprint Planner Tool...")

  const testInput = {
    productTitle: "TaskFlow Pro",
    features: [
      {
        name: "Task Management",
        description: "Create, edit, and organize tasks with due dates",
        acceptanceCriteria: [
          "Users can create tasks",
          "Users can set due dates",
          "Tasks can be organized in lists",
        ],
        priority: "high" as const,
      },
      {
        name: "Team Collaboration",
        description: "Share tasks and projects with team members",
        acceptanceCriteria: [
          "Users can invite team members",
          "Tasks can be assigned",
          "Comments on tasks",
        ],
        priority: "medium" as const,
      },
    ],
    userStories: [
      {
        id: "US001",
        title: "Create new task",
        persona: "Project Manager",
        userAction: "create a new task with title and description",
        benefit: "I can track work that needs to be done",
        acceptanceCriteria: [
          "Task form with title field",
          "Task form with description field",
          "Save button creates task",
        ],
        priority: "high" as const,
        storyPoints: 5,
      },
      {
        id: "US002",
        title: "Set task due date",
        persona: "Project Manager",
        userAction: "set a due date for tasks",
        benefit: "I can prioritize work by deadlines",
        acceptanceCriteria: [
          "Date picker component",
          "Due date displayed on task",
          "Overdue tasks highlighted",
        ],
        priority: "medium" as const,
        storyPoints: 3,
      },
    ],
    teamSize: 4,
    sprintLength: "2 weeks" as const,
    totalSprints: 2,
    createLinearProject: false,
  }

  try {
    const result = await sprintPlannerTool.execute({
      context: testInput,
      runtimeContext: undefined as any,
    })

    console.log("✅ Sprint Planner Tool test passed!")
    console.log(`📊 Generated ${result.sprints.length} sprints`)
    console.log(
      `🎯 Sprint velocity: ${result.summary.sprintVelocity} story points`
    )
    console.log(`⏱️  Estimated duration: ${result.summary.estimatedDuration}`)
    console.log(
      `📝 Total tasks: ${result.sprints.reduce((sum, s) => sum + s.tasks.length, 0)}`
    )

    return result
  } catch (error) {
    console.error("❌ Sprint Planner Tool test failed:", error)
    throw error
  }
}
