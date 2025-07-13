// src/mastra/workflows/conversationalProductWorkflow.ts
import { createWorkflow, createStep } from "@mastra/core/workflows"
import { z } from "zod"
import { ideaGenerationStep } from "./steps/ideaGenerationStep"
import { userStoryGenerationStep } from "./steps/userStoryGenerationStep"
import { prdGenerationStep } from "./steps/prdGenerationStep"
import { sprintPlanningStep } from "./sprintPlanningStep"
import { visualDesignStep } from "./visualDesignStep"
import { feedbackRouterAgent } from "../agents/feedbackRouterAgent.js"
import { FeedbackSchema, RoutingDecisionSchema, type Feedback, type RoutingDecision } from "../../types/productMaestro.js"

// Enhanced input schema with feedback support
const ConversationalWorkflowInput = z.object({
  // Core workflow inputs
  rawIdea: z.string().describe("Initial product idea from the user"),
  additionalContext: z.string().optional(),
  userEmail: z.string().optional().describe("User's email for tracking"),
  
  // Integration settings
  notionDatabaseId: z.string().optional().describe("Notion database ID for PRD publishing"),
  linearTeamId: z.string().optional().describe("Linear team ID for project creation"),
  
  // Workflow configuration
  enableSprintPlanning: z.boolean().default(true).describe("Whether to generate sprint plans"),
  enableVisualDesign: z.boolean().default(true).describe("Whether to create visual workflows"),
  createLinearProject: z.boolean().default(false).describe("Whether to create Linear cycles"),
  
  // Team settings
  teamSize: z.number().default(4).describe("Development team size for sprint planning"),
  sprintLength: z.enum(["1 week", "2 weeks", "3 weeks", "4 weeks"]).default("2 weeks"),
  totalSprints: z.number().default(3).describe("Number of sprints to plan"),
  
  // Feedback and iteration support
  userFeedback: z.array(FeedbackSchema).optional().describe("User feedback for iterative refinement"),
  iterationMode: z.boolean().default(false).describe("Whether this is an iteration cycle"),
  targetStep: z.string().optional().describe("Specific step to run/re-run"),
  
  // Session management
  sessionId: z.string().optional().describe("Existing session ID for continuation"),
  previousResults: z.record(z.any()).optional().describe("Previous workflow results for context"),
})

// Enhanced output schema with feedback routing
const ConversationalWorkflowOutput = z.object({
  sessionId: z.string(),
  currentStep: z.string(),
  workflowMode: z.enum(["initial_run", "feedback_iteration", "step_refinement"]),
  
  // Core results
  ideaAnalysis: z.object({
    refinedIdea: z.any(),
    userPersonas: z.array(z.any()),
    clarifyingQuestions: z.array(z.string()),
    marketValidation: z.any(),
    nextSteps: z.array(z.string()),
  }).optional(),
  
  userStoryAnalysis: z.object({
    epics: z.array(z.any()),
    userStories: z.array(z.any()),
    implementationOrder: z.array(z.string()),
    mvpStories: z.array(z.string()),
    totalEstimate: z.any(),
    recommendations: z.array(z.string()),
    readyForNextStep: z.boolean(),
  }).optional(),
  
  prdAnalysis: z.object({
    success: z.boolean(),
    message: z.string(),
    notionPageUrl: z.string().optional(),
    notionPageId: z.string().optional(),
    prdTitle: z.string(),
    timestamp: z.string(),
    readyForNextStep: z.boolean(),
    recommendations: z.array(z.string()),
    nextSteps: z.array(z.string()),
  }).optional(),
  
  sprintPlanningAnalysis: z.object({
    success: z.boolean(),
    message: z.string(),
    sprintsGenerated: z.number(),
    sprintVelocity: z.number(),
    estimatedDuration: z.string(),
    linearIntegration: z.object({
      enabled: z.boolean(),
      cyclesCreated: z.number().optional(),
      issuesCreated: z.number().optional(),
    }),
    recommendations: z.array(z.string()),
    nextSteps: z.array(z.string()),
  }).optional(),
  
  visualDesignAnalysis: z.object({
    success: z.boolean(),
    message: z.string(),
    visualizations: z.array(z.object({
      type: z.string(),
      miroBoard: z.object({
        id: z.string(),
        name: z.string(),
        viewLink: z.string(),
        editLink: z.string().optional(),
      }),
      elementsCount: z.number(),
    })),
    designInsights: z.object({
      userExperienceGaps: z.array(z.string()),
      processOptimizations: z.array(z.string()),
      stakeholderRecommendations: z.array(z.string()),
    }),
    recommendations: z.array(z.string()),
    nextSteps: z.array(z.string()),
  }).optional(),
  
  // Feedback processing
  feedbackProcessing: z.object({
    feedbackReceived: z.array(FeedbackSchema),
    routingDecisions: z.array(RoutingDecisionSchema),
    iterationCount: z.number(),
    pendingActions: z.array(z.string()),
  }).optional(),
  
  // Workflow status
  status: z.enum([
    "completed",
    "waiting_for_input", 
    "waiting_for_feedback",
    "processing_feedback",
    "error",
    "ready_for_wireframes",
    "prd_published",
    "prd_failed", 
    "sprint_planning_completed",
    "sprint_planning_failed",
    "visual_design_completed",
    "visual_design_failed",
    "iteration_cycle",
    "suspended_for_approval",
  ]),
  
  conversationalContext: z.object({
    availableActions: z.array(z.string()),
    suggestedFeedbackTypes: z.array(z.string()),
    nextStepSuggestions: z.array(z.string()),
    canIterateOn: z.array(z.string()),
  }),
  
  // Quality metrics
  qualityMetrics: z.object({
    completionPercentage: z.number(),
    artifactsGenerated: z.number(),
    integrationsUsed: z.array(z.string()),
    timeElapsed: z.string(),
  }),
})

