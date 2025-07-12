// src/types/productMaestro.ts - Shared TypeScript Types
import { z } from "zod"

// Core product idea schema
export const ProductIdeaSchema = z.object({
  title: z.string().describe("Short, catchy product name"),
  description: z.string().describe("Brief description of the product"),
  problemStatement: z.string().describe("What problem does this solve?"),
  targetAudience: z.string().describe("Who is the primary user?"),
  coreFeatures: z.array(z.string()).describe("List of main features"),
  businessModel: z.string().optional().describe("How will this make money?"),
  marketCategory: z.string().describe("What category/industry is this in?"),
})

export type ProductIdea = z.infer<typeof ProductIdeaSchema>

// User persona schema
export const UserPersonaSchema = z.object({
  name: z.string(),
  role: z.string(),
  demographics: z.string(),
  needs: z.array(z.string()),
  painPoints: z.array(z.string()),
  goals: z.array(z.string()),
})

export type UserPersona = z.infer<typeof UserPersonaSchema>

// User story schema
export const UserStorySchema = z.object({
  id: z.string(),
  title: z.string(),
  persona: z.string(),
  userAction: z.string(),
  benefit: z.string(),
  acceptanceCriteria: z.array(z.string()),
  priority: z.enum(["low", "medium", "high", "critical"]),
  storyPoints: z.number().min(1).max(13), // Fibonacci scale
})

export type UserStory = z.infer<typeof UserStorySchema>

// Wireframe/Design schema
export const ComponentSchema = z.object({
  type: z.enum([
    "header",
    "button",
    "input",
    "card",
    "text",
    "image",
    "form",
    "navigation",
    "footer",
  ]),
  content: z.string(),
  props: z.record(z.any()).optional(),
})

export const WireframePageSchema = z.object({
  pageName: z.string(),
  description: z.string(),
  components: z.array(ComponentSchema),
  layout: z.object({
    header: z.boolean().default(true),
    footer: z.boolean().default(true),
    sidebar: z.boolean().default(false),
  }),
})

export const DesignSystemSchema = z.object({
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    text: z.string(),
  }),
  typography: z.object({
    headingFont: z.string(),
    bodyFont: z.string(),
    sizes: z.record(z.string()),
  }),
  spacing: z.array(z.string()),
  borderRadius: z.string(),
})

export type WireframePage = z.infer<typeof WireframePageSchema>
export type DesignSystem = z.infer<typeof DesignSystemSchema>

// Sprint planning schema
export const SprintSchema = z.object({
  sprintNumber: z.number(),
  goal: z.string(),
  duration: z.string(),
  userStories: z.array(z.string()), // References to user story IDs
  tasks: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      estimatedHours: z.number(),
      assignee: z.string().optional(),
      dependencies: z.array(z.string()).optional(),
    })
  ),
  deliverables: z.array(z.string()),
  risks: z.array(z.string()).optional(),
})

export type Sprint = z.infer<typeof SprintSchema>

// PRD schema - Comprehensive format suitable for Notion pages
export const PRDSchema = z.object({
  title: z.string().describe("Product name and title"),
  executiveSummary: z
    .string()
    .describe("High-level overview and key value proposition"),
  problemStatement: z.string().describe("What problem does this solve?"),
  solutionOverview: z
    .string()
    .describe("How does this product solve the problem?"),
  features: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      acceptanceCriteria: z.array(z.string()),
      priority: z.enum(["high", "medium", "low"]),
    })
  ),
  userPersonas: z.array(UserPersonaSchema),
  goalsAndMetrics: z.array(
    z.object({
      goal: z.string(),
      metric: z.string(),
      target: z.string(),
    })
  ),
  assumptions: z.array(z.string()),
  constraints: z.array(z.string()),
  dependencies: z.array(z.string()),
  openQuestions: z.array(z.string()),
  futureConsiderations: z.array(z.string()),
  technicalOverview: z
    .string()
    .optional()
    .describe("High-level technical approach"),
  uiUxNotes: z
    .string()
    .optional()
    .describe("User interface and experience notes"),
  version: z.string().default("1.0"),
  lastUpdated: z.string(),
})

export type PRD = z.infer<typeof PRDSchema>

// Runtime context types for workflow state management
export type ProductMaestroContext = {
  sessionId: string
  currentStep: string
  productIdea?: ProductIdea
  userPersonas?: UserPersona[]
  userStories?: UserStory[]
  wireframes?: WireframePage[]
  designSystem?: DesignSystem
  sprints?: Sprint[]
  prd?: PRD
  userFeedback?: string[]
  iterationCount?: number
}
