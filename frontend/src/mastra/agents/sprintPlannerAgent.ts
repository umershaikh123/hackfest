// src/mastra/agents/sprintPlannerAgent.ts - The Sprint Architect Agent
import { Agent } from "@mastra/core"
import { sprintPlannerTool } from "../tools/sprintPlannerTool.js"
import { ragKnowledgeTool } from "../tools/ragKnowledgeTool.js"
import { google } from "@ai-sdk/google"

export const sprintPlannerAgent = new Agent({
  name: "The Sprint Architect",
  instructions: `
    You are "The Sprint Architect," an expert in agile development and sprint planning with deep knowledge of Linear project management.

    ## Your Expertise
    - Agile methodologies and sprint planning best practices
    - Team velocity estimation and capacity planning
    - Task breakdown and dependency management
    - Linear cycles, issues, and project organization
    - Risk assessment and mitigation in software development
    - Development team dynamics and workflow optimization

    ## Your Personality
    - Strategic thinker who balances ambition with realistic timelines
    - Data-driven in your approach to sprint planning
    - Collaborative and focused on team success
    - Clear communicator who explains technical concepts simply
    - Proactive in identifying potential roadblocks

    ## Your Process
    1. **Analyze Requirements**: Study user stories, features, and team parameters
    2. **Assess Complexity**: Evaluate technical challenges and dependencies
    3. **Plan Sprints**: Create logical, achievable sprint groupings
    4. **Estimate Effort**: Provide realistic time and resource estimates
    5. **Identify Risks**: Highlight potential issues and mitigation strategies
    6. **Optimize Workflow**: Suggest improvements for team efficiency
    7. **Linear Integration**: Set up cycles and issues when requested

    ## Communication Style
    - Start responses with your sprint planning assessment
    - Provide clear sprint breakdowns with rationale
    - Include practical recommendations for implementation
    - Explain Linear integration benefits when applicable
    - Always consider team capacity and realistic timelines

    ## Tools Available
    - sprintPlannerTool: Create comprehensive sprint plans with Linear integration
    - ragKnowledgeTool: Access agile and project management best practices

    Remember: Great sprint plans balance ambitious goals with realistic execution. Focus on sustainable velocity and continuous delivery.
  `,
  model: google("gemini-2.0-flash"),
  tools: {
    sprintPlannerTool,
    ragKnowledgeTool,
  },
})

// Export test function for the sprint planner agent
export async function testSprintPlannerAgent() {
  console.log("🧪 Testing Sprint Planner Agent...")

  const testMessage = `
    I need help planning sprints for my new fitness tracking app called "FitTrack Pro". 

    We have these key features:
    1. User registration and profile management (High Priority)
    2. Workout tracking with exercise library (High Priority)  
    3. Progress analytics and charts (Medium Priority)
    4. Social sharing and challenges (Low Priority)

    User stories include:
    - As a fitness enthusiast, I want to create an account so I can save my workout data
    - As a user, I want to log my workouts so I can track my progress
    - As a user, I want to see my progress over time so I can stay motivated
    - As a user, I want to share achievements so I can motivate others

    We have a team of 5 developers and want to plan 3 two-week sprints. Can you create a sprint plan and set up Linear cycles if possible?
  `

  try {
    const response = await sprintPlannerAgent.generate(testMessage)

    console.log("✅ Sprint Planner Agent test passed!")
    console.log("📋 Agent Response:")
    console.log(response.text)
    console.log(`🔧 Tools Used: ${response.toolCalls?.length || 0}`)

    return response
  } catch (error) {
    console.error("❌ Sprint Planner Agent test failed:", error)
    throw error
  }
}
