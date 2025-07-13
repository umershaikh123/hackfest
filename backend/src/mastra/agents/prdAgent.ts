// src/mastra/agents/prdAgent.ts

import { Agent } from "@mastra/core/agent"
import { google } from "@ai-sdk/google"
import "dotenv/config"
import { prdGeneratorTool } from "../tools/prdGeneratorTool"
import { notionTool } from "../tools/notionTool"
import { ragKnowledgeTool } from "../tools/ragKnowledgeTool"
import { memory } from "./ideaGenerationAgent" // Reuse the same memory store
import { z } from "zod"
import { ProductIdeaSchema, UserPersonaSchema, UserStorySchema } from "../../types/productMaestro"

// Input schema for the PRD Agent
const PRDAgentInputSchema = z.object({
  productIdea: ProductIdeaSchema,
  userPersonas: z.array(UserPersonaSchema),
  userStories: z.array(UserStorySchema),
  additionalContext: z.string().optional(),
  databaseId: z.string().optional().describe("Notion database ID - will use env var if not provided"),
})

// Output schema for the PRD Agent
const PRDAgentOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  notionPageUrl: z.string().optional(),
  notionPageId: z.string().optional(),
  prdTitle: z.string().optional(),
})

export const prdAgent = new Agent({
  name: "PRD Compiler",
  description: "The PRD Compiler - Expert at gathering all product information and creating comprehensive Product Requirements Documents published to Notion",
  instructions: `
    You are "The PRD Compiler" - a senior Product Manager and Technical Writer with 12+ years of experience creating world-class Product Requirements Documents for Fortune 500 companies and successful startups.

    ## Your Expertise:
    - **Strategic Product Planning**: Expert at translating product vision into actionable requirements
    - **Technical Documentation**: Master of creating clear, comprehensive, and actionable PRDs
    - **Stakeholder Communication**: Skilled at writing for diverse audiences (executives, engineers, designers, QA)
    - **Industry Best Practices**: Deep knowledge of PRD standards and templates from top tech companies
    - **Cross-functional Collaboration**: Expert at creating documents that facilitate alignment across teams

    ## Your Mission:
    Transform scattered product information (ideas, user stories, personas) into a comprehensive, professional Product Requirements Document that serves as the single source of truth for product development.

    ## Your Process:
    1. **Knowledge Research**: First, use the RAG knowledge tool to search for relevant PRD templates, best practices, and industry standards
    2. **Content Generation**: Use the PRD generator tool to create structured, comprehensive PRD content optimized for Notion
    3. **Notion Publishing**: Use the Notion tool to create a properly formatted page in the designated database
    4. **Quality Validation**: Ensure the published PRD meets professional standards and is ready for stakeholder review

    ## Your Standards:
    Every PRD you create must be:
    - **Comprehensive**: Covers all aspects from problem to solution to metrics
    - **Actionable**: Provides clear guidance for development teams
    - **Measurable**: Includes specific success metrics and acceptance criteria
    - **Stakeholder-Ready**: Professional formatting suitable for executive review
    - **Development-Ready**: Technical enough to guide engineering decisions

    ## Communication Style:
    - **Executive Summary Focus**: Lead with impact and business value
    - **Clear Structure**: Organize information logically with proper headings
    - **Specific Details**: Include concrete acceptance criteria and requirements
    - **Future-Oriented**: Consider scalability and future product evolution
    - **Risk-Aware**: Identify assumptions, constraints, and dependencies

    ## Your Tools:
    - **ragKnowledgeTool**: Search your knowledge base for PRD best practices and templates
    - **prdGeneratorTool**: Generate comprehensive PRD content in Notion-compatible format
    - **notionTool**: Create and publish the PRD page in Notion

    ## Success Criteria:
    - PRD is published successfully to Notion
    - Document follows industry best practices
    - All sections are comprehensive and actionable
    - Content is properly formatted for stakeholder consumption
    - Page includes proper metadata and organization

    When you receive product information, immediately begin by researching best practices, then generate and publish a comprehensive PRD that will serve as the definitive product specification.

    Remember: You're creating the document that will guide months of development work and millions of dollars in investment. Make it count.
  `,
  model: google("gemini-2.0-flash"),
  tools: {
    prdGeneratorTool,
    notionTool,
    ragKnowledgeTool,
  },
  memory,
})

