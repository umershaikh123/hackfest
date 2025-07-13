// src/mastra/tools/userStoryGeneratorTool.ts

import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import {
  ProductIdeaSchema,
  UserPersonaSchema,
  UserStorySchema,
} from "../../types/productMaestro"

export const userStoryGeneratorTool = createTool({
  id: "user-story-generator",
  description:
    "Generates comprehensive user stories with acceptance criteria based on product ideas and user personas",
  inputSchema: z.object({
    productIdea: ProductIdeaSchema,
    userPersonas: z.array(UserPersonaSchema),
    focusAreas: z
      .array(z.string())
      .optional()
      .describe(
        "Specific areas to focus on (e.g., 'onboarding', 'core features')"
      ),
    additionalRequirements: z
      .string()
      .optional()
      .describe("Any specific requirements or constraints"),
  }),
  outputSchema: z.object({
    epics: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        stories: z.array(z.string()), // References to story IDs
      })
    ),
    userStories: z.array(UserStorySchema),
    implementationOrder: z.array(z.string()), // Story IDs in suggested order
    mvpStories: z.array(z.string()), // Story IDs for MVP
    totalEstimate: z.object({
      storyPoints: z.number(),
      estimatedSprints: z.number(),
    }),
    recommendations: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const { productIdea, userPersonas, focusAreas, additionalRequirements } =
      context

    // Generate user stories for each core feature
    const userStories: any[] = []
    const epics: any[] = []

    // Create epics based on feature categories
    const epicCategories = categorizeFeatures(productIdea.coreFeatures)

    for (const [epicName, features] of Object.entries(epicCategories)) {
      const epic = {
        name: epicName,
        description: generateEpicDescription(epicName, features),
        stories: [] as string[],
      }

      // Generate stories for this epic
      for (const feature of features) {
        const storiesForFeature = generateStoriesForFeature(
          feature,
          userPersonas,
          productIdea
        )

        for (const story of storiesForFeature) {
          userStories.push(story)
          epic.stories.push(story.id)
        }
      }

      epics.push(epic)
    }

    // Add infrastructure and onboarding stories
    const infraStories = generateInfrastructureStories(
      userPersonas,
      productIdea
    )
    userStories.push(...infraStories)

    // Create onboarding epic
    const onboardingEpic = {
      name: "User Onboarding & Account Management",
      description:
        "User registration, profile setup, and account management features",
      stories: infraStories.map(s => s.id),
    }
    epics.unshift(onboardingEpic) // Add at the beginning

    // Prioritize and estimate
    prioritizeStories(userStories)
    estimateStories(userStories)

    // Determine implementation order
    const implementationOrder = determineImplementationOrder(userStories)

    // Identify MVP stories
    const mvpStories = identifyMVPStories(userStories)

    // Calculate total estimates
    const totalStoryPoints = userStories.reduce(
      (sum, story) => sum + story.storyPoints,
      0
    )
    const estimatedSprints = Math.ceil(totalStoryPoints / 20) // Assuming 20 points per sprint

    // Generate recommendations
    const recommendations = generateRecommendations(
      userStories,
      productIdea,
      userPersonas
    )

    return {
      epics,
      userStories,
      implementationOrder,
      mvpStories,
      totalEstimate: {
        storyPoints: totalStoryPoints,
        estimatedSprints,
      },
      recommendations,
    }
  },
})

// Helper functions

