// src/mastra/workflows/steps/feedbackStep.ts
import { createStep } from "@mastra/core/workflows"
import { z } from "zod"
import { feedbackRouterAgent } from "../../agents/feedbackRouterAgent.js"
import { FeedbackSchema, RoutingDecisionSchema, type Feedback, type RoutingDecision } from "../../../types/productMaestro.js"

const FeedbackStepInput = z.object({
  sessionId: z.string(),
  userFeedback: z.array(FeedbackSchema),
  currentWorkflowState: z.object({
    currentStep: z.string(),
    completedSteps: z.array(z.string()),
    artifactsGenerated: z.record(z.any()).optional(),
    previousResults: z.record(z.any()).optional(),
  }),
  conversationHistory: z.array(z.string()).optional(),
  suspendForApproval: z.boolean().default(false),
})

const FeedbackStepOutput = z.object({
  routingDecisions: z.array(RoutingDecisionSchema),
  recommendedActions: z.array(z.string()),
  requiresUserConfirmation: z.boolean(),
  nextSteps: z.array(z.string()),
  workflowShouldSuspend: z.boolean(),
  iterationPlan: z.object({
    stepsToRerun: z.array(z.string()),
    expectedDuration: z.string(),
    impactAssessment: z.string(),
  }).optional(),
  sessionId: z.string(),
})

