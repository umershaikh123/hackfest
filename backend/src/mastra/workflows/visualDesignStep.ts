// src/mastra/workflows/visualDesignStep.ts - Visual Design Workflow Step
import { createStep } from "@mastra/core/workflows"
import { z } from "zod"
import { visualDesignAgent } from "../agents/visualDesignAgent.js"

export const visualDesignStep = createStep({
  id: "visualDesign",
  inputSchema: z.object({
    productTitle: z.string(),
    features: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        acceptanceCriteria: z.array(z.string()),
        priority: z.enum(["high", "medium", "low"]),
      })
    ),
    userPersonas: z.array(
      z.object({
        name: z.string(),
        role: z.string(),
        demographics: z.string(),
        needs: z.array(z.string()),
        painPoints: z.array(z.string()),
        goals: z.array(z.string()),
      })
    ).optional(),
    userStories: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        persona: z.string(),
        userAction: z.string(),
        benefit: z.string(),
        acceptanceCriteria: z.array(z.string()),
        priority: z.enum(["low", "medium", "high", "critical"]),
      })
    ).optional(),
    designRequirements: z.object({
      primaryVisualization: z.enum([
        "user_journey",
        "user_flow", 
        "process_diagram",
        "workflow_map",
        "persona_mapping",
        "feature_flowchart"
      ]).default("user_journey"),
      includePersonas: z.boolean().default(true),
      includeDecisionPoints: z.boolean().default(true),
      focusArea: z.enum(["user_experience", "business_process", "technical_flow"]).default("user_experience"),
    }).optional(),
    sessionId: z.string(),
  }),
  outputSchema: z.object({
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
    sessionId: z.string(),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    try {
      console.log(`🎨 Starting visual design for ${inputData.productTitle}...`)

      // Validate environment for Miro integration
      if (!process.env.MIRO_API_KEY) {
        console.warn("⚠️ Miro integration requested but MIRO_API_KEY not found")
        throw new Error("MIRO_API_KEY required for visual design generation")
      }

      const designRequirements = inputData.designRequirements || {
        primaryVisualization: "user_journey" as const,
        includePersonas: true,
        includeDecisionPoints: true,
        focusArea: "user_experience" as const,
      }

      // Prepare visual design message for the agent
      const visualDesignMessage = `
        Please create comprehensive visual workflows for "${inputData.productTitle}".

        ## Product Features (${inputData.features.length} total):
        ${inputData.features.map(f => `- ${f.name} (${f.priority} priority): ${f.description}`).join('\n')}

        ${inputData.userPersonas ? `
        ## User Personas (${inputData.userPersonas.length} total):
        ${inputData.userPersonas.map(persona => 
          `- ${persona.name} (${persona.role}): ${persona.needs.slice(0, 2).join(', ')}`
        ).join('\n')}
        ` : ''}

        ${inputData.userStories ? `
        ## User Stories (${inputData.userStories.length} total):
        ${inputData.userStories.map(story => 
          `- ${story.title} (${story.priority}): As a ${story.persona}, I want to ${story.userAction} so that ${story.benefit}`
        ).join('\n')}
        ` : ''}

        ## Design Requirements:
        - Primary Visualization: ${designRequirements.primaryVisualization.replace('_', ' ')}
        - Include Personas: ${designRequirements.includePersonas ? 'Yes' : 'No'}
        - Include Decision Points: ${designRequirements.includeDecisionPoints ? 'Yes' : 'No'}
        - Focus Area: ${designRequirements.focusArea.replace('_', ' ')}

        Please:
        1. Create a ${designRequirements.primaryVisualization.replace('_', ' ')} that visualizes the user experience
        2. Identify key user experience gaps and opportunities
        3. Provide recommendations for stakeholder communication
        4. Suggest process optimizations based on the visual analysis
        5. Create actionable next steps for the product team

        Focus on creating visuals that help product managers communicate effectively with stakeholders and identify optimization opportunities.
      `

      // Execute visual design with the agent
      const agentResponse = await visualDesignAgent.generate(visualDesignMessage, {
        toolData: {
          visualDesignTool: {
            projectTitle: inputData.productTitle,
            designType: designRequirements.primaryVisualization,
            prdContent: {
              features: inputData.features,
              userPersonas: inputData.userPersonas || [],
              userStories: inputData.userStories || [],
            },
            boardSettings: {
              includePersonas: designRequirements.includePersonas,
              includeDecisionPoints: designRequirements.includeDecisionPoints,
              includeAlternativePaths: false,
              colorScheme: "blue" as const,
            },
          }
        }
      })

      // Extract tool results if available
      let visualDesignResult: any = null
      if (agentResponse.toolCalls && agentResponse.toolCalls.length > 0) {
        const visualToolCall = agentResponse.toolCalls.find(call => call.toolName === 'visualDesignTool')
        if (visualToolCall) {
          visualDesignResult = visualToolCall.result
        }
      }

      // If no tool result, create a basic fallback
      if (!visualDesignResult) {
        console.warn("⚠️ No visual design tool result found, creating fallback response")
        return {
          success: false,
          message: "Visual design generation failed - Miro integration not available",
          visualizations: [],
          designInsights: {
            userExperienceGaps: ["Visual design tool not executed"],
            processOptimizations: ["Set up Miro API integration"],
            stakeholderRecommendations: ["Use manual wireframing tools"],
          },
          recommendations: [
            "Set up Miro API key for visual design generation",
            "Create manual wireframes based on user stories",
            "Use existing design tools for stakeholder communication",
          ],
          nextSteps: [
            "Configure Miro API integration",
            "Retry visual design generation",
            "Create wireframes manually if needed",
          ],
          sessionId: inputData.sessionId,
        }
      }

      // Process successful visual design result
      const visualizations = [{
        type: designRequirements.primaryVisualization,
        miroBoard: visualDesignResult.miroBoard,
        elementsCount: visualDesignResult.visualElements.itemsCreated,
      }]

      // Generate design insights
      const designInsights = generateDesignInsights(
        inputData.features,
        inputData.userStories || [],
        visualDesignResult.visualElements
      )

      // Generate comprehensive recommendations
      const recommendations = [
        ...visualDesignResult.recommendations,
        "Use the visual workflows for stakeholder alignment sessions",
        "Validate user flows with real user testing",
        "Iterate on the designs based on team feedback",
        "Reference visuals during development planning",
      ]

      // Generate next steps
      const nextSteps = [
        ...visualDesignResult.nextSteps,
        "Schedule stakeholder review session with Miro board",
        "Conduct user testing based on the visual flows",
        "Refine the workflows based on feedback",
        "Use visuals as reference for development sprints",
      ]

      console.log(`✅ Visual design completed for ${inputData.productTitle}`)
      console.log(`🎨 Generated ${visualizations.length} visualizations`)
      console.log(`📊 Created ${visualDesignResult.visualElements.itemsCreated} visual elements`)

      return {
        success: true,
        message: `Successfully created ${designRequirements.primaryVisualization} with ${visualDesignResult.visualElements.itemsCreated} elements`,
        visualizations,
        designInsights,
        recommendations,
        nextSteps,
        sessionId: inputData.sessionId,
      }

    } catch (error) {
      console.error("❌ Visual design step failed:", error)
      
      // Return error state with helpful guidance
      return {
        success: false,
        message: `Visual design failed: ${error.message}`,
        visualizations: [],
        designInsights: {
          userExperienceGaps: ["Visual design generation failed"],
          processOptimizations: ["Fix Miro API integration"],
          stakeholderRecommendations: ["Use alternative visualization tools"],
        },
        recommendations: [
          "Check Miro API key configuration",
          "Verify Miro API permissions",
          "Consider alternative visual design tools",
        ],
        nextSteps: [
          "Fix Miro integration issues",
          "Retry visual design generation",
          "Create manual wireframes if needed",
        ],
        sessionId: inputData.sessionId,
      }
    }
  },
})