function categorizeFeatures(features: string[]): Record<string, string[]> {
  const categories: Record<string, string[]> = {
    "Core Functionality": [],
    "User Experience": [],
    "Social Features": [],
    "Analytics & Insights": [],
    Gamification: [],
    "Notifications & Reminders": [],
  }

  for (const feature of features) {
    const lowerFeature = feature.toLowerCase()

    if (
      lowerFeature.includes("track") ||
      lowerFeature.includes("habit") ||
      lowerFeature.includes("routine")
    ) {
      categories["Core Functionality"].push(feature)
    } else if (
      lowerFeature.includes("gamif") ||
      lowerFeature.includes("point") ||
      lowerFeature.includes("badge") ||
      lowerFeature.includes("reward")
    ) {
      categories["Gamification"].push(feature)
    } else if (
      lowerFeature.includes("social") ||
      lowerFeature.includes("share") ||
      lowerFeature.includes("challenge") ||
      lowerFeature.includes("friend")
    ) {
      categories["Social Features"].push(feature)
    } else if (
      lowerFeature.includes("analytic") ||
      lowerFeature.includes("insight") ||
      lowerFeature.includes("report") ||
      lowerFeature.includes("visual")
    ) {
      categories["Analytics & Insights"].push(feature)
    } else if (
      lowerFeature.includes("remind") ||
      lowerFeature.includes("notification") ||
      lowerFeature.includes("alert")
    ) {
      categories["Notifications & Reminders"].push(feature)
    } else {
      categories["User Experience"].push(feature)
    }
  }

  // Remove empty categories
  return Object.fromEntries(
    Object.entries(categories).filter(([_, features]) => features.length > 0)
  )
}

function generateEpicDescription(epicName: string, features: string[]): string {
  const descriptions: Record<string, string> = {
    "Core Functionality":
      "Essential features that enable users to track and manage their habits effectively",
    Gamification:
      "Game-like features that motivate users and make habit building engaging",
    "Social Features":
      "Community and sharing features that enable social motivation and accountability",
    "Analytics & Insights":
      "Data visualization and analysis features that help users understand their progress",
    "User Experience":
      "Interface and interaction features that make the app easy and pleasant to use",
    "Notifications & Reminders":
      "Alert and reminder systems that help users stay on track with their habits",
  }

  return (
    descriptions[epicName] ||
    `Features related to ${epicName.toLowerCase()}: ${features.join(", ")}`
  )
}

function generateStoriesForFeature(
  feature: string,
  personas: any[],
  productIdea: any
): any[] {
  const stories: any[] = []
  const featureLower = feature.toLowerCase()

  // Generate stories based on feature type
  if (featureLower.includes("track") || featureLower.includes("habit")) {
    stories.push(
      createStory(
        "habit-tracking-create",
        personas[0].name,
        "create and configure new habits",
        "I can start building consistent routines",
        [
          "User can create a new habit with a descriptive name",
          "User can set frequency (daily, weekly, custom)",
          "User can choose a category or create custom categories",
          "User can set reminders for the habit",
          "Habit is saved and appears in the user's habit list",
        ],
        "critical",
        5
      ),
      createStory(
        "habit-tracking-complete",
        personas[0].name,
        "mark habits as completed for the day",
        "I can track my progress and build streaks",
        [
          "User can view today's habits in an easy-to-scan list",
          "User can mark a habit as completed with a single tap",
          "Completion is timestamped and saved",
          "Visual feedback confirms the completion",
          "Streak counter updates immediately",
        ],
        "critical",
        3
      )
    )
  }

  if (featureLower.includes("gamif") || featureLower.includes("point")) {
    stories.push(
      createStory(
        "gamification-points",
        personas[0].name,
        "earn points for completing habits",
        "I feel motivated and rewarded for my consistency",
        [
          "User earns points when completing habits",
          "Different habits can have different point values",
          "Points are displayed prominently in the UI",
          "Total point balance is maintained and visible",
          "Point history is tracked for analytics",
        ],
        "high",
        3
      )
    )
  }

  if (featureLower.includes("social") || featureLower.includes("challenge")) {
    stories.push(
      createStory(
        "social-challenges",
        personas[0].name,
        "participate in habit challenges with friends",
        "I can stay motivated through social accountability",
        [
          "User can create or join habit challenges",
          "Challenge participants are visible to all members",
          "Progress is shared within the challenge group",
          "Leaderboards show relative performance",
          "Users can cheer each other on with reactions",
        ],
        "medium",
        8
      )
    )
  }

  if (featureLower.includes("visual") || featureLower.includes("progress")) {
    stories.push(
      createStory(
        "progress-visualization",
        personas[1].name,
        "view my habit progress in visual charts and graphs",
        "I can understand my patterns and celebrate achievements",
        [
          "User can view habit completion rates over time",
          "Charts show daily, weekly, and monthly views",
          "Streaks are highlighted prominently",
          "Different visualization types available (calendar, line chart, etc.)",
          "Data can be filtered by habit category or time period",
        ],
        "high",
        5
      )
    )
  }

  return stories
}

