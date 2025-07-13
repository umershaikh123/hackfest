/**
 * Direct Mastra API Client for Product Maestro Frontend
 * Provides direct communication with Mastra server at localhost:4111
 */

// Mastra server configuration
const MASTRA_BASE_URL = process.env.NEXT_PUBLIC_MASTRA_API_URL || "http://localhost:4111"

export type MastraAgentId = 
  | "ideaGenerationAgent"
  | "userStoryGeneratorAgent" 
  | "prdAgent"
  | "sprintPlannerAgent"
  | "visualDesignAgent"
  | "feedbackRouterAgent"

export interface MastraMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface MastraAgentRequest {
  messages: MastraMessage[]
  threadId?: string
  resourceId?: string
  runId?: string
  output?: any
}

export interface MastraAgentResponse {
  success: boolean
  data?: any
  error?: string
  metadata?: {
    agentId: string
    processingTime: number
    toolCalls?: any[]
    usage?: any
  }
}

/**
 * Get list of available agents from Mastra server
 */
export async function getMastraAgents(): Promise<Record<string, any>> {
  try {
    const response = await fetch(`${MASTRA_BASE_URL}/api/agents`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch Mastra agents:', error)
    throw error
  }
}

/**
 * Get specific agent details from Mastra server
 */
export async function getMastraAgent(agentId: MastraAgentId): Promise<any> {
  try {
    const response = await fetch(`${MASTRA_BASE_URL}/api/agents/${agentId}`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch agent ${agentId}:`, error)
    throw error
  }
}

/**
 * Call Mastra agent with message
 */
export async function callMastraAgent(
  agentId: MastraAgentId,
  request: MastraAgentRequest
): Promise<MastraAgentResponse> {
  const startTime = Date.now()
  
  try {
    const response = await fetch(`${MASTRA_BASE_URL}/api/agents/${agentId}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    const processingTime = Date.now() - startTime

    return {
      success: true,
      data: result,
      metadata: {
        agentId,
        processingTime,
        toolCalls: result.toolCalls,
        usage: result.usage,
      },
    }
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error(`Mastra agent ${agentId} error:`, error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      metadata: {
        agentId,
        processingTime,
      },
    }
  }
}

/**
 * Stream Mastra agent responses for real-time updates
 */
export async function streamMastraAgent(
  agentId: MastraAgentId,
  request: MastraAgentRequest
): Promise<ReadableStream> {
  const response = await fetch(`${MASTRA_BASE_URL}/api/agents/${agentId}/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Failed to stream from ${agentId}: ${response.statusText}`)
  }

  if (!response.body) {
    throw new Error('No response stream available')
  }

  return response.body
}

/**
 * Helper to create properly formatted messages for Mastra agents
 */
export function createMastraMessage(content: string, role: "user" | "assistant" | "system" = "user"): MastraMessage {
  return { role, content }
}

/**
 * Helper to create agent request with conversation context
 */
export function createMastraRequest(
  userMessage: string,
  conversationHistory: MastraMessage[] = [],
  options: Partial<MastraAgentRequest> = {}
): MastraAgentRequest {
  // Limit conversation history to prevent payload size issues
  const limitedHistory = conversationHistory.slice(-5) // Keep only last 5 messages
  
  return {
    messages: [
      ...limitedHistory,
      createMastraMessage(userMessage, "user")
    ],
    threadId: options.threadId || `thread-${Date.now()}`,
    resourceId: options.resourceId || `resource-${Date.now()}`,
    runId: options.runId || `run-${Date.now()}`,
    ...options,
  }
}

/**
 * Specialized agent callers with proper typing
 */
export const mastraAgents = {
  /**
   * Idea Generation Agent - "The Brainstormer"
   */
  ideaGeneration: async (
    rawIdea: string,
    additionalContext?: string,
    conversationHistory: MastraMessage[] = []
  ): Promise<MastraAgentResponse> => {
    const prompt = `I have a product idea I'd like to develop: "${rawIdea}"
    ${additionalContext ? `\nAdditional context: ${additionalContext}` : ''}
    
    Please help me refine this idea and provide structured feedback including:
    - A refined version of the idea with clear value proposition
    - Key features to implement
    - Target audience analysis
    - Problem statement and market validation
    - Success criteria and measurable goals
    - Next steps for development`

    const request = createMastraRequest(prompt, conversationHistory)
    return await callMastraAgent("ideaGenerationAgent", request)
  },

  /**
   * User Story Generator Agent - "The Story Weaver"
   */
  userStoryGeneration: async (
    productIdea: any,
    userPersonas: any[],
    conversationHistory: MastraMessage[] = []
  ): Promise<MastraAgentResponse> => {
    const prompt = `Based on this product idea and user personas, please generate comprehensive user stories:

Product Idea:
${JSON.stringify(productIdea, null, 2)}

User Personas:
${JSON.stringify(userPersonas, null, 2)}

Please create:
- Epic groupings of related functionality
- Detailed user stories with "As a... I want... So that..." format
- Comprehensive acceptance criteria for each story
- Priority rankings (critical/high/medium/low)
- Story point estimates using Fibonacci scale
- Implementation order recommendations
- MVP story identification`

    const request = createMastraRequest(prompt, conversationHistory)
    return await callMastraAgent("userStoryGeneratorAgent", request)
  },

  /**
   * PRD Compiler Agent - "The PRD Compiler"
   */
  prdGeneration: async (
    productIdea: any,
    userPersonas: any[],
    userStories: any[],
    conversationHistory: MastraMessage[] = []
  ): Promise<MastraAgentResponse> => {
    // Limit data to prevent payload size issues
    const limitedIdea = {
      title: productIdea?.title || productIdea?.name || "Product Idea",
      description: productIdea?.description || productIdea?.summary || "",
      features: Array.isArray(productIdea?.features) ? productIdea.features.slice(0, 5) : []
    }
    
    const limitedPersonas = Array.isArray(userPersonas) ? userPersonas.slice(0, 3) : []
    const limitedStories = Array.isArray(userStories) ? userStories.slice(0, 5) : []

    const prompt = `Please create a comprehensive Product Requirements Document (PRD) based on this information:

Product Idea:
${JSON.stringify(limitedIdea, null, 2)}

User Personas:
${JSON.stringify(limitedPersonas, null, 2)}

User Stories:
${JSON.stringify(limitedStories, null, 2)}

Please generate a professional PRD including:
- Executive summary
- Problem statement and solution overview
- Target market and user personas
- Feature specifications with acceptance criteria
- Technical requirements and constraints
- Success metrics and KPIs
- Timeline and dependencies
- Risk assessment and mitigation
- Future considerations

Format the output for publication to Notion with proper structure and formatting.`

    const request = createMastraRequest(prompt, conversationHistory)
    return await callMastraAgent("prdAgent", request)
  },

  /**
   * Sprint Planner Agent - "The Sprint Architect"
   */
  sprintPlanning: async (
    userStories: any[],
    teamVelocity: number = 20,
    sprintDuration: number = 2,
    conversationHistory: MastraMessage[] = [],
    createLinearProject: boolean = true,
    productTitle: string = "Product Development",
    features: any[] = []
  ): Promise<MastraAgentResponse> => {
    // Format user stories for the backend tool
    const formattedStories = Array.isArray(userStories) 
      ? userStories.slice(0, 5).map(story => ({
          id: story.id || `US${Math.floor(Math.random() * 1000)}`,
          title: story.title || story.name || 'User Story',
          priority: story.priority || 'medium',
          storyPoints: story.storyPoints || story.effort || 3,
          persona: story.persona || 'User',
          userAction: story.userAction || story.description || 'User wants to perform action',
          benefit: story.benefit || 'To achieve desired outcome',
          acceptanceCriteria: story.acceptanceCriteria || ['Story criteria defined']
        }))
      : []

    // Format features for the backend tool
    const formattedFeatures = Array.isArray(features)
      ? features.slice(0, 3).map(feature => ({
          name: feature.name || feature.title || 'Feature',
          description: feature.description || 'Feature description',
          priority: feature.priority || 'medium',
          acceptanceCriteria: feature.acceptanceCriteria || ['Feature criteria defined']
        }))
      : []

    // Create a prompt that instructs the agent to use the sprintPlannerTool
    const prompt = `Create a sprint plan for "${productTitle}" with the following user stories and features:

User Stories:
${formattedStories.map(story => `- ${story.title} (${story.storyPoints} points)`).join('\n')}

Features:
${formattedFeatures.map(feature => `- ${feature.name}: ${feature.description}`).join('\n')}

Team: ${5} developers, ${sprintDuration}-week sprints, Linear integration: ${createLinearProject}

Please use the sprintPlannerTool to create the sprint plan.`

    const request = createMastraRequest(prompt, conversationHistory)
    return await callMastraAgent("sprintPlannerAgent", request)
  },

  /**
   * Visual Design Agent - "The Visual Strategist"
   */
  visualDesign: async (
    projectTitle: string,
    designType: "comprehensive_board" | "user_journey" | "process_workflow",
    prdContent: any,
    conversationHistory: MastraMessage[] = []
  ): Promise<MastraAgentResponse> => {
    // Limit PRD content to prevent payload size issues
    const limitedContent = {
      features: Array.isArray(prdContent?.features) ? prdContent.features.slice(0, 3) : [],
      userStories: Array.isArray(prdContent?.userStories) ? prdContent.userStories.slice(0, 3) : [],
      summary: prdContent?.summary || projectTitle
    }

    const prompt = `Please create ${designType} visual design artifacts for this project:

Project: ${projectTitle}
Design Type: ${designType}

PRD Summary:
${JSON.stringify(limitedContent, null, 2)}

Please generate:
- Professional user journey maps with emotional states
- Process workflow diagrams with decision points
- Stakeholder-ready visual presentations
- Interactive Miro board with collaborative features
- Visual hierarchy and modern design elements
- User persona cards and journey touchpoints
- System architecture and integration flows`

    const request = createMastraRequest(prompt, conversationHistory)
    return await callMastraAgent("visualDesignAgent", request)
  },

  /**
   * Feedback Router Agent - "The Workflow Navigator"
   */
  feedbackRouting: async (
    userFeedback: string,
    currentContext: any,
    conversationHistory: MastraMessage[] = []
  ): Promise<MastraAgentResponse> => {
    const prompt = `Please analyze this user feedback and determine the best routing:

User Feedback: "${userFeedback}"

Current Context:
${JSON.stringify(currentContext, null, 2)}

Please provide:
- Which agent should handle this feedback
- Confidence level in the routing decision
- Reasoning for the routing choice
- Suggested action plan
- Whether user approval is required
- Estimated processing time`

    const request = createMastraRequest(prompt, conversationHistory)
    return await callMastraAgent("feedbackRouterAgent", request)
  },
}

/**
 * Multi-agent workflow orchestrator
 */
export class MastraWorkflow {
  private conversationHistory: MastraMessage[] = []
  private sessionId: string
  private resourceId: string

  constructor(sessionId?: string, resourceId?: string) {
    this.sessionId = sessionId || `session-${Date.now()}`
    this.resourceId = resourceId || `resource-${Date.now()}`
  }

  /**
   * Add message to conversation history
   */
  addMessage(message: MastraMessage) {
    this.conversationHistory.push(message)
  }

  /**
   * Get current conversation context
   */
  getConversationHistory(): MastraMessage[] {
    return [...this.conversationHistory]
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = []
  }

  /**
   * Run complete product development workflow
   */
  async runCompleteWorkflow(initialIdea: string): Promise<{
    idea: any
    userStories: any
    prd: any
    sprints: any
    visual: any
  }> {
    try {
      // Step 1: Generate refined idea
      console.log('🚀 Step 1: Generating refined idea...')
      const ideaResult = await mastraAgents.ideaGeneration(initialIdea, undefined, this.conversationHistory)
      if (!ideaResult.success) throw new Error(`Idea generation failed: ${ideaResult.error}`)
      
      this.addMessage(createMastraMessage(initialIdea, "user"))
      this.addMessage(createMastraMessage(JSON.stringify(ideaResult.data), "assistant"))

      // Step 2: Generate user stories
      console.log('📝 Step 2: Generating user stories...')
      const userStoriesResult = await mastraAgents.userStoryGeneration(
        ideaResult.data, 
        [], // Will be extracted from idea result
        this.conversationHistory
      )
      if (!userStoriesResult.success) throw new Error(`User story generation failed: ${userStoriesResult.error}`)
      
      this.addMessage(createMastraMessage(JSON.stringify(userStoriesResult.data), "assistant"))

      // Step 3: Generate PRD
      console.log('📋 Step 3: Generating PRD...')
      const prdResult = await mastraAgents.prdGeneration(
        ideaResult.data,
        [], // Will be extracted from user stories result
        userStoriesResult.data,
        this.conversationHistory
      )
      if (!prdResult.success) throw new Error(`PRD generation failed: ${prdResult.error}`)
      
      this.addMessage(createMastraMessage(JSON.stringify(prdResult.data), "assistant"))

      // Step 4: Generate sprint plan
      console.log('⚡ Step 4: Generating sprint plan...')
      // Only pass essential data to avoid payload size limits
      const limitedHistory = this.conversationHistory.slice(-2) // Only last 2 messages
      const sprintResult = await mastraAgents.sprintPlanning(
        userStoriesResult.data,
        20, // Default team velocity
        2,  // Default sprint duration
        limitedHistory
      )
      if (!sprintResult.success) throw new Error(`Sprint planning failed: ${sprintResult.error}`)
      
      this.addMessage(createMastraMessage(JSON.stringify(sprintResult.data), "assistant"))

      // Step 5: Generate visual design
      console.log('🎨 Step 5: Generating visual design...')
      // Limit conversation history and PRD content to avoid payload size issues
      const limitedHistoryVisual = this.conversationHistory.slice(-2)
      const visualResult = await mastraAgents.visualDesign(
        ideaResult.data?.title || "Product Vision",
        "comprehensive_board",
        {
          features: ideaResult.data?.features || [],
          userPersonas: [], // Will be extracted from results
          userStories: userStoriesResult.data || []
        },
        limitedHistoryVisual
      )
      if (!visualResult.success) throw new Error(`Visual design failed: ${visualResult.error}`)
      
      this.addMessage(createMastraMessage(JSON.stringify(visualResult.data), "assistant"))

      console.log('✅ Complete workflow finished successfully!')

      return {
        idea: ideaResult.data,
        userStories: userStoriesResult.data,
        prd: prdResult.data,
        sprints: sprintResult.data,
        visual: visualResult.data,
      }
    } catch (error) {
      console.error('❌ Workflow failed:', error)
      throw error
    }
  }
}

/**
 * Health check for Mastra server
 */
export async function checkMastraHealth(): Promise<{ status: 'healthy' | 'unhealthy', details?: any }> {
  try {
    const response = await fetch(`${MASTRA_BASE_URL}/api`)
    if (response.ok) {
      const text = await response.text()
      return { status: 'healthy', details: { message: text } }
    } else {
      return { status: 'unhealthy', details: { status: response.status, statusText: response.statusText } }
    }
  } catch (error) {
    return { status: 'unhealthy', details: { error: error instanceof Error ? error.message : 'Unknown error' } }
  }
}

/**
 * Export default client instance
 */
export const mastraClient = {
  agents: mastraAgents,
  workflow: MastraWorkflow,
  health: checkMastraHealth,
  utils: {
    createMessage: createMastraMessage,
    createRequest: createMastraRequest,
  },
}

export default mastraClient