// Create an initialization step
const initializeSessionStep = createStep({
  id: "initializeSession",
  description: "Initialize or resume session and process any feedback",
  inputSchema: ConversationalWorkflowInput,
  outputSchema: z.object({
    sessionId: z.string(),
    workflowMode: z.enum(["initial_run", "feedback_iteration", "step_refinement"]),
    targetSteps: z.array(z.string()),
    feedbackRoutingResults: z.array(RoutingDecisionSchema).optional(),
  }),
  execute: async ({ inputData }) => {
    const sessionId = inputData.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Determine workflow mode
    let workflowMode: "initial_run" | "feedback_iteration" | "step_refinement" = "initial_run"
    let targetSteps: string[] = ["ideaGeneration", "userStoryGeneration", "prdGeneration"]
    let feedbackRoutingResults: RoutingDecision[] = []
    
    if (inputData.enableSprintPlanning) {
      targetSteps.push("sprintPlanning")
    }
    if (inputData.enableVisualDesign) {
      targetSteps.push("visualDesign")
    }
    
    // Process feedback if provided
    if (inputData.userFeedback && inputData.userFeedback.length > 0) {
      workflowMode = inputData.iterationMode ? "feedback_iteration" : "step_refinement"
      
      // Route each feedback item
      for (const feedback of inputData.userFeedback) {
        try {
          const routingResult = await feedbackRouterAgent.generate(`
            Please analyze this user feedback and determine routing:
            
            Feedback Type: ${feedback.type}
            Content: "${feedback.content}"
            Priority: ${feedback.priority}
            
            Current workflow state:
            - Target Step: ${inputData.targetStep || 'none specified'}
            - Previous Results Available: ${!!inputData.previousResults}
            - Session Mode: ${workflowMode}
            
            Use the feedback router tool to analyze and provide routing decision.
          `)
          
          // Extract routing decision from agent response
          // Note: In production, you'd parse the tool call results more robustly
          const routingDecision: RoutingDecision = {
            targetAgent: feedback.type === "idea_refinement" ? "idea_generation" :
                        feedback.type === "user_story_modification" ? "user_story_generator" :
                        feedback.type === "prd_revision" ? "prd_agent" :
                        feedback.type === "sprint_adjustment" ? "sprint_planner" :
                        feedback.type === "visual_design_change" ? "visual_design" :
                        "workflow_orchestrator",
            reasoning: "Routing based on feedback type analysis",
            actionRequired: "Process user feedback and update artifacts",
            shouldSuspendWorkflow: feedback.priority === "urgent",
          }
          
          feedbackRoutingResults.push(routingDecision)
          
          // Update target steps based on routing
          if (routingDecision.targetAgent === "idea_generation" && !targetSteps.includes("ideaGeneration")) {
            targetSteps.unshift("ideaGeneration")
          }
          if (routingDecision.targetAgent === "user_story_generator" && !targetSteps.includes("userStoryGeneration")) {
            targetSteps.push("userStoryGeneration")
          }
          // Add other agent mappings...
          
        } catch (error) {
          console.error("❌ Failed to route feedback:", error)
          // Continue with default routing
        }
      }
    }
    
    // Override target steps if specific step requested
    if (inputData.targetStep) {
      targetSteps = [inputData.targetStep]
      workflowMode = "step_refinement"
    }
    
    console.log(`🚀 Initializing ${workflowMode} workflow for session ${sessionId}`)
    console.log(`🎯 Target steps: ${targetSteps.join(', ')}`)
    
    return {
      sessionId,
      workflowMode,
      targetSteps,
      feedbackRoutingResults: feedbackRoutingResults.length > 0 ? feedbackRoutingResults : undefined,
    }
  }
})

