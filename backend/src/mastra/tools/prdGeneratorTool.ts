// src/mastra/tools/prdGeneratorTool.ts

import { createTool } from "@mastra/core/tools"
import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"
import "dotenv/config"
import { ProductIdeaSchema, UserPersonaSchema, UserStorySchema, PRDSchema } from "../../types/productMaestro"
import { createNotionBlocks } from "./notionTool"

// Input schema for PRD generation
const PRDGeneratorInputSchema = z.object({
  productIdea: ProductIdeaSchema,
  userPersonas: z.array(UserPersonaSchema),
  userStories: z.array(UserStorySchema),
  additionalContext: z.string().optional().describe("Any additional context or requirements"),
})

// Output schema with Notion-ready content
const PRDGeneratorOutputSchema = z.object({
  title: z.string(),
  notionProperties: z.record(z.any()).describe("Properties for Notion database page"),
  notionBlocks: z.array(z.any()).describe("Array of Notion block objects for page content - limited to 100 blocks"),
  additionalBlocks: z.array(z.any()).optional().describe("Additional blocks that exceed Notion's 100-block limit"),
  structuredPRD: PRDSchema.describe("Structured PRD data for reference"),
})

export const prdGeneratorTool = createTool({
  id: "prd-generator-tool",
  description: "Generates comprehensive Product Requirements Document content in Notion-compatible format",
  inputSchema: PRDGeneratorInputSchema,
  outputSchema: PRDGeneratorOutputSchema,
  execute: async ({ context, runtimeContext }) => {
    try {
      console.log(`🔄 Generating PRD for product: ${context.productIdea.title}`)

      // Use LLM to generate structured PRD content
      const prdResult = await generateObject({
        model: google("gemini-2.0-flash"),
        schema: PRDSchema,
        prompt: `
          Generate a comprehensive Product Requirements Document (PRD) based on the following information:

          **Product Idea:**
          ${JSON.stringify(context.productIdea, null, 2)}

          **User Personas:**
          ${JSON.stringify(context.userPersonas, null, 2)}

          **User Stories:**
          ${JSON.stringify(context.userStories, null, 2)}

          **Additional Context:**
          ${context.additionalContext || "None provided"}

          Please create a detailed, professional PRD that includes:
          
          1. **Executive Summary**: A compelling 2-3 paragraph overview that captures the product vision, target market, and key value proposition
          
          2. **Problem Statement**: Clear articulation of the user problems and market gaps this product addresses
          
          3. **Solution Overview**: How this product uniquely solves the identified problems
          
          4. **Features**: Detailed feature descriptions with acceptance criteria and priorities based on the user stories
          
          5. **Goals and Metrics**: Specific, measurable objectives with success metrics and targets
          
          6. **Assumptions**: Key assumptions underlying the product strategy
          
          7. **Constraints**: Technical, business, or resource limitations
          
          8. **Dependencies**: External dependencies that could impact development
          
          9. **Open Questions**: Important questions that need further research or clarification
          
          10. **Future Considerations**: Potential future enhancements and roadmap items
          
          11. **Technical Overview**: High-level technical approach and architecture considerations
          
          12. **UI/UX Notes**: User interface and experience considerations

          Ensure the content is:
          - Professional and comprehensive
          - Aligned with industry best practices for PRDs
          - Actionable for development teams
          - Clear and well-structured for stakeholder communication
          - Realistic given the product scope and target audience

          Use the current date for lastUpdated field.
        `,
      })

      const structuredPRD = prdResult.object

      // Generate Notion properties for the database page
      const notionProperties = {
        Name: {
          title: [
            {
              text: {
                content: structuredPRD.title,
              },
            },
          ],
        },
        Status: {
          select: {
            name: "Draft",
          },
        },
        Version: {
          rich_text: [
            {
              text: {
                content: structuredPRD.version,
              },
            },
          ],
        },
        "Last Updated": {
          date: {
            start: new Date().toISOString().split('T')[0],
          },
        },
        Priority: {
          select: {
            name: "High",
          },
        },
      }

      // Convert structured PRD to Notion blocks
      const notionBlocks = [
        // Executive Summary
        createNotionBlocks.heading1("📋 Executive Summary"),
        createNotionBlocks.paragraph(structuredPRD.executiveSummary),
        createNotionBlocks.divider(),

        // Problem Statement
        createNotionBlocks.heading1("🎯 Problem Statement"),
        createNotionBlocks.paragraph(structuredPRD.problemStatement),
        createNotionBlocks.divider(),

        // Solution Overview
        createNotionBlocks.heading1("💡 Solution Overview"),
        createNotionBlocks.paragraph(structuredPRD.solutionOverview),
        createNotionBlocks.divider(),

        // User Personas
        createNotionBlocks.heading1("👥 User Personas"),
        ...structuredPRD.userPersonas.flatMap(persona => [
          createNotionBlocks.heading2(`${persona.name} - ${persona.role}`),
          createNotionBlocks.paragraph(`**Demographics:** ${persona.demographics}`),
          createNotionBlocks.paragraph(`**Needs:** ${persona.needs.join(", ")}`),
          createNotionBlocks.paragraph(`**Pain Points:** ${persona.painPoints.join(", ")}`),
          createNotionBlocks.paragraph(`**Goals:** ${persona.goals.join(", ")}`),
        ]),
        createNotionBlocks.divider(),

        // Features
        createNotionBlocks.heading1("🚀 Features"),
        ...structuredPRD.features.flatMap(feature => [
          createNotionBlocks.heading2(`${feature.name} (Priority: ${feature.priority.toUpperCase()})`),
          createNotionBlocks.paragraph(feature.description),
          createNotionBlocks.heading3("Acceptance Criteria"),
          ...createNotionBlocks.bulletedList(feature.acceptanceCriteria),
        ]),
        createNotionBlocks.divider(),

        // Goals and Metrics
        createNotionBlocks.heading1("📊 Goals and Metrics"),
        ...structuredPRD.goalsAndMetrics.flatMap(metric => [
          createNotionBlocks.heading3(metric.goal),
          createNotionBlocks.paragraph(`**Metric:** ${metric.metric}`),
          createNotionBlocks.paragraph(`**Target:** ${metric.target}`),
        ]),
        createNotionBlocks.divider(),

        // Technical Overview
        ...(structuredPRD.technicalOverview ? [
          createNotionBlocks.heading1("⚙️ Technical Overview"),
          createNotionBlocks.paragraph(structuredPRD.technicalOverview),
          createNotionBlocks.divider(),
        ] : []),

        // UI/UX Notes
        ...(structuredPRD.uiUxNotes ? [
          createNotionBlocks.heading1("🎨 UI/UX Notes"),
          createNotionBlocks.paragraph(structuredPRD.uiUxNotes),
          createNotionBlocks.divider(),
        ] : []),

        // Assumptions
        createNotionBlocks.heading1("🤔 Assumptions"),
        ...createNotionBlocks.bulletedList(structuredPRD.assumptions),
        createNotionBlocks.divider(),

        // Constraints
        createNotionBlocks.heading1("⚠️ Constraints"),
        ...createNotionBlocks.bulletedList(structuredPRD.constraints),
        createNotionBlocks.divider(),

        // Dependencies
        createNotionBlocks.heading1("🔗 Dependencies"),
        ...createNotionBlocks.bulletedList(structuredPRD.dependencies),
        createNotionBlocks.divider(),

        // Open Questions
        createNotionBlocks.heading1("❓ Open Questions"),
        ...createNotionBlocks.bulletedList(structuredPRD.openQuestions),
        createNotionBlocks.divider(),

        // Future Considerations
        createNotionBlocks.heading1("🔮 Future Considerations"),
        ...createNotionBlocks.bulletedList(structuredPRD.futureConsiderations),
      ]

      console.log(`✅ Successfully generated PRD with ${notionBlocks.length} content blocks`)

      // Notion has a 100-block limit for initial page creation
      const maxBlocks = 100
      const initialBlocks = notionBlocks.slice(0, maxBlocks)
      const additionalBlocks = notionBlocks.length > maxBlocks ? notionBlocks.slice(maxBlocks) : undefined

      if (additionalBlocks) {
        console.log(`📝 Note: ${additionalBlocks.length} blocks exceed Notion's 100-block limit and will need to be appended separately`)
      }

      return {
        title: structuredPRD.title,
        notionProperties,
        notionBlocks: initialBlocks,
        additionalBlocks,
        structuredPRD,
      }
    } catch (error) {
      console.error("❌ PRD Generation Error:", error)
      throw new Error(`Failed to generate PRD: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },
})

// Test function for the PRD generator tool
export async function testPRDGeneratorTool() {
  console.log("🧪 Testing PRD Generator Tool...")

  const sampleInput = {
    productIdea: {
      title: "HabitFlow",
      description: "A habit tracking app that helps people build better daily routines with gamification elements",
      problemStatement: "Young professionals struggle with maintaining consistent daily habits and routines",
      targetAudience: "Young professionals aged 25-35 who want to improve their productivity and wellbeing",
      coreFeatures: [
        "Habit tracking and streaks",
        "Gamification with points and badges",
        "Progress visualization",
        "Social challenges",
        "Customizable reminders",
        "Analytics and insights"
      ],
      businessModel: "Freemium with premium features",
      marketCategory: "Productivity & Health"
    },
    userPersonas: [
      {
        name: "Busy Professional",
        role: "Primary User",
        demographics: "25-35 year old working professional",
        needs: ["Easy habit tracking", "Motivation to stay consistent", "Quick progress overview"],
        painPoints: ["Forgets to track habits", "Loses motivation quickly", "Existing apps are too complex"],
        goals: ["Build healthy routines", "Increase productivity", "Maintain work-life balance"]
      }
    ],
    userStories: [
      {
        id: "US001",
        title: "Create Daily Habit",
        persona: "Busy Professional",
        userAction: "I want to create a new daily habit",
        benefit: "so that I can start tracking my progress towards building better routines",
        acceptanceCriteria: [
          "User can name the habit",
          "User can set frequency (daily, weekly, etc.)",
          "User can set reminders",
          "Habit appears in daily checklist"
        ],
        priority: "high" as const,
        storyPoints: 5
      }
    ],
    additionalContext: "Focus on simplicity and user engagement through gamification"
  }

  const result = await prdGeneratorTool.execute({ context: sampleInput, runtimeContext: {} as any })
  
  console.log("🔍 Generated PRD Title:", result.title)
  console.log("🔍 Number of Notion Blocks:", result.notionBlocks.length)
  console.log("🔍 Notion Properties:", Object.keys(result.notionProperties))
  
  return result
}