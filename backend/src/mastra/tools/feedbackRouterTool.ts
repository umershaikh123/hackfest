// src/mastra/tools/feedbackRouterTool.ts
import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import { FeedbackSchema, RoutingDecisionSchema, type Feedback, type RoutingDecision } from "../../types/productMaestro.js"

const FeedbackAnalysisInput = z.object({
  feedback: FeedbackSchema,
  currentWorkflowState: z.object({
    currentStep: z.string(),
    completedSteps: z.array(z.string()),
    productIdeaStatus: z.enum(["draft", "refined", "finalized"]).optional(),
    userStoriesStatus: z.enum(["pending", "generated", "reviewed"]).optional(),
    prdStatus: z.enum(["pending", "drafted", "published"]).optional(),
    sprintStatus: z.enum(["pending", "planned", "in_progress"]).optional(),
    visualStatus: z.enum(["pending", "created", "reviewed"]).optional(),
  }),
  conversationHistory: z.array(z.string()).optional(),
})

const FeedbackAnalysisOutput = z.object({
  routingDecision: RoutingDecisionSchema,
  additionalRecommendations: z.array(z.string()).optional(),
  estimatedTimeToComplete: z.string().optional(),
  requiresUserConfirmation: z.boolean().default(false),
})

export const feedbackRouterTool = createTool({
  id: "feedback_router_tool",
  description: `
    Analyzes user feedback and determines the optimal routing to appropriate agents.
    This tool acts as the intelligent router that:
    1. Analyzes the content and intent of user feedback
    2. Determines which agent should handle the feedback
    3. Provides specific instructions for the target agent
    4. Decides if the workflow should be suspended for user input
    5. Recommends additional actions or clarifications needed
  `,
  inputSchema: FeedbackAnalysisInput,
  outputSchema: FeedbackAnalysisOutput,
  execute: async ({ context, runtimeContext }) => {
    const { feedback, currentWorkflowState, conversationHistory } = context
    // Analyze feedback content and intent
    const feedbackContent = feedback.content.toLowerCase()
    const feedbackType = feedback.type
    
    // Initialize routing decision
    let routingDecision: RoutingDecision
    let additionalRecommendations: string[] = []
    let requiresUserConfirmation = false
    let estimatedTimeToComplete = "2-5 minutes"
    
    // Routing logic based on feedback type and content analysis
    switch (feedbackType) {
      case "idea_refinement":
        routingDecision = {
          targetAgent: "idea_generation",
          reasoning: "User wants to refine the core product idea or add/modify features",
          actionRequired: "Re-analyze and enhance the product idea based on user feedback",
          contextToPass: {
            originalIdea: currentWorkflowState,
            userFeedback: feedback.content,
            iterationType: "refinement"
          },
          shouldSuspendWorkflow: false
        }
        
        if (feedbackContent.includes("completely different") || feedbackContent.includes("start over")) {
          routingDecision.shouldSuspendWorkflow = true
          requiresUserConfirmation = true
          additionalRecommendations.push("Consider if this requires a complete restart of the workflow")
        }
        break
        
      case "user_story_modification":
        routingDecision = {
          targetAgent: "user_story_generator",
          reasoning: "User wants to modify, add, or remove user stories",
          actionRequired: "Update user stories based on feedback while maintaining consistency",
          contextToPass: {
            existingStories: currentWorkflowState,
            modifications: feedback.content,
            preserveConsistency: true
          },
          shouldSuspendWorkflow: false
        }
        
        if (feedbackContent.includes("priority") || feedbackContent.includes("points")) {
          additionalRecommendations.push("Update sprint planning to reflect story changes")
        }
        break
        
      case "prd_revision":
        routingDecision = {
          targetAgent: "prd_agent",
          reasoning: "User wants changes to the Product Requirements Document",
          actionRequired: "Revise PRD sections based on user feedback and republish if necessary",
          contextToPass: {
            existingPRD: currentWorkflowState,
            revisionRequests: feedback.content,
            shouldRepublish: true
          },
          shouldSuspendWorkflow: false
        }
        
        if (currentWorkflowState.prdStatus === "published") {
          additionalRecommendations.push("Will create an updated version of the published PRD")
          estimatedTimeToComplete = "3-7 minutes"
        }
        break
        
      case "sprint_adjustment":
        routingDecision = {
          targetAgent: "sprint_planner",
          reasoning: "User wants to adjust sprint planning, timeline, or resource allocation",
          actionRequired: "Update sprint plans based on feedback and sync with Linear if configured",
          contextToPass: {
            currentSprints: currentWorkflowState,
            adjustmentRequests: feedback.content,
            syncWithLinear: true
          },
          shouldSuspendWorkflow: false
        }
        
        if (feedbackContent.includes("timeline") || feedbackContent.includes("deadline")) {
          additionalRecommendations.push("Review all sprint timelines for consistency")
          estimatedTimeToComplete = "5-10 minutes"
        }
        break
        
      case "visual_design_change":
        routingDecision = {
          targetAgent: "visual_design",
          reasoning: "User wants changes to visual designs, wireframes, or user journey maps",
          actionRequired: "Update visual artifacts and Miro boards based on feedback",
          contextToPass: {
            existingDesigns: currentWorkflowState,
            designChanges: feedback.content,
            updateMiroBoards: true
          },
          shouldSuspendWorkflow: false
        }
        
        if (feedbackContent.includes("user flow") || feedbackContent.includes("journey")) {
          additionalRecommendations.push("Consider updating user stories to align with new user flows")
        }
        break
        
      case "general_clarification":
        // Analyze content to determine best agent for clarification
        if (feedbackContent.includes("feature") || feedbackContent.includes("idea")) {
          routingDecision = {
            targetAgent: "idea_generation",
            reasoning: "Clarification request related to product features or core idea",
            actionRequired: "Provide detailed clarification and enhance documentation",
            shouldSuspendWorkflow: true
          }
        } else if (feedbackContent.includes("story") || feedbackContent.includes("user")) {
          routingDecision = {
            targetAgent: "user_story_generator", 
            reasoning: "Clarification request related to user stories or personas",
            actionRequired: "Clarify user story details and provide additional context",
            shouldSuspendWorkflow: true
          }
        } else {
          routingDecision = {
            targetAgent: "workflow_orchestrator",
            reasoning: "General clarification that requires workflow-level understanding",
            actionRequired: "Provide comprehensive clarification and next steps",
            shouldSuspendWorkflow: true
          }
        }
        requiresUserConfirmation = true
        break
        
      case "workflow_direction":
        routingDecision = {
          targetAgent: "workflow_orchestrator",
          reasoning: "User wants to change workflow direction or skip/repeat steps",
          actionRequired: "Adjust workflow execution based on user direction",
          contextToPass: {
            currentState: currentWorkflowState,
            directionChange: feedback.content
          },
          shouldSuspendWorkflow: true
        }
        requiresUserConfirmation = true
        
        if (feedbackContent.includes("skip")) {
          additionalRecommendations.push("Ensure skipped steps don't break downstream dependencies")
        }
        break
        
      default:
        // Fallback routing based on content analysis
        routingDecision = {
          targetAgent: "workflow_orchestrator",
          reasoning: "Feedback type unclear, routing to orchestrator for analysis",
          actionRequired: "Analyze feedback and determine appropriate next steps",
          shouldSuspendWorkflow: true
        }
        requiresUserConfirmation = true
    }
    
    // Add priority-based recommendations
    if (feedback.priority === "urgent") {
      routingDecision.shouldSuspendWorkflow = true
      additionalRecommendations.push("High priority feedback - immediate attention required")
      estimatedTimeToComplete = "Immediate"
    }
    
    // Content-based additional analysis
    if (feedbackContent.includes("integration") || feedbackContent.includes("api")) {
      additionalRecommendations.push("Consider technical implications for integration planning")
    }
    
    if (feedbackContent.includes("user experience") || feedbackContent.includes("ux")) {
      additionalRecommendations.push("Review visual design and user story consistency")
    }
    
    return {
      routingDecision,
      additionalRecommendations,
      estimatedTimeToComplete,
      requiresUserConfirmation
    }
  }
})