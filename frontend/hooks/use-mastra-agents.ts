/**
 * Enhanced React hooks for direct Mastra agent integration
 * Provides real-time communication with live Mastra server
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState, useCallback } from "react"
import {
  mastraClient,
  type MastraAgentId,
  type MastraAgentResponse,
} from "@/lib/mastra-client"
import { useToast } from "@/hooks/use-toast"

export interface MastraAgentState {
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  data: any
  error: string | null
  lastUpdated: Date | null
}

/**
 * Hook for direct Mastra server health monitoring
 */
export function useMastraHealth() {
  return useQuery({
    queryKey: ["mastra", "health"],
    queryFn: () => mastraClient.health(),
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 10000, // 10 seconds
  })
}

/**
 * Hook for getting available Mastra agents
 */
export function useMastraAgentList() {
  return useQuery({
    queryKey: ["mastra", "agents"],
    queryFn: async () => {
      // This would call the actual Mastra API to get agent list
      // For now, return the known agents
      return {
        ideaGenerationAgent: { name: "The Brainstormer", status: "active" },
        userStoryGeneratorAgent: { name: "The Story Weaver", status: "active" },
        prdAgent: { name: "The PRD Compiler", status: "active" },
        sprintPlannerAgent: { name: "The Sprint Architect", status: "active" },
        visualDesignAgent: { name: "The Visual Strategist", status: "active" },
        feedbackRouterAgent: {
          name: "The Workflow Navigator",
          status: "active",
        },
      }
    },
    staleTime: 60000, // 1 minute
  })
}

/**
 * Enhanced idea generation hook with direct Mastra integration
 */