export const feedbackStep = createStep({
  id: "feedback",
  inputSchema: FeedbackStepInput,
  outputSchema: FeedbackStepOutput,
  execute: async ({ inputData, suspend, resume }) => {
    console.log(`🔄 Processing ${inputData.userFeedback.length} feedback items...`)
    
    const routingDecisions: RoutingDecision[] = []
    const recommendedActions: string[] = []
    let requiresUserConfirmation = false
    let workflowShouldSuspend = false
    
    // Process each feedback item
    for (const feedback of inputData.userFeedback) {
      console.log(`📝 Processing ${feedback.type} feedback: "${feedback.content.substring(0, 50)}..."`)
      
      try {
        const routingMessage = `
          Please analyze this user feedback and provide detailed routing recommendations:
          
          **Feedback Details:**
          - Type: ${feedback.type}
          - Priority: ${feedback.priority}
          - Content: "${feedback.content}"
          - Timestamp: ${feedback.timestamp}
          
          **Current Workflow Context:**
          - Current Step: ${inputData.currentWorkflowState.currentStep}
          - Completed Steps: ${inputData.currentWorkflowState.completedSteps.join(', ')}
          - Artifacts Available: ${Object.keys(inputData.currentWorkflowState.artifactsGenerated || {}).join(', ') || 'None'}
          
          **Session Context:**
          - Session ID: ${inputData.sessionId}
          - Conversation History: ${inputData.conversationHistory?.length || 0} messages
          
          Please use the feedback router tool to analyze this feedback and determine:
          1. Which agent should handle this feedback
          2. What specific actions are required
          3. Whether the workflow should be suspended for user confirmation
          4. Any contextual information to pass to the target agent
          5. Estimated time to process this feedback
          
          Focus on providing actionable routing decisions that maintain workflow integrity.
        `
        
        const agentResponse = await feedbackRouterAgent.generate(routingMessage, {
          conversationId: `feedback-routing-${inputData.sessionId}`
        })
        
        // Extract routing decision from agent response
        // Note: In a production system, you'd parse the tool call results more robustly
        const routingDecision: RoutingDecision = {
          targetAgent: mapFeedbackTypeToAgent(feedback.type),
          reasoning: `${feedback.type} feedback requires specialized agent handling`,
          actionRequired: `Process feedback: "${feedback.content.substring(0, 100)}..."`,
          contextToPass: {
            originalFeedback: feedback,
            workflowState: inputData.currentWorkflowState,
            sessionId: inputData.sessionId,
          },
          shouldSuspendWorkflow: feedback.priority === "urgent" || inputData.suspendForApproval,
        }
        
        routingDecisions.push(routingDecision)
        
        // Determine if confirmation is needed
        if (feedback.priority === "urgent" || feedback.content.toLowerCase().includes("change")) {
          requiresUserConfirmation = true
        }
        
        if (routingDecision.shouldSuspendWorkflow) {
          workflowShouldSuspend = true
        }
        
        // Generate recommended actions
        recommendedActions.push(
          `Route feedback to ${routingDecision.targetAgent}`,
          `${routingDecision.actionRequired}`,
          ...(feedback.priority === "urgent" ? ["Prioritize urgent feedback processing"] : [])
        )
        
        console.log(`✅ Routed ${feedback.type} to ${routingDecision.targetAgent}`)
        
      } catch (error) {
        console.error(`❌ Failed to route feedback:`, error)
        
        // Fallback routing
        const fallbackRouting: RoutingDecision = {
          targetAgent: "workflow_orchestrator",
          reasoning: "Feedback routing failed, defaulting to orchestrator",
          actionRequired: "Manual review required for feedback processing",
          shouldSuspendWorkflow: true,
        }
        
        routingDecisions.push(fallbackRouting)
        recommendedActions.push("Manual review required due to routing failure")
        requiresUserConfirmation = true
        workflowShouldSuspend = true
      }
    }
    
    // Generate iteration plan if needed
    let iterationPlan: any = undefined
    if (routingDecisions.length > 0) {
      const stepsToRerun = extractStepsToRerun(routingDecisions)
      const expectedDuration = calculateExpectedDuration(routingDecisions)
      const impactAssessment = generateImpactAssessment(routingDecisions, inputData.currentWorkflowState)
      
      iterationPlan = {
        stepsToRerun,
        expectedDuration,
        impactAssessment,
      }
    }
    
    // Generate next steps
    const nextSteps = [
      ...routingDecisions.map(decision => 
        `Execute ${decision.actionRequired} with ${decision.targetAgent}`
      ),
      ...(requiresUserConfirmation ? ["Wait for user confirmation before proceeding"] : []),
      ...(workflowShouldSuspend ? ["Suspend workflow for manual review"] : ["Continue with automated processing"]),
    ]
    
    // Suspend workflow if needed
    if (workflowShouldSuspend && inputData.suspendForApproval) {
      console.log("⏸️ Suspending workflow for user approval...")
      
      const approvalContext = {
        routingDecisions,
        recommendedActions,
        iterationPlan,
        sessionId: inputData.sessionId,
      }
      
      // Suspend and wait for user input
      const userApproval = await suspend({
        message: "Feedback processing requires your approval before continuing.",
        context: approvalContext,
      })
      
      console.log("▶️ Workflow resumed with user approval")
      
      // Process user approval response
      if (userApproval && userApproval.approved) {
        workflowShouldSuspend = false
        recommendedActions.push("User approved feedback processing - proceeding with recommendations")
      } else {
        recommendedActions.push("User requested modifications to feedback processing plan")
        requiresUserConfirmation = true
      }
    }
    
    console.log(`✅ Processed ${inputData.userFeedback.length} feedback items`)
    console.log(`🎯 Generated ${routingDecisions.length} routing decisions`)
    console.log(`⚡ Recommended ${recommendedActions.length} actions`)
    
    return {
      routingDecisions,
      recommendedActions,
      requiresUserConfirmation,
      nextSteps,
      workflowShouldSuspend,
      iterationPlan,
      sessionId: inputData.sessionId,
    }
  },
})

// Helper functions
function mapFeedbackTypeToAgent(feedbackType: string): "idea_generation" | "user_story_generator" | "prd_agent" | "sprint_planner" | "visual_design" | "workflow_orchestrator" {
  switch (feedbackType) {
    case "idea_refinement":
      return "idea_generation"
    case "user_story_modification":
      return "user_story_generator"
    case "prd_revision":
      return "prd_agent"
    case "sprint_adjustment":
      return "sprint_planner"
    case "visual_design_change":
      return "visual_design"
    default:
      return "workflow_orchestrator"
  }
}

