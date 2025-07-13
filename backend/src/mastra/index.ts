import { Mastra } from "@mastra/core/mastra"
import { PinoLogger } from "@mastra/loggers"
import { LibSQLStore } from "@mastra/libsql"
import { Memory } from "@mastra/memory"

// Import all agents
import { ideaGenerationAgent } from "./agents/ideaGenerationAgent"
import { userStoryGeneratorAgent } from "./agents/userStoryGeneratorAgent"
import { prdAgent } from "./agents/prdAgent"
import { sprintPlannerAgent } from "./agents/sprintPlannerAgent"
import { visualDesignAgent } from "./agents/visualDesignAgent"
import { feedbackRouterAgent } from "./agents/feedbackRouterAgent"

// Import all workflows
import { productDevelopmentWorkflow } from "./workflows/productDevelopmentWorkflow"
import { conversationalProductWorkflow } from "./workflows/conversationalProductWorkflow"
import { simpleWorkflow } from "./workflows/simpleWorkflow"

// Import all tools for export
import { ideaGenerationTool } from "./tools/ideaGenerationTool"
import { userStoryGeneratorTool } from "./tools/userStoryGeneratorTool"
import { prdGeneratorTool } from "./tools/prdGeneratorTool"
import { sprintPlannerTool } from "./tools/sprintPlannerTool"
import { visualDesignTool } from "./tools/visualDesignTool"
import { feedbackRouterTool } from "./tools/feedbackRouterTool"
import { notionTool } from "./tools/notionTool"
import { ragKnowledgeTool } from "./tools/ragKnowledgeTool"

import { pineconeStore, initializePineconeIndex } from "./vectors/pineconeSetup"
import "dotenv/config"

// Initialize Pinecone with better error handling
initializePineconeIndex().catch(error => {
  console.warn(
    "⚠️ Pinecone initialization failed - RAG features will be unavailable:",
    error.message
  )
  // Don't throw error to prevent blocking the entire application
})

const storage = new LibSQLStore({
  url: process.env.DATABASE_URL || "file:./product-maestro.db",
})

// const pineconeStore = new PineconeStore({
//   apiKey: process.env.PINECONE_API_KEY!,
//   host: process.env.PINECONE_HOST!,
//   indexName: process.env.PINECONE_INDEX_NAME!,
// });

export const mastra = new Mastra({
  agents: {
    // Core Product Management Agents
    ideaGenerationAgent, // "The Brainstormer" - Product idea refinement
    userStoryGeneratorAgent, // "The Story Weaver" - User story creation
    prdAgent, // "The PRD Compiler" - PRD generation with Notion integration
    sprintPlannerAgent, // "The Sprint Architect" - Sprint planning with Linear integration
    visualDesignAgent, // "The Visual Strategist" - Visual workflows with Miro integration
    feedbackRouterAgent, // "The Workflow Navigator" - Feedback routing and orchestration
  },

  workflows: {
    // Production Workflows
    productDevelopmentWorkflow, // Original workflow (⚠️ has step chaining issues)
    conversationalProductWorkflow, // Enhanced conversational workflow with feedback routing
    simpleWorkflow, // Simplified workflow for testing
  },

  storage,
  logger: new PinoLogger({
    name: "ProductMaestro",
    level: "info",
  }),
})

// Export all agents for direct use (recommended for frontend integration)
export const agents = {
  ideaGeneration: ideaGenerationAgent,
  userStoryGenerator: userStoryGeneratorAgent,
  prd: prdAgent,
  sprintPlanner: sprintPlannerAgent,
  visualDesign: visualDesignAgent,
  feedbackRouter: feedbackRouterAgent,
}

// Export all workflows
export const workflows = {
  productDevelopment: productDevelopmentWorkflow,
  conversationalProduct: conversationalProductWorkflow,
  simple: simpleWorkflow,
}

// Export all tools for direct use
export const tools = {
  ideaGeneration: ideaGenerationTool,
  userStoryGenerator: userStoryGeneratorTool,
  prdGenerator: prdGeneratorTool,
  sprintPlanner: sprintPlannerTool,
  visualDesign: visualDesignTool,
  feedbackRouter: feedbackRouterTool,
  notion: notionTool,
  ragKnowledge: ragKnowledgeTool,
}