function generateInfrastructureStories(
  personas: any[],
  productIdea: any
): any[] {
  return [
    createStory(
      "user-registration",
      personas[0].name,
      "create an account using email or social login",
      "I can securely access my habit data across devices",
      [
        "User can register with email and password",
        "User can sign up with Google/Apple social login",
        "Email verification is sent and required",
        "User profile is created with basic information",
        "User is redirected to onboarding flow after registration",
      ],
      "critical",
      3
    ),
    createStory(
      "user-onboarding",
      personas[0].name,
      "complete an onboarding flow that helps me set up my first habits",
      "I can quickly start using the app effectively",
      [
        "User sees a welcome screen explaining app benefits",
        "User can select habit categories they're interested in",
        "User is guided to create their first 1-3 habits",
        "User can set their preferred reminder times",
        "Onboarding can be skipped for advanced users",
      ],
      "critical",
      5
    ),
    createStory(
      "user-profile",
      personas[0].name,
      "manage my profile settings and preferences",
      "I can customize the app to work best for me",
      [
        "User can update personal information",
        "User can change notification preferences",
        "User can adjust timezone settings",
        "User can choose app theme (dark/light mode)",
        "User can connect/disconnect social accounts",
      ],
      "medium",
      3
    ),
  ]
}

function createStory(
  id: string,
  persona: string,
  userAction: string,
  benefit: string,
  acceptanceCriteria: string[],
  priority: "low" | "medium" | "high" | "critical",
  storyPoints: number
): any {
  return {
    id,
    title: `${userAction.charAt(0).toUpperCase() + userAction.slice(1)}`,
    persona,
    userAction,
    benefit,
    acceptanceCriteria,
    priority,
    storyPoints,
  }
}

function prioritizeStories(stories: any[]): void {
  // Sort by priority: critical > high > medium > low
  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
  stories.sort(
    (a, b) =>
      priorityOrder[b.priority as keyof typeof priorityOrder] -
      priorityOrder[a.priority as keyof typeof priorityOrder]
  )
}

function estimateStories(stories: any[]): void {
  // Story points are already assigned during creation
  // This function could be enhanced to adjust estimates based on complexity
  stories.forEach(story => {
    // Adjust estimates based on acceptance criteria count
    const criteriaCount = story.acceptanceCriteria.length
    if (criteriaCount > 6) {
      story.storyPoints = Math.min(story.storyPoints + 2, 13)
    }
  })
}

function determineImplementationOrder(stories: any[]): string[] {
  // Order by priority first, then by dependencies
  const criticalStories = stories.filter(s => s.priority === "critical")
  const highStories = stories.filter(s => s.priority === "high")
  const mediumStories = stories.filter(s => s.priority === "medium")
  const lowStories = stories.filter(s => s.priority === "low")

  return [
    ...criticalStories.map(s => s.id),
    ...highStories.map(s => s.id),
    ...mediumStories.map(s => s.id),
    ...lowStories.map(s => s.id),
  ]
}

function identifyMVPStories(stories: any[]): string[] {
  // MVP includes all critical stories and some high priority ones
  const mvpStories = stories.filter(
    story =>
      story.priority === "critical" ||
      (story.priority === "high" && story.storyPoints <= 5)
  )

  return mvpStories.map(s => s.id)
}

function generateRecommendations(
  stories: any[],
  productIdea: any,
  personas: any[]
): string[] {
  const recommendations = [
    "Start with user onboarding and core habit tracking functionality",
    "Implement basic gamification early to drive engagement",
    "Consider releasing MVP with critical features first, then iterate",
  ]

  const totalPoints = stories.reduce((sum, story) => sum + story.storyPoints, 0)
  if (totalPoints > 60) {
    recommendations.push(
      "Consider breaking down large stories further to reduce complexity"
    )
  }

  const socialStories = stories.filter(s => s.id.includes("social"))
  if (socialStories.length > 0) {
    recommendations.push(
      "Social features can be Phase 2 - focus on individual experience first"
    )
  }

  return recommendations
}
