/**
 * Agent API integration utilities for Product Maestro
 * Provides type-safe communication with backend AI agents
 */

export type AgentType =
  | "idea-generation"
  | "user-story"
  | "prd"
  | "sprint-planner"
  | "visual-design"
  | "feedback"

export interface AgentRequest {
  message: string
  context?: any
  sessionId?: string
}

export interface AgentResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    agentType: AgentType
    processingTime: number
    confidence: number
    sessionId?: string
  }
}

export interface IdeaGenerationResponse {
  refinedIdea: string
  features: string[]
  targetAudience: string
  problemStatement: string
  successCriteria: string[]
}

export interface UserStoryResponse {
  userStories: Array<{
    id: string
    title: string
    description: string
    acceptanceCriteria: string[]
    priority: "high" | "medium" | "low"
    storyPoints: number
  }>
  personas: Array<{
    name: string
    role: string
    goals: string[]
    painPoints: string[]
  }>
}

export interface PRDResponse {
  prdId: string
  notionPageId?: string
  notionUrl?: string
  sections: string[]
  wordCount: number
}

export interface SprintPlannerResponse {
  sprints: Array<{
    id: string
    name: string
    duration: number
    tasks: Array<{
      title: string
      description: string
      effort: number
      dependencies: string[]
    }>
  }>
  linearCycleId?: string
  linearUrl?: string
}

export interface VisualDesignResponse {
  boardId: string
  boardUrl: string
  artifacts: Array<{
    type: "user-journey" | "process-flow" | "wireframe"
    elementCount: number
    description: string
  }>
}

export interface FeedbackResponse {
  routedAgent: AgentType
  confidence: number
  reasoning: string
  suggestedAction: string
  requiresApproval: boolean
}

// API base URL configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

/**
 * Call a specific agent with error handling and type safety
 */
export async function callAgent<T = any>(
  agentType: AgentType,
  request: AgentRequest
): Promise<AgentResponse<T>> {
  try {
    const response = await fetch(`/api/agents/${agentType}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error(`Agent ${agentType} error:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      metadata: {
        agentType,
        processingTime: 0,
        confidence: 0,
      },
    }
  }
}

/**
 * Stream agent responses for real-time updates
 */
export async function streamAgentResponse(
  agentType: AgentType,
  request: AgentRequest
): Promise<ReadableStream> {
  const response = await fetch(`/api/agents/${agentType}/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(
      `Failed to stream from ${agentType}: ${response.statusText}`
    )
  }

  if (!response.body) {
    throw new Error("No response stream available")
  }

  return response.body
}

/**
 * Agent-specific API calls with proper typing
 */
export const agentAPI = {
  ideaGeneration: (request: AgentRequest) =>
    callAgent<IdeaGenerationResponse>("idea-generation", request),

  userStory: (request: AgentRequest) =>
    callAgent<UserStoryResponse>("user-story", request),

  prd: (request: AgentRequest) => callAgent<PRDResponse>("prd", request),

  sprintPlanner: (request: AgentRequest) =>
    callAgent<SprintPlannerResponse>("sprint-planner", request),

  visualDesign: (request: AgentRequest) =>
    callAgent<VisualDesignResponse>("visual-design", request),

  feedback: (request: AgentRequest) =>
    callAgent<FeedbackResponse>("feedback", request),
}

/**
 * Error handling utilities
 */
export function isAgentError(
  response: AgentResponse
): response is AgentResponse & { error: string } {
  return !response.success && !!response.error
}

export function getErrorMessage(response: AgentResponse): string {
  if (isAgentError(response)) {
    return response.error
  }
  return "Unknown error occurred"
}

/**
 * Agent query keys for React Query
 */
export const agentQueryKeys = {
  all: ["agents"] as const,
  agent: (type: AgentType) => [...agentQueryKeys.all, type] as const,
  agentSession: (type: AgentType, sessionId: string) =>
    [...agentQueryKeys.agent(type), sessionId] as const,
} as const
