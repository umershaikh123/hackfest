import { pineconeStore, initializePineconeIndex } from "../rag/pineconeStore"
import { openai } from "@ai-sdk/openai"
import { embed } from "ai"
import "dotenv/config"
export async function populateKnowledgeBase() {
  console.log("📚 Populating Product Management Knowledge Base...")

  // Initialize index first
  await initializePineconeIndex()

  const indexName =
    process.env.PINECONE_INDEX_NAME || "product-maestro-knowledge"

  // Sample product management knowledge to ingest
  const knowledgeItems = [
    {
      id: "user-persona-template",
      title: "User Persona Template",
      category: "user-personas",
      content: `
        A user persona is a semi-fictional character based on your actual customers and market research. 
        
        Essential components of a user persona:
        1. Demographics: Age, gender, location, income level, education
        2. Psychographics: Interests, values, lifestyle, personality traits
        3. Behavioral patterns: How they interact with products, decision-making process
        4. Goals and motivations: What drives them, what they want to achieve
        5. Pain points and frustrations: Current problems they face
        6. Technology usage: Devices, platforms, digital comfort level
        7. Preferred communication channels: Email, social media, phone, etc.
        
        Best practices for creating personas:
        - Base on real data from user research, surveys, and interviews
        - Keep personas focused and specific rather than broad
        - Update personas regularly as you learn more about your users
        - Use personas to guide product decisions and feature prioritization
        - Create 3-5 primary personas maximum to avoid confusion
      `,
      source: "Product Management Best Practices",
    },
    {
      id: "prd-template",
      title: "Product Requirements Document (PRD) Template",
      category: "prd-templates",
      content: `
        A Product Requirements Document (PRD) is a comprehensive guide that defines what you're building and why.
        
        Essential PRD sections:
        1. Executive Summary: Brief overview of the product and its purpose
        2. Problem Statement: Clear definition of the problem being solved
        3. Target Audience: Detailed description of users and personas
        4. Product Overview: High-level description of the solution
        5. Features and Requirements: Detailed feature specifications
        6. User Stories: Specific scenarios and use cases
        7. Success Metrics: How success will be measured
        8. Technical Requirements: System requirements and constraints
        9. Timeline and Milestones: Development schedule
        10. Assumptions and Dependencies: Critical assumptions and external dependencies
        
        PRD best practices:
        - Keep it concise but comprehensive
        - Use clear, jargon-free language
        - Include wireframes or mockups when helpful
        - Prioritize features clearly (must-have vs. nice-to-have)
        - Update the PRD as requirements evolve
        - Get stakeholder sign-off before development begins
      `,
      source: "Product Management Best Practices",
    },
    {
      id: "rice-prioritization",
      title: "RICE Prioritization Framework",
      category: "prioritization",
      content: `
        RICE is a prioritization framework that helps product managers decide what to build first.
        
        RICE stands for:
        - Reach: How many users will be affected by this feature in a given time period?
        - Impact: How much will this feature improve the user experience when they encounter it?
        - Confidence: How confident are you in your estimates for Reach and Impact?
        - Effort: How much work is required to implement this feature?
        
        RICE Score Formula: (Reach × Impact × Confidence) / Effort
        
        How to use RICE:
        1. List all potential features or initiatives
        2. Score each component on a scale (e.g., 1-10 for Impact, percentage for Confidence)
        3. Calculate RICE scores for each item
        4. Rank items by their RICE scores
        5. Focus on high-scoring items first
        
        Benefits of RICE:
        - Removes bias from prioritization decisions
        - Forces teams to think quantitatively about features
        - Helps communicate priorities to stakeholders
        - Can be used at different levels (features, epics, initiatives)
      `,
      source: "Product Management Best Practices",
    },
    {
      id: "mvp-strategy",
      title: "MVP Definition and Strategy",
      category: "mvp-strategy",
      content: `
        A Minimum Viable Product (MVP) is the simplest version of a product that can be released to validate core assumptions and gather user feedback.
        
        MVP Principles:
        1. Focus on core value proposition
        2. Include only essential features
        3. Enable learning and feedback collection
        4. Minimize development time and cost
        5. Test key assumptions about the market
        
        How to define your MVP:
        1. Identify the core problem you're solving
        2. Define your target user clearly
        3. List all possible features
        4. Prioritize features by importance to core value
        5. Cut everything except the absolute essentials
        6. Plan how you'll measure success
        
        Common MVP mistakes:
        - Including too many features
        - Focusing on polish over functionality
        - Not having clear success metrics
        - Building for everyone instead of specific users
        - Skipping user research and validation
        
        MVP success criteria:
        - Solves a real problem for real users
        - Demonstrates core value proposition
        - Generates meaningful user feedback
        - Validates or invalidates key assumptions
        - Provides data for future development decisions
      `,
      source: "Product Management Best Practices",
    },
    {
      id: "agile-methodology",
      title: "Agile Product Development",
      category: "methodology",
      content: `
        Agile is an iterative approach to product development that emphasizes flexibility, collaboration, and customer feedback.
        
        Core Agile principles:
        1. Individuals and interactions over processes and tools
        2. Working software over comprehensive documentation
        3. Customer collaboration over contract negotiation
        4. Responding to change over following a plan
        
        Agile frameworks:
        - Scrum: Sprint-based development with defined roles and ceremonies
        - Kanban: Visual workflow management with continuous delivery
        - Lean: Focus on eliminating waste and maximizing value
        
        Key benefits:
        - Faster time to market
        - Better ability to respond to change
        - Improved product quality through iterative testing
        - Enhanced team collaboration and communication
        - Better customer satisfaction through regular feedback
        
        Best practices:
        - Keep sprints short (1-4 weeks)
        - Maintain close collaboration with stakeholders
        - Regular retrospectives to improve processes
        - Continuous integration and deployment
        - User story-driven development
      `,
      source: "Product Management Best Practices",
    },
  ]

  // Process each knowledge item
  for (const item of knowledgeItems) {
    try {
      console.log(`📄 Processing: ${item.title}`)

      // Generate embedding for the content
      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: item.content,
      })

      // Create metadata
      const metadata = {
        title: item.title,
        category: item.category,
        source: item.source,
        content: item.content,
        ingested_at: new Date().toISOString(),
      }

      // Upsert to Pinecone
      await pineconeStore.upsert({
        indexName,
        vectors: [embedding],
        metadata: [metadata],
        ids: [item.id],
      })

      console.log(`✅ Ingested: ${item.title}`)
    } catch (error) {
      console.error(`❌ Failed to ingest ${item.title}:`, error)
    }
  }

  console.log("📚 Knowledge base population complete!")
}

// Run this script to populate your knowledge base
// if (require.main === module) {
//   populateKnowledgeBase().catch(console.error);
// }

populateKnowledgeBase().catch(console.error)