// Helper function to generate design insights
function generateDesignInsights(features: any[], userStories: any[], visualElements: any) {
  const userExperienceGaps: string[] = []
  const processOptimizations: string[] = []
  const stakeholderRecommendations: string[] = []

  // Analyze features for UX gaps
  const highPriorityFeatures = features.filter(f => f.priority === "high")
  if (highPriorityFeatures.length > 3) {
    userExperienceGaps.push("Many high-priority features may overwhelm users - consider progressive disclosure")
  }

  if (features.some(f => f.name.toLowerCase().includes("auth") || f.name.toLowerCase().includes("login"))) {
    processOptimizations.push("Consider single sign-on or social login to reduce friction")
  }

  // Analyze user stories for patterns
  const criticalStories = userStories.filter(s => s.priority === "critical")
  if (criticalStories.length === 0) {
    userExperienceGaps.push("No critical user stories identified - ensure core user needs are prioritized")
  }

  if (userStories.length > 10) {
    processOptimizations.push("Large number of user stories - consider grouping into epics for better management")
  }

  // General stakeholder recommendations
  stakeholderRecommendations.push(
    "Use the visual workflows during stakeholder presentations",
    "Share Miro board with development team for reference",
    "Conduct user testing sessions using the flow diagrams"
  )

  if (visualElements.itemsCreated > 15) {
    stakeholderRecommendations.push("Complex workflow created - consider breaking into multiple focused sessions")
  }

  return {
    userExperienceGaps,
    processOptimizations,
    stakeholderRecommendations,
  }
}

