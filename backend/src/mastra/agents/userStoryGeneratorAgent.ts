// src/mastra/agents/userStoryGeneratorAgent.ts

import { Agent } from "@mastra/core/agent"
import { google } from "@ai-sdk/google"
import { userStoryGeneratorTool } from "../tools/userStoryGeneratorTool"
import { ragKnowledgeTool } from "../tools/ragKnowledgeTool"
import { memory } from "./ideaGenerationAgent" // Reuse the same memory store

export const userStoryGeneratorAgent = new Agent({
  name: "User Story Generator Agent",
  description:
    "A specialized agent that transforms product ideas and features into well-structured user stories following industry best practices",
  instructions: `
    You are "The Story Weaver" - an expert Business Analyst and Agile Coach with 10+ years of experience crafting user stories that bridge the gap between product vision and development reality.

    ## Your Expertise:
    - **Agile Methodologies**: Deep understanding of Scrum, Kanban, and user story best practices
    - **User-Centered Design**: Expert at translating user needs into actionable development tasks
    - **Acceptance Criteria**: Skilled at defining clear, testable requirements
    - **Story Prioritization**: Experienced in using frameworks like MoSCoW, RICE, and Kano model
    - **Cross-functional Collaboration**: Adept at creating stories that work for designers, developers, and testers

    ## Your Approach:
    1. **Understand the Context**: Analyze the product idea, target users, and core features
    2. **Apply User Story Templates**: Use proven formats (As a... I want... So that...)
    3. **Define Clear Acceptance Criteria**: Create specific, measurable, and testable conditions
    4. **Prioritize Strategically**: Rank stories by value, complexity, and dependencies
    5. **Estimate Effort**: Assign story points using Fibonacci scale (1, 2, 3, 5, 8, 13)
    6. **Validate Completeness**: Ensure stories cover all user journeys and edge cases

    ## Communication Style:
    - **Structured & Clear**: Always organize stories in logical groups and priorities
    - **User-Focused**: Every story should clearly articulate user value
    - **Action-Oriented**: Stories should be specific and implementable
    - **Collaborative**: Ask clarifying questions to ensure complete coverage

    ## Your Tools:
    You have access to:
    - **User Story Generator Tool**: For creating structured user stories with acceptance criteria
    - **RAG Knowledge Tool**: For accessing best practices and templates from your knowledge base

    ## Story Quality Standards:
    Every user story you create must have:
    1. **Clear User Persona**: Who is this story for?
    2. **Specific Action**: What does the user want to do?
    3. **Clear Benefit**: Why do they want to do this?
    4. **Detailed Acceptance Criteria**: How do we know it's done?
    5. **Appropriate Priority**: How important is this story?
    6. **Realistic Estimate**: How much effort will this take?

    ## Response Format:
    When presenting user stories, organize them as:
    1. **Epic Overview** (if applicable)
    2. **Priority Groups** (Critical → High → Medium → Low)
    3. **Story Details** for each story
    4. **Dependencies** and suggested implementation order
    5. **Questions** for further clarification

    Remember: Great user stories are the foundation of successful product development. Make each story clear, valuable, and implementable.
  `,
  model: google("gemini-2.0-flash"),
  tools: {
    userStoryGeneratorTool,
    ragKnowledgeTool,
  },
  memory,
})

// Test function for the User Story Generator Agent
export async function testUserStoryGeneratorAgent() {
  const sampleProductIdea = {
    title: "HabitFlow",
    description:
      "A habit tracking app that helps people build better daily routines with gamification elements",
    problemStatement:
      "Young professionals struggle with maintaining consistent daily habits and routines",
    targetAudience:
      "Young professionals aged 25-35 who want to improve their productivity and wellbeing",
    coreFeatures: [
      "Habit tracking and streaks",
      "Gamification with points and badges",
      "Progress visualization",
      "Social challenges",
      "Customizable reminders",
      "Analytics and insights",
    ],
    businessModel: "Freemium with premium features",
    marketCategory: "Productivity & Health",
  }

  const sampleUserPersonas = [
    {
      name: "Busy Professional",
      role: "Primary User",
      demographics: "25-35 year old working professional",
      needs: [
        "Easy habit tracking",
        "Motivation to stay consistent",
        "Quick progress overview",
      ],
      painPoints: [
        "Forgets to track habits",
        "Loses motivation quickly",
        "Existing apps are too complex",
      ],
      goals: [
        "Build healthy routines",
        "Increase productivity",
        "Maintain work-life balance",
      ],
    },
    {
      name: "Wellness Enthusiast",
      role: "Secondary User",
      demographics: "Health-conscious individual",
      needs: ["Detailed analytics", "Social sharing", "Comprehensive tracking"],
      painPoints: ["Wants more detailed insights", "Needs community support"],
      goals: [
        "Optimize health metrics",
        "Share progress with others",
        "Discover new healthy habits",
      ],
    },
  ]

  const prompt = `
    I need to create user stories for my product. Here are the details:

    **Product Idea:**
    ${JSON.stringify(sampleProductIdea, null, 2)}

    **User Personas:**
    ${JSON.stringify(sampleUserPersonas, null, 2)}

    Please generate a comprehensive set of user stories that cover:
    1. Core functionality for habit tracking
    2. Gamification features
    3. Social features
    4. Analytics and insights
    5. User onboarding and account management

    Prioritize the stories and include detailed acceptance criteria for each one.
  `

  const response = await userStoryGeneratorAgent.generate(prompt, {
    maxSteps: 5,
  })

  console.log("🎯 User Story Generator Agent Response:")
  console.log(response.text)
  return response
}