export const conversationalProductWorkflow = createWorkflow({
  id: "conversational-product-workflow",
  description: "Complete conversational product development workflow with feedback routing and iterative refinement",
  inputSchema: ConversationalWorkflowInput,
  outputSchema: ConversationalWorkflowOutput,
})
.then(initializeSessionStep)
.then(ideaGenerationStep)
.then(userStoryGenerationStep)
.then(prdGenerationStep)
.then(sprintPlanningStep)
.then(visualDesignStep)
.map(async ({ inputData, getStepResult }) => {
  const sessionInit = getStepResult({ id: "initializeSession" })
  const ideaResult = getStepResult(ideaGenerationStep)
  const userStoryResult = getStepResult(userStoryGenerationStep)
  const prdResult = getStepResult(prdGenerationStep)
  const sprintResult = inputData.enableSprintPlanning ? getStepResult(sprintPlanningStep) : null
  const visualResult = inputData.enableVisualDesign ? getStepResult(visualDesignStep) : null
  
  // Calculate workflow status
  let status: typeof ConversationalWorkflowOutput._type.status = "completed"
  let currentStep = "workflow-completed"
  
  // Determine status based on results and mode
  if (sessionInit.workflowMode === "feedback_iteration") {
    status = "iteration_cycle"
    currentStep = "processing-feedback"
  } else if (visualResult && inputData.enableVisualDesign) {
    status = visualResult.success ? "visual_design_completed" : "visual_design_failed"
    currentStep = visualResult.success ? "visual-design-completed" : "visual-design-failed"
  } else if (sprintResult && inputData.enableSprintPlanning) {
    status = sprintResult.sprints.length > 0 ? "sprint_planning_completed" : "sprint_planning_failed"
    currentStep = sprintResult.sprints.length > 0 ? "sprint-planning-completed" : "sprint-planning-failed"
  } else if (prdResult?.success) {
    status = "prd_published"
    currentStep = "prd-published"
  } else if (prdResult && !prdResult.success) {
    status = "prd_failed"
    currentStep = "prd-failed"
  } else if (userStoryResult.readyForNextStep) {
    status = "ready_for_wireframes"
    currentStep = "ready-for-wireframes"
  } else if (ideaResult.clarifyingQuestions.length > 0) {
    status = "waiting_for_input"
    currentStep = "waiting-for-clarification"
  }
  
  // Calculate conversational context
  const availableActions = [
    "refine_idea",
    "modify_user_stories",
    "update_prd",
    ...(inputData.enableSprintPlanning ? ["adjust_sprints"] : []),
    ...(inputData.enableVisualDesign ? ["update_visuals"] : []),
    "restart_workflow",
    "export_artifacts",
  ]
  
  const suggestedFeedbackTypes = [
    "idea_refinement",
    "user_story_modification",
    "prd_revision",
    ...(inputData.enableSprintPlanning ? ["sprint_adjustment"] : []),
    ...(inputData.enableVisualDesign ? ["visual_design_change"] : []),
    "general_clarification",
  ]
  
  const canIterateOn = [
    "Product Idea & Features",
    "User Stories & Acceptance Criteria", 
    "Product Requirements Document",
    ...(inputData.enableSprintPlanning ? ["Sprint Planning & Timeline"] : []),
    ...(inputData.enableVisualDesign ? ["Visual Workflows & User Journeys"] : []),
  ]
  
  // Generate next step suggestions
  const nextStepSuggestions: string[] = []
  if (status === "visual_design_completed") {
    nextStepSuggestions.push(
      "Review all generated artifacts with your team",
      "Begin development with Sprint 1 tasks",
      "Share Miro boards with stakeholders for feedback",
      "Set up development environment and repositories",
      "Schedule regular sprint planning meetings",
    )
  } else if (status === "sprint_planning_completed") {
    nextStepSuggestions.push(
      "Review sprint plan with development team",
      "Create visual workflows to complement sprint planning",
      "Set up Linear workspace for sprint tracking",
      "Begin Sprint 1 with team kickoff meeting",
    )
  } else if (status === "prd_published") {
    nextStepSuggestions.push(
      "Review PRD with stakeholders in Notion",
      "Generate sprint planning for development timeline",
      "Create visual workflows and user journey maps",
      "Conduct technical feasibility assessment",
    )
  } else {
    nextStepSuggestions.push(
      "Continue with the next step in the workflow",
      "Provide feedback to refine current results",
      "Add clarifying details to improve output quality",
    )
  }
  
  // Calculate quality metrics
  let artifactsGenerated = 0
  const integrationsUsed: string[] = []
  
  if (ideaResult) artifactsGenerated++
  if (userStoryResult) artifactsGenerated++
  if (prdResult?.success) {
    artifactsGenerated++
    integrationsUsed.push("Notion")
  }
  if (sprintResult && sprintResult.sprints.length > 0) {
    artifactsGenerated++
    if (sprintResult.linearIntegration.enabled) {
      integrationsUsed.push("Linear")
    }
  }
  if (visualResult && visualResult.success) {
    artifactsGenerated++
    integrationsUsed.push("Miro")
  }
  
  const maxPossibleArtifacts = 2 + (inputData.enableSprintPlanning ? 1 : 0) + (inputData.enableVisualDesign ? 1 : 0) + (prdResult ? 1 : 0)
  const completionPercentage = Math.round((artifactsGenerated / maxPossibleArtifacts) * 100)
  
  return {
    sessionId: sessionInit.sessionId,
    currentStep,
    workflowMode: sessionInit.workflowMode,
    
    ideaAnalysis: ideaResult ? {
      refinedIdea: ideaResult.refinedIdea,
      userPersonas: ideaResult.userPersonas,
      clarifyingQuestions: ideaResult.clarifyingQuestions,
      marketValidation: ideaResult.marketValidation,
      nextSteps: ideaResult.nextSteps,
    } : undefined,
    
    userStoryAnalysis: userStoryResult ? {
      epics: userStoryResult.epics,
      userStories: userStoryResult.userStories,
      implementationOrder: userStoryResult.implementationOrder,
      mvpStories: userStoryResult.mvpStories,
      totalEstimate: userStoryResult.totalEstimate,
      recommendations: userStoryResult.recommendations,
      readyForNextStep: userStoryResult.readyForNextStep,
    } : undefined,
    
    prdAnalysis: prdResult ? {
      success: prdResult.success,
      message: prdResult.message,
      notionPageUrl: prdResult.notionPageUrl,
      notionPageId: prdResult.notionPageId,
      prdTitle: prdResult.prdTitle,
      timestamp: prdResult.timestamp,
      readyForNextStep: prdResult.readyForNextStep,
      recommendations: prdResult.recommendations,
      nextSteps: prdResult.nextSteps,
    } : undefined,
    
    sprintPlanningAnalysis: sprintResult && inputData.enableSprintPlanning ? {
      success: sprintResult.sprints.length > 0,
      message: sprintResult.sprints.length > 0 ? 
        `Successfully generated ${sprintResult.sprints.length} sprints` :
        "Sprint planning failed - no sprints generated",
      sprintsGenerated: sprintResult.sprints.length,
      sprintVelocity: sprintResult.summary.sprintVelocity,
      estimatedDuration: sprintResult.summary.estimatedDuration,
      linearIntegration: {
        enabled: sprintResult.linearIntegration.enabled,
        cyclesCreated: sprintResult.linearIntegration.cyclesCreated?.length,
        issuesCreated: sprintResult.linearIntegration.issuesCreated?.length,
      },
      recommendations: sprintResult.recommendations,
      nextSteps: sprintResult.nextSteps,
    } : undefined,
    
    visualDesignAnalysis: visualResult && inputData.enableVisualDesign ? {
      success: visualResult.success,
      message: visualResult.message,
      visualizations: visualResult.visualizations,
      designInsights: visualResult.designInsights,
      recommendations: visualResult.recommendations,
      nextSteps: visualResult.nextSteps,
    } : undefined,
    
    feedbackProcessing: inputData.userFeedback ? {
      feedbackReceived: inputData.userFeedback,
      routingDecisions: sessionInit.feedbackRoutingResults || [],
      iterationCount: 1, // TODO: track across sessions
      pendingActions: [], // TODO: extract from routing decisions
    } : undefined,
    
    status,
    
    conversationalContext: {
      availableActions,
      suggestedFeedbackTypes,
      nextStepSuggestions,
      canIterateOn,
    },
    
    qualityMetrics: {
      completionPercentage,
      artifactsGenerated,
      integrationsUsed,
      timeElapsed: "N/A", // TODO: calculate actual time
    },
  }
})
.commit()