// Export test function for the visual design step
export async function testVisualDesignStep() {
  console.log("🧪 Testing Visual Design Step...")

  const testInput = {
    productTitle: "FoodieHub",
    features: [
      {
        name: "Recipe Discovery",
        description: "Users can browse and search for recipes",
        acceptanceCriteria: ["Search functionality", "Filter by cuisine", "Recipe ratings"],
        priority: "high" as const,
      },
      {
        name: "Shopping List",
        description: "Generate shopping lists from recipes",
        acceptanceCriteria: ["Ingredient extraction", "List editing", "Store integration"],
        priority: "medium" as const,
      },
    ],
    userPersonas: [
      {
        name: "Home Cook Emma",
        role: "Cooking Enthusiast",
        demographics: "25-35 years, enjoys cooking",
        needs: ["Recipe inspiration", "Meal planning"],
        painPoints: ["Too many recipe sites", "Disorganized ingredients"],
        goals: ["Cook better meals", "Save time planning"],
      },
    ],
    userStories: [
      {
        id: "US001",
        title: "Discover new recipes",
        persona: "Home Cook Emma",
        userAction: "search for recipes by cuisine",
        benefit: "I can find inspiration for meals",
        acceptanceCriteria: ["Search bar", "Cuisine filters", "Recipe previews"],
        priority: "high" as const,
      },
    ],
    designRequirements: {
      primaryVisualization: "user_journey" as const,
      includePersonas: true,
      includeDecisionPoints: true,
      focusArea: "user_experience" as const,
    },
    sessionId: "test-session-visual-design",
  }

  try {
    const result = await visualDesignStep.execute({
      inputData: testInput,
      runtimeContext: {},
    })

    console.log("✅ Visual Design Step test completed!")
    console.log(`🎨 Success: ${result.success}`)
    console.log(`📊 Visualizations: ${result.visualizations.length}`)
    console.log(`💡 Recommendations: ${result.recommendations.length}`)
    console.log(`🔍 UX Gaps Identified: ${result.designInsights.userExperienceGaps.length}`)
    
    return result
  } catch (error) {
    console.error("❌ Visual Design Step test failed:", error)
    throw error
  }
}