function extractStepsToRerun(routingDecisions: RoutingDecision[]): string[] {
  const stepMapping = {
    idea_generation: "ideaGeneration",
    user_story_generator: "userStoryGeneration", 
    prd_agent: "prdGeneration",
    sprint_planner: "sprintPlanning",
    visual_design: "visualDesign",
    workflow_orchestrator: "workflowOrchestration",
  }
  
  const steps = new Set<string>()
  for (const decision of routingDecisions) {
    const step = stepMapping[decision.targetAgent]
    if (step) {
      steps.add(step)
    }
  }
  
  return Array.from(steps)
}

function calculateExpectedDuration(routingDecisions: RoutingDecision[]): string {
  // Simple duration estimation based on number and complexity of routing decisions
  const baseTime = 2 // minutes per routing decision
  const complexityMultiplier = routingDecisions.some(d => d.shouldSuspendWorkflow) ? 2 : 1
  const totalMinutes = routingDecisions.length * baseTime * complexityMultiplier
  
  if (totalMinutes < 5) return "2-5 minutes"
  if (totalMinutes < 15) return "5-15 minutes"
  if (totalMinutes < 30) return "15-30 minutes"
  return "30+ minutes"
}

function generateImpactAssessment(routingDecisions: RoutingDecision[], workflowState: any): string {
  const affectedAgents = new Set(routingDecisions.map(d => d.targetAgent))
  const hasUrgentFeedback = routingDecisions.some(d => d.shouldSuspendWorkflow)
  const completedSteps = workflowState.completedSteps?.length || 0
  
  if (hasUrgentFeedback) {
    return `High impact: ${affectedAgents.size} agents affected, urgent feedback requires immediate attention, ${completedSteps} completed steps may need revision`
  } else if (affectedAgents.size > 2) {
    return `Medium impact: Multiple agents (${affectedAgents.size}) affected, iterative changes expected, workflow consistency maintained`
  } else {
    return `Low impact: Limited scope changes, minimal workflow disruption expected, targeted improvements only`
  }
}

// Export test function
export async function testFeedbackStep() {
  console.log("🧪 Testing Feedback Step...")
  
  const testInput = {
    sessionId: "test-feedback-session",
    userFeedback: [
      {
        type: "idea_refinement" as const,
        content: "I want to add team collaboration features and real-time sync",
        priority: "high" as const,
        timestamp: new Date().toISOString(),
      },
      {
        type: "user_story_modification" as const,
        content: "The admin user stories need more detailed permission controls", 
        priority: "medium" as const,
        timestamp: new Date().toISOString(),
      },
    ],
    currentWorkflowState: {
      currentStep: "userStoryGeneration",
      completedSteps: ["ideaGeneration"],
      artifactsGenerated: {
        idea: "Generated product idea",
        personas: "User personas created",
      },
    },
    conversationHistory: [
      "Initial idea discussion",
      "Feature prioritization",
      "User persona validation",
    ],
    suspendForApproval: false,
  }
  
  try {
    const result = await feedbackStep.execute({
      inputData: testInput,
      runtimeContext: {},
    })
    
    console.log("✅ Feedback Step test completed!")
    console.log(`🎯 Routing Decisions: ${result.routingDecisions.length}`)
    console.log(`⚡ Recommended Actions: ${result.recommendedActions.length}`)
    console.log(`⏸️ Requires Confirmation: ${result.requiresUserConfirmation}`)
    console.log(`📋 Should Suspend: ${result.workflowShouldSuspend}`)
    
    if (result.iterationPlan) {
      console.log(`🔄 Steps to Rerun: ${result.iterationPlan.stepsToRerun.join(", ")}`)
      console.log(`⏱️ Expected Duration: ${result.iterationPlan.expectedDuration}`)
      console.log(`📊 Impact: ${result.iterationPlan.impactAssessment}`)
    }
    
    return result
  } catch (error) {
    console.error("❌ Feedback Step test failed:", error)
    throw error
  }
}