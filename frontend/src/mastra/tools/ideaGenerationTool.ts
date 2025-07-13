import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import {
  ProductIdeaSchema,
  UserPersonaSchema,
} from "../../types.ts/productMaestro"

export const ideaGenerationTool = createTool({
  id: "idea-generation",
  description:
    "Analyzes and refines raw product ideas into structured concepts with features and user personas",
  inputSchema: z.object({
    rawIdea: z.string().describe("The initial product idea from the user"),
    additionalContext: z
      .string()
      .optional()
      .describe("Any additional context or requirements"),
    targetAudience: z
      .string()
      .optional()
      .describe("Specific target audience if known"),
    businessGoals: z
      .array(z.string())
      .optional()
      .describe("Business objectives for this product"),
  }),
  outputSchema: z.object({
    refinedIdea: ProductIdeaSchema,
    userPersonas: z.array(UserPersonaSchema),
    clarifyingQuestions: z
      .array(z.string())
      .describe("Questions to ask the user for further refinement"),
    marketValidation: z.object({
      similarProducts: z.array(z.string()),
      uniqueValueProposition: z.string(),
      marketSize: z.string(),
      competitiveAdvantage: z.string(),
    }),
    nextSteps: z
      .array(z.string())
      .describe("Recommended next steps in the product development process"),
  }),
  // FIXED: execute function signature according to documentation
  execute: async ({ context, runtimeContext }) => {
    const { rawIdea, additionalContext, targetAudience, businessGoals } =
      context

    // Extract key concepts from the raw idea
    const ideaKeywords = extractKeywords(rawIdea)
    const inferredCategory = inferMarketCategory(rawIdea)
    const suggestedFeatures = generateFeatureSuggestions(rawIdea)

    // Create the refined product idea
    const refinedIdea = {
      title: generateProductName(rawIdea),
      description: refineDescription(rawIdea, additionalContext),
      problemStatement: extractProblemStatement(rawIdea),
      targetAudience: targetAudience || inferTargetAudience(rawIdea),
      coreFeatures: suggestedFeatures,
      businessModel: inferBusinessModel(rawIdea, businessGoals),
      marketCategory: inferredCategory,
    }

    // Generate user personas
    const userPersonas = generateUserPersonas(
      refinedIdea.targetAudience,
      refinedIdea.coreFeatures
    )

    // Generate clarifying questions
    const clarifyingQuestions = generateClarifyingQuestions(
      refinedIdea,
      userPersonas
    )

    // Market validation insights
    const marketValidation = {
      similarProducts: findSimilarProducts(
        refinedIdea.marketCategory,
        refinedIdea.coreFeatures
      ),
      uniqueValueProposition: generateUVP(refinedIdea),
      marketSize: estimateMarketSize(refinedIdea.marketCategory),
      competitiveAdvantage: identifyCompetitiveAdvantage(
        refinedIdea.coreFeatures
      ),
    }

    // Suggest next steps
    const nextSteps = generateNextSteps(refinedIdea, clarifyingQuestions.length)

    return {
      refinedIdea,
      userPersonas,
      clarifyingQuestions,
      marketValidation,
      nextSteps,
    }
  },
})

// Helper functions for processing the raw idea
function extractKeywords(rawIdea: string): string[] {
  // Simple keyword extraction - in production, this might use NLP libraries
  const commonWords = [
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "up",
    "about",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "between",
    "among",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "between",
  ]

  return rawIdea
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.includes(word))
    .slice(0, 10) // Top 10 keywords
}

function inferMarketCategory(rawIdea: string): string {
  const categories = {
    "social|chat|messaging|community": "Social Media & Communication",
    "ecommerce|shop|buy|sell|marketplace": "E-commerce & Marketplace",
    "productivity|task|todo|organize": "Productivity & Organization",
    "health|fitness|workout|medical": "Health & Wellness",
    "finance|money|budget|investment": "Financial Technology",
    "education|learn|course|teach": "Education & Learning",
    "entertainment|game|music|video": "Entertainment & Media",
    "travel|booking|hotel|flight": "Travel & Hospitality",
    "food|recipe|restaurant|delivery": "Food & Beverage",
  }

  const lowerIdea = rawIdea.toLowerCase()

  for (const [keywords, category] of Object.entries(categories)) {
    const keywordRegex = new RegExp(keywords, "i")
    if (keywordRegex.test(lowerIdea)) {
      return category
    }
  }

  return "General Technology"
}