// Test function for the conversational workflow
export async function testConversationalWorkflow() {
  console.log("🚀 Testing Conversational Product Workflow with All Integrations")

  const run = await conversationalProductWorkflow.createRunAsync()

  const result = await run.start({
    inputData: {
      rawIdea: "A mindfulness app that combines meditation with habit tracking and social accountability features",
      additionalContext: "Target busy professionals who want to build better mental health habits but struggle with consistency. Should integrate with calendar apps.",
      userEmail: "test@productmaestro.com",
      notionDatabaseId: process.env.NOTION_PRD_DATABASE_ID,
      linearTeamId: process.env.LINEAR_TEAM_ID,
      enableSprintPlanning: true,
      enableVisualDesign: true,
      createLinearProject: !!process.env.LINEAR_API_KEY,
      teamSize: 5,
      sprintLength: "2 weeks",
      totalSprints: 4,
    },
  })

  console.log("📊 Complete Conversational Workflow Result:")
  console.log("=".repeat(80))
  console.log("🔍 Session ID:", result.sessionId)
  console.log("🔍 Current Step:", result.currentStep)
  console.log("🔍 Workflow Mode:", result.workflowMode)
  console.log("🔍 Status:", result.status)
  console.log("📈 Completion:", `${result.qualityMetrics.completionPercentage}%`)
  console.log("🔗 Integrations Used:", result.qualityMetrics.integrationsUsed.join(", "))
  console.log("📋 Artifacts Generated:", result.qualityMetrics.artifactsGenerated)
  
  if (result.prdAnalysis) {
    console.log("\n📄 PRD Analysis:")
    console.log("  ✅ Success:", result.prdAnalysis.success)
    console.log("  🔗 Notion URL:", result.prdAnalysis.notionPageUrl)
  }
  
  if (result.sprintPlanningAnalysis) {
    console.log("\n⚡ Sprint Planning:")
    console.log("  ✅ Success:", result.sprintPlanningAnalysis.success)
    console.log("  📊 Sprints Generated:", result.sprintPlanningAnalysis.sprintsGenerated)
    console.log("  🔗 Linear Integration:", result.sprintPlanningAnalysis.linearIntegration.enabled)
  }
  
  if (result.visualDesignAnalysis) {
    console.log("\n🎨 Visual Design:")
    console.log("  ✅ Success:", result.visualDesignAnalysis.success)
    console.log("  📊 Visualizations:", result.visualDesignAnalysis.visualizations.length)
    console.log("  🔗 Miro Boards:", result.visualDesignAnalysis.visualizations.map(v => v.miroBoard.viewLink).join(", "))
  }
  
  console.log("\n💡 Next Steps:", result.conversationalContext.nextStepSuggestions.slice(0, 3).join(", "))
  console.log("🔄 Can Iterate On:", result.conversationalContext.canIterateOn.join(", "))

  return result
}

// Test feedback processing
export async function testFeedbackIteration() {
  console.log("🔄 Testing Feedback Iteration Workflow")
  
  const feedbackExample: Feedback = {
    type: "idea_refinement",
    content: "I want to add a feature for team challenges where colleagues can create mindfulness challenges together",
    priority: "high",
    timestamp: new Date().toISOString(),
  }
  
  const run = await conversationalProductWorkflow.createRunAsync()
  
  const result = await run.start({
    inputData: {
      rawIdea: "Mindfulness app with habit tracking",
      userFeedback: [feedbackExample],
      iterationMode: true,
      enableSprintPlanning: false,
      enableVisualDesign: false,
    },
  })
  
  console.log("🔄 Feedback Iteration Result:")
  console.log("  ✅ Workflow Mode:", result.workflowMode) 
  console.log("  📝 Feedback Processed:", result.feedbackProcessing?.feedbackReceived.length || 0)
  console.log("  🎯 Routing Decisions:", result.feedbackProcessing?.routingDecisions.length || 0)
  
  return result
}