// Main function to execute PRD generation and publishing
export async function generateAndPublishPRD(input: z.infer<typeof PRDAgentInputSchema>) {
  try {
    console.log(`🔄 Starting PRD generation for: ${input.productIdea.title}`)
    
    const databaseId = input.databaseId || process.env.NOTION_PRD_DATABASE_ID
    
    if (!databaseId) {
      return {
        success: false,
        message: "Notion database ID not provided. Please set NOTION_PRD_DATABASE_ID environment variable or provide databaseId in input.",
      }
    }

    const prompt = `
      I need you to create a comprehensive Product Requirements Document and publish it to Notion.

      **Product Information:**
      Product Idea: ${JSON.stringify(input.productIdea, null, 2)}
      User Personas: ${JSON.stringify(input.userPersonas, null, 2)}
      User Stories: ${JSON.stringify(input.userStories, null, 2)}
      Additional Context: ${input.additionalContext || "None provided"}
      Notion Database ID: ${databaseId}

      **Your Task:**
      1. First, search your knowledge base for PRD best practices and templates
      2. Generate a comprehensive PRD using the PRD generator tool
      3. Publish the PRD to Notion using the provided database ID
      4. Provide me with the Notion page URL and confirm successful publication

      Please ensure the PRD follows industry standards and is ready for stakeholder review.
    `

    const response = await prdAgent.generate([
      {
        role: "user",
        content: prompt,
      },
    ], {
      maxSteps: 10, // Allow multiple tool uses
    })

    console.log("🤖 PRD Agent Response:", response.text)

    // Extract information from the agent's response
    // This is a simplified extraction - in practice, you might want more sophisticated parsing
    const notionUrlMatch = response.text.match(/https:\/\/notion\.so\/[a-zA-Z0-9]+/)
    const successMatch = response.text.toLowerCase().includes("success")

    return {
      success: successMatch,
      message: response.text,
      notionPageUrl: notionUrlMatch ? notionUrlMatch[0] : undefined,
      prdTitle: input.productIdea.title,
    }
  } catch (error) {
    console.error("❌ PRD Agent Error:", error)
    return {
      success: false,
      message: `Failed to generate PRD: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Test function for the PRD Agent
export async function testPRDAgent() {
  console.log("🧪 Testing PRD Agent...")

  const sampleInput = {
    productIdea: {
      title: "TaskMaster Pro",
      description: "An AI-powered project management tool that automatically prioritizes tasks based on deadlines, dependencies, and team capacity",
      problemStatement: "Teams struggle with task prioritization and often miss deadlines due to poor project visibility",
      targetAudience: "Small to medium-sized software development teams (5-50 people)",
      coreFeatures: [
        "AI-powered task prioritization",
        "Real-time project dashboards",
        "Automated deadline tracking",
        "Team capacity planning",
        "Integration with popular dev tools",
        "Smart notification system"
      ],
      businessModel: "SaaS subscription with tiered pricing",
      marketCategory: "Project Management & Productivity"
    },
    userPersonas: [
      {
        name: "Development Team Lead",
        role: "Primary User",
        demographics: "30-45 year old team lead with 5+ years experience",
        needs: ["Clear project visibility", "Effective team coordination", "Deadline management"],
        painPoints: ["Manual task prioritization", "Poor deadline visibility", "Team overcommitment"],
        goals: ["Deliver projects on time", "Optimize team productivity", "Reduce project stress"]
      },
      {
        name: "Software Developer",
        role: "Secondary User", 
        demographics: "25-40 year old individual contributor",
        needs: ["Clear task priorities", "Realistic deadlines", "Minimal context switching"],
        painPoints: ["Unclear priorities", "Constantly changing deadlines", "Too many interruptions"],
        goals: ["Focus on coding", "Meet commitments", "Career growth"]
      }
    ],
    userStories: [
      {
        id: "US001",
        title: "View AI-Generated Task Priorities",
        persona: "Development Team Lead",
        userAction: "I want to see AI-generated task priorities for my team",
        benefit: "so that I can make informed decisions about what to work on next",
        acceptanceCriteria: [
          "Dashboard shows tasks ranked by AI priority score",
          "Priority reasoning is displayed for each task",
          "Priorities update automatically as conditions change",
          "User can manually override AI recommendations"
        ],
        priority: "high" as const,
        storyPoints: 8
      }
    ],
    additionalContext: "This product should integrate seamlessly with existing development workflows and tools like GitHub, Jira, and Slack."
  }

  const result = await generateAndPublishPRD(sampleInput)
  
  console.log("🔍 PRD Agent Test Result:")
  console.log("✅ Success:", result.success)
  console.log("📄 Message:", result.message)
  console.log("🔗 Notion URL:", result.notionPageUrl)
  
  return result
}