function generateFeatureSuggestions(rawIdea: string): string[] {
  // Based on common patterns in product ideas
  const baseFeatures = [
    "User registration and profiles",
    "Search functionality",
    "Notifications",
  ]

  const categoryFeatures: Record<string, string[]> = {
    social: [
      "Friend connections",
      "Messaging",
      "Content sharing",
      "Comments and reactions",
    ],
    ecommerce: [
      "Shopping cart",
      "Payment processing",
      "Product reviews",
      "Inventory management",
    ],
    productivity: [
      "Task management",
      "Calendar integration",
      "Team collaboration",
      "Progress tracking",
    ],
    health: [
      "Progress tracking",
      "Goal setting",
      "Data visualization",
      "Reminders",
    ],
    finance: [
      "Transaction tracking",
      "Budget management",
      "Reports and analytics",
      "Security features",
    ],
  }

  const lowerIdea = rawIdea.toLowerCase()
  let suggestedFeatures = [...baseFeatures]

  Object.entries(categoryFeatures).forEach(([category, features]) => {
    if (lowerIdea.includes(category)) {
      suggestedFeatures.push(...features)
    }
  })

  return [...new Set(suggestedFeatures)] // Remove duplicates
}

function generateProductName(rawIdea: string): string {
  // Extract potential product names or generate one
  const words = rawIdea.split(" ").filter(word => word.length > 2)
  const significantWords = words.slice(0, 3)

  // Simple name generation - in production, this would be more sophisticated
  if (significantWords.length >= 2) {
    return significantWords
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("")
  }

  return "NewProduct"
}

function refineDescription(
  rawIdea: string,
  additionalContext?: string
): string {
  let description = rawIdea

  if (additionalContext) {
    description += ` ${additionalContext}`
  }

  // Clean up and structure the description
  return description.length > 200
    ? description.substring(0, 200) + "..."
    : description
}

function extractProblemStatement(rawIdea: string): string {
  // Look for problem indicators in the raw idea
  const problemIndicators = [
    "problem",
    "issue",
    "challenge",
    "difficulty",
    "pain point",
    "frustration",
  ]

  const sentences = rawIdea.split(/[.!?]+/)

  for (const sentence of sentences) {
    if (
      problemIndicators.some(indicator =>
        sentence.toLowerCase().includes(indicator)
      )
    ) {
      return sentence.trim()
    }
  }

  // If no explicit problem statement, infer one
  return `Users need a better way to ${extractMainAction(rawIdea)}.`
}

function extractMainAction(rawIdea: string): string {
  // Extract the main action/verb from the idea
  const actionWords = [
    "manage",
    "track",
    "organize",
    "connect",
    "share",
    "create",
    "build",
    "find",
    "search",
    "buy",
    "sell",
  ]

  const lowerIdea = rawIdea.toLowerCase()

  for (const action of actionWords) {
    if (lowerIdea.includes(action)) {
      return action
    }
  }

  return "accomplish their goals"
}

function inferTargetAudience(rawIdea: string): string {
  const audiencePatterns = {
    "business|professional|work|office":
      "Business professionals and enterprises",
    "student|school|university|education":
      "Students and educational institutions",
    "developer|programmer|code": "Software developers and technical teams",
    "family|parent|child|kid": "Families and parents",
    "fitness|health|workout": "Health and fitness enthusiasts",
    "travel|tourist|vacation": "Travelers and tourism industry",
    "small business|startup|entrepreneur":
      "Small business owners and entrepreneurs",
  }

  const lowerIdea = rawIdea.toLowerCase()

  for (const [pattern, audience] of Object.entries(audiencePatterns)) {
    if (new RegExp(pattern, "i").test(lowerIdea)) {
      return audience
    }
  }

  return "General consumers and businesses"
}

function inferBusinessModel(rawIdea: string, businessGoals?: string[]): string {
  if (businessGoals && businessGoals.length > 0) {
    if (
      businessGoals.some(goal => goal.toLowerCase().includes("subscription"))
    ) {
      return "Subscription-based (SaaS)"
    }
    if (
      businessGoals.some(goal => goal.toLowerCase().includes("advertising"))
    ) {
      return "Advertising-supported"
    }
  }

  const lowerIdea = rawIdea.toLowerCase()

  if (
    lowerIdea.includes("sell") ||
    lowerIdea.includes("buy") ||
    lowerIdea.includes("marketplace")
  ) {
    return "Transaction-based marketplace"
  }
  if (lowerIdea.includes("subscription") || lowerIdea.includes("monthly")) {
    return "Subscription-based (SaaS)"
  }
  if (lowerIdea.includes("free") || lowerIdea.includes("ad")) {
    return "Freemium with advertising"
  }

  return "To be determined based on market research"
}