export function useMastraIdeaGeneration() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({
      idea,
      context,
      conversationHistory = [],
    }: {
      idea: string
      context?: string
      conversationHistory?: any[]
    }) => {
      return await mastraClient.agents.ideaGeneration(
        idea,
        context,
        conversationHistory
      )
    },
    onSuccess: data => {
      toast({
        title: "Idea Generation Complete",
        description: "Your product idea has been refined and enhanced!",
      })
      queryClient.invalidateQueries({ queryKey: ["mastra", "conversation"] })
    },
    onError: (error: Error) => {
      toast({
        title: "Idea Generation Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  return {
    generateIdea: mutation.mutate,
    generateIdeaAsync: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    ideaData: mutation.data?.data,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error?.message || null,
    reset: mutation.reset,
  }
}

/**
 * User story generation hook with Mastra integration
 */
export function useMastraUserStoryGeneration() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({
      productIdea,
      userPersonas,
      conversationHistory = [],
    }: {
      productIdea: any
      userPersonas: any[]
      conversationHistory?: any[]
    }) => {
      return await mastraClient.agents.userStoryGeneration(
        productIdea,
        userPersonas,
        conversationHistory
      )
    },
    onSuccess: () => {
      toast({
        title: "User Stories Generated",
        description:
          "Comprehensive user stories with acceptance criteria have been created!",
      })
      queryClient.invalidateQueries({ queryKey: ["mastra", "conversation"] })
    },
    onError: (error: Error) => {
      toast({
        title: "User Story Generation Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  return {
    generateUserStories: mutation.mutate,
    generateUserStoriesAsync: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    userStoriesData: mutation.data?.data,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error?.message || null,
    reset: mutation.reset,
  }
}

/**
 * PRD generation hook with Notion integration
 */
export function useMastraPRDGeneration() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({
      productIdea,
      userPersonas,
      userStories,
      conversationHistory = [],
    }: {
      productIdea: any
      userPersonas: any[]
      userStories: any[]
      conversationHistory?: any[]
    }) => {
      return await mastraClient.agents.prdGeneration(
        productIdea,
        userPersonas,
        userStories,
        conversationHistory
      )
    },
    onSuccess: data => {
      toast({
        title: "PRD Generated Successfully",
        description:
          "Your Product Requirements Document has been created and published to Notion!",
      })
      queryClient.invalidateQueries({ queryKey: ["mastra", "conversation"] })
    },
    onError: (error: Error) => {
      toast({
        title: "PRD Generation Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  return {
    generatePRD: mutation.mutate,
    generatePRDAsync: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    prdData: mutation.data?.data,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error?.message || null,
    reset: mutation.reset,
  }
}

/**
 * Sprint planning hook with Linear integration
 */
export function useMastraSprintPlanning() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({
      userStories,
      teamVelocity = 20,
      sprintDuration = 2,
      conversationHistory = [],
      productTitle = "Product Development",
      features = [],
      createLinearProject = true,
    }: {
      userStories: any[]
      teamVelocity?: number
      sprintDuration?: number
      conversationHistory?: any[]
      productTitle?: string
      features?: any[]
      createLinearProject?: boolean
    }) => {
      return await mastraClient.agents.sprintPlanning(
        userStories,
        teamVelocity,
        sprintDuration,
        conversationHistory,
        createLinearProject,
        productTitle,
        features
      )
    },
    onSuccess: () => {
      toast({
        title: "Sprint Plan Created",
        description:
          "Your development sprint plan has been created with Linear integration!",
      })
      queryClient.invalidateQueries({ queryKey: ["mastra", "conversation"] })
    },
    onError: (error: Error) => {
      toast({
        title: "Sprint Planning Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  return {
    generateSprintPlan: mutation.mutate,
    generateSprintPlanAsync: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    sprintData: mutation.data?.data,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error?.message || null,
    reset: mutation.reset,
  }
}

/**
 * Visual design hook with Miro integration
 */
export function useMastraVisualDesign() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({
      projectTitle,
      designType = "comprehensive_board",
      prdContent,
      conversationHistory = [],
    }: {
      projectTitle: string
      designType?: "comprehensive_board" | "user_journey" | "process_workflow"
      prdContent: any
      conversationHistory?: any[]
    }) => {
      return await mastraClient.agents.visualDesign(
        projectTitle,
        designType,
        prdContent,
        conversationHistory
      )
    },
    onSuccess: () => {
      toast({
        title: "Visual Design Created",
        description: "Your visual workflow diagrams have been created in Miro!",
      })
      queryClient.invalidateQueries({ queryKey: ["mastra", "conversation"] })
    },
    onError: (error: Error) => {
      toast({
        title: "Visual Design Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  return {
    generateVisualDesign: mutation.mutate,
    generateVisualDesignAsync: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    visualData: mutation.data?.data,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error?.message || null,
    reset: mutation.reset,
  }
}

/**
 * Feedback routing hook
 */
export function useMastraFeedbackRouting() {
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: async ({
      feedback,
      context,
      conversationHistory = [],
    }: {
      feedback: string
      context: any
      conversationHistory?: any[]
    }) => {
      return await mastraClient.agents.feedbackRouting(
        feedback,
        context,
        conversationHistory
      )
    },
    onSuccess: data => {
      toast({
        title: "Feedback Routed",
        description: `Your feedback has been routed to the appropriate agent: ${data.data?.routedAgent}`,
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Feedback Routing Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  return {
    routeFeedback: mutation.mutate,
    routeFeedbackAsync: mutation.mutateAsync,
    isRouting: mutation.isPending,
    routingData: mutation.data?.data,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error?.message || null,
    reset: mutation.reset,
  }
}

/**
 * Complete workflow orchestration hook
 */
export function useMastraWorkflow() {
  const [workflowState, setWorkflowState] = useState<{
    currentStep: string
    completedSteps: string[]
    isRunning: boolean
    results: Record<string, any>
    error: string | null
  }>({
    currentStep: "",
    completedSteps: [],
    isRunning: false,
    results: {},
    error: null,
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const runCompleteWorkflow = useCallback(
    async (initialIdea: string) => {
      setWorkflowState(prev => ({ ...prev, isRunning: true, error: null }))

      try {
        const workflow = new mastraClient.workflow()

        // Set up progress tracking
        const steps = ["idea", "userStories", "prd", "sprints", "visual"]
        let currentStepIndex = 0

        const updateProgress = (step: string, result?: any) => {
          setWorkflowState(prev => ({
            ...prev,
            currentStep: step,
            completedSteps: [...prev.completedSteps, step],
            results: result
              ? { ...prev.results, [step]: result }
              : prev.results,
          }))
        }

        // Run the complete workflow
        const results = await workflow.runCompleteWorkflow(initialIdea)

        // Update final state
        setWorkflowState(prev => ({
          ...prev,
          isRunning: false,
          currentStep: "completed",
          results: results,
        }))

        toast({
          title: "Workflow Completed",
          description:
            "Complete product development artifacts have been generated!",
        })

        queryClient.invalidateQueries({ queryKey: ["mastra", "conversation"] })

        return results
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error"
        setWorkflowState(prev => ({
          ...prev,
          isRunning: false,
          error: errorMessage,
        }))

        toast({
          title: "Workflow Failed",
          description: errorMessage,
          variant: "destructive",
        })

        throw error
      }
    },
    [toast, queryClient]
  )

  const resetWorkflow = useCallback(() => {
    setWorkflowState({
      currentStep: "",
      completedSteps: [],
      isRunning: false,
      results: {},
      error: null,
    })
  }, [])

  return {
    runCompleteWorkflow,
    resetWorkflow,
    workflowState,
    isRunning: workflowState.isRunning,
    currentStep: workflowState.currentStep,
    completedSteps: workflowState.completedSteps,
    results: workflowState.results,
    error: workflowState.error,
  }
}

/**
 * Combined hook for all Mastra agents with unified state management
 */
export function useMastraAgents() {
  const ideaGeneration = useMastraIdeaGeneration()
  const userStoryGeneration = useMastraUserStoryGeneration()
  const prdGeneration = useMastraPRDGeneration()
  const sprintPlanning = useMastraSprintPlanning()
  const visualDesign = useMastraVisualDesign()
  const feedbackRouting = useMastraFeedbackRouting()
  const workflow = useMastraWorkflow()
  const health = useMastraHealth()
  const agentList = useMastraAgentList()

  const isAnyGenerating =
    ideaGeneration.isGenerating ||
    userStoryGeneration.isGenerating ||
    prdGeneration.isGenerating ||
    sprintPlanning.isGenerating ||
    visualDesign.isGenerating ||
    feedbackRouting.isRouting ||
    workflow.isRunning

  const resetAll = () => {
    ideaGeneration.reset()
    userStoryGeneration.reset()
    prdGeneration.reset()
    sprintPlanning.reset()
    visualDesign.reset()
    feedbackRouting.reset()
    workflow.resetWorkflow()
  }

  return {
    // Individual agents
    ideaGeneration,
    userStoryGeneration,
    prdGeneration,
    sprintPlanning,
    visualDesign,
    feedbackRouting,

    // Workflow orchestration
    workflow,

    // System monitoring
    health,
    agentList,

    // Global state
    isAnyGenerating,
    resetAll,
  }
}

export default useMastraAgents