// Export types for frontend integration
export type * from "../types/productMaestro"

// Export test functions for development
export const testFunctions = {
  // Individual agent tests (✅ All working)
  testIdeaGeneration: async () => {
    const { testIdeaGenerationAgent } = await import(
      "./agents/ideaGenerationAgent"
    )
    return testIdeaGenerationAgent()
  },

  testUserStoryGenerator: async () => {
    const { testUserStoryGeneratorAgent } = await import(
      "./agents/userStoryGeneratorAgent"
    )
    return testUserStoryGeneratorAgent()
  },

  testPRDAgent: async () => {
    const { testPRDAgent } = await import("./agents/prdAgent")
    return testPRDAgent()
  },

  testSprintPlanner: async () => {
    const { testSprintPlannerAgent } = await import(
      "./agents/sprintPlannerAgent"
    )
    return testSprintPlannerAgent()
  },

  testVisualDesign: async () => {
    const { testVisualDesignAgent } = await import("./agents/visualDesignAgent")
    return testVisualDesignAgent()
  },

  testFeedbackRouter: async () => {
    const { testFeedbackRouterAgent } = await import(
      "./agents/feedbackRouterAgent"
    )
    return testFeedbackRouterAgent()
  },

  // Workflow tests (⚠️ Some have issues)
  testProductDevelopmentWorkflow: async () => {
    const { testProductDevelopmentWorkflow } = await import(
      "./workflows/productDevelopmentWorkflow"
    )
    return testProductDevelopmentWorkflow()
  },

  testConversationalWorkflow: async () => {
    const { testConversationalWorkflow } = await import(
      "./workflows/conversationalProductWorkflow"
    )
    return testConversationalWorkflow()
  },

  testSimpleWorkflow: async () => {
    const { testSimpleWorkflow } = await import("./workflows/simpleWorkflow")
    return testSimpleWorkflow()
  },

  // System validation test (✅ Working - 83% success rate)
  testSystemValidation: async () => {
    const { runSimpleTest } = await import("../test/simpleEndToEndTest")
    return runSimpleTest()
  },
}

// Utility function for frontend integration
export const createProductMaestroSession = (sessionId?: string) => {
  const id =
    sessionId ||
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return {
    sessionId: id,

    // Individual agent calls (✅ Recommended approach)
    async generateIdea(rawIdea: string, additionalContext?: string) {
      return agents.ideaGeneration.generate(
        `
        I have a product idea I'd like to develop: "${rawIdea}"
        ${additionalContext ? `\nAdditional context: ${additionalContext}` : ""}
        
        Please help me refine this idea and provide structured feedback.
      `,
        { conversationId: id }
      )
    },

    async generateUserStories(ideaContent: string) {
      return agents.userStoryGenerator.generate(
        `
        Based on this product idea: ${ideaContent}
        
        Please generate comprehensive user stories with acceptance criteria.
      `,
        { conversationId: id }
      )
    },

    async generatePRD(ideaContent: string, userStoriesContent: string) {
      return agents.prd.generate(
        `
        Please create a comprehensive PRD based on:
        
        Product Idea: ${ideaContent}
        User Stories: ${userStoriesContent}
      `,
        { conversationId: id }
      )
    },

    async generateSprints(userStoriesContent: string) {
      return agents.sprintPlanner.generate(
        `
        Create sprint plans based on these user stories: ${userStoriesContent}
      `,
        { conversationId: id }
      )
    },

    async generateVisuals(ideaContent: string, userStoriesContent: string) {
      return agents.visualDesign.generate(
        `
        Create visual workflows for: ${ideaContent}
        Based on user stories: ${userStoriesContent}
      `,
        { conversationId: id }
      )
    },

    async routeFeedback(
      feedback: string,
      feedbackType: string,
      workflowState: any
    ) {
      return agents.feedbackRouter.generate(
        `
        Please analyze this user feedback and determine routing:
        
        Feedback Type: ${feedbackType}
        Content: "${feedback}"
        
        Current workflow state: ${JSON.stringify(workflowState)}
        
        Please use the feedback router tool to provide routing decision.
      `,
        { conversationId: id }
      )
    },
  }
}