function generateUserPersonas(targetAudience: string, coreFeatures: string[]) {
  // Generate 2-3 user personas based on the target audience
  const basePersonas = [
    {
      name: "Primary User",
      role: "Main target user",
      demographics: targetAudience,
      needs: coreFeatures.slice(0, 3),
      painPoints: [
        "Current solutions are too complex",
        "Lack of integration with existing tools",
      ],
      goals: ["Increase efficiency", "Save time", "Improve outcomes"],
    },
    {
      name: "Secondary User",
      role: "Secondary target user",
      demographics: "Adjacent user group",
      needs: coreFeatures.slice(1, 4),
      painPoints: [
        "Limited features in current tools",
        "High cost of alternatives",
      ],
      goals: ["Better user experience", "Cost-effective solution"],
    },
  ]

  return basePersonas
}

function generateClarifyingQuestions(
  refinedIdea: any,
  userPersonas: any[]
): string[] {
  const questions = [
    `What specific pain points do ${refinedIdea.targetAudience} face with current solutions?`,
    `How do you envision users discovering and onboarding to ${refinedIdea.title}?`,
    `What would be the most important feature for the initial MVP?`,
    `Who are the main competitors in the ${refinedIdea.marketCategory} space?`,
    `What success metrics would indicate that ${refinedIdea.title} is working?`,
  ]

  // Add persona-specific questions
  userPersonas.forEach((persona, index) => {
    questions.push(
      `What specific workflows would ${persona.name} need to accomplish their goals?`
    )
  })

  return questions
}

function findSimilarProducts(category: string, features: string[]): string[] {
  const similarProducts: Record<string, string[]> = {
    "Social Media & Communication": [
      "Discord",
      "Slack",
      "WhatsApp",
      "Telegram",
    ],
    "E-commerce & Marketplace": ["Shopify", "Amazon", "Etsy", "WooCommerce"],
    "Productivity & Organization": ["Notion", "Trello", "Asana", "Monday.com"],
    "Health & Wellness": ["MyFitnessPal", "Strava", "Headspace", "Fitbit"],
    "Financial Technology": ["Mint", "QuickBooks", "PayPal", "Stripe"],
    "Education & Learning": ["Coursera", "Khan Academy", "Udemy", "Duolingo"],
  }

  return similarProducts[category] || ["Various competitors in the market"]
}

function generateUVP(refinedIdea: any): string {
  return `${refinedIdea.title} uniquely combines ${refinedIdea.coreFeatures
    .slice(0, 2)
    .join(
      " and "
    )} to solve ${refinedIdea.problemStatement.toLowerCase()} for ${
    refinedIdea.targetAudience
  }.`
}

function estimateMarketSize(category: string): string {
  const marketSizes: Record<string, string> = {
    "Social Media & Communication": "Large ($50B+ global market)",
    "E-commerce & Marketplace": "Very Large ($100B+ global market)",
    "Productivity & Organization": "Growing ($20B+ global market)",
    "Health & Wellness": "Expanding ($30B+ global market)",
    "Financial Technology": "Massive ($80B+ global market)",
    "Education & Learning": "Large ($40B+ global market)",
  }

  return marketSizes[category] || "Market size requires further research"
}

function identifyCompetitiveAdvantage(features: string[]): string {
  return `Integrated approach combining ${features
    .slice(0, 3)
    .join(
      ", "
    )} in a single, user-friendly platform with modern UX/UI standards.`
}

function generateNextSteps(refinedIdea: any, questionCount: number): string[] {
  const steps = [
    "Review and refine the product concept based on feedback",
    "Generate detailed user stories for each core feature",
    "Create wireframes and visual mockups",
    "Develop a comprehensive Product Requirements Document (PRD)",
    "Plan initial development sprints",
  ]

  if (questionCount > 3) {
    steps.unshift("Answer clarifying questions to further refine the concept")
  }

  return steps
}
