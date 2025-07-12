# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Product Maestro is an AI-powered no-code IDE for product managers, built as a hackathon project. It helps transform raw product ideas into structured development artifacts through AI agents and workflows.

## Development Commands

### Core Commands

- `npm run dev` - Start Mastra development server
- `npm run build` - Build the project using Mastra
- `npm run start` - Start the production server
- `npm run type-check` - Run TypeScript type checking

### Testing Commands

- `npm run test:idea` - Test idea generation functionality
- `npm run test:rag` - Test RAG (Retrieval Augmented Generation) setup
- `npm run test:prd` - Test PRD generation and Notion integration functionality
- `npx tsx src/test/testEndToEnd.ts` - End-to-end PRD generation pipeline test
- Individual component testing available via exported test functions in respective files

### Troubleshooting

#### Mastra Dev Server Issues
If you encounter `EBUSY: resource busy or locked` errors when running `npm run dev`:

1. **Clean build artifacts**: `rm -rf .mastra`
2. **Run build first**: `npm run build` 
3. **Then start dev server**: `npm run dev`

This ensures the Mastra build system is properly initialized before starting the development server.

### Environment Requirements

- Node.js >= 20.9.0
- Required environment variables:
  - `PINECONE_API_KEY` - Pinecone vector database API key
  - `PINECONE_INDEX_NAME` - Pinecone index name (defaults to "product-maestro-knowledge")
  - `DATABASE_URL` - LibSQL database URL (defaults to "file:./product-maestro.db")
  - `NOTION_API_KEY` - Notion integration API key for PRD publishing
  - `NOTION_PRD_DATABASE_ID` - Notion database ID where PRDs will be created
  - AI provider API keys (OpenAI, Google, Anthropic)

## Architecture Overview

### Mastra Framework Integration

The project is built on the Mastra framework for AI agent orchestration:

- **Agents**: Specialized AI agents for different product management tasks
- **Workflows**: Multi-step processes that chain agents together
- **Tools**: Reusable functions that agents can invoke
- **Memory**: Persistent storage using LibSQL for conversation context
- **RAG**: Pinecone vector store for knowledge retrieval

### Core Components

#### Agents (`src/mastra/agents/`)

- `ideaGenerationAgent.ts` - "The Brainstormer" for refining product ideas
- `userStoryGeneratorAgent.ts` - "The Story Weaver" for creating user stories
- `prdAgent.ts` - "The PRD Compiler" for generating comprehensive Product Requirements Documents
- All agents use Google Gemini 2.0 Flash model and share memory storage

#### Workflows (`src/mastra/workflows/`)

- `productDevelopmentWorkflow.ts` - Complete pipeline from idea to development artifacts
- Chains idea generation → user story generation → PRD generation → recommendations
- Automatically publishes PRDs to Notion with proper formatting
- Returns structured output with session tracking and next steps

#### Type System (`src/types/productMaestro.ts`)

Comprehensive Zod schemas for:

- `ProductIdea` - Core product concept structure
- `UserPersona` - User research and segmentation
- `UserStory` - Agile user stories with acceptance criteria
- `WireframePage` & `DesignSystem` - UI/UX artifacts
- `Sprint` - Development sprint planning
- `PRD` - Product Requirements Document
- `ProductMaestroContext` - Workflow state management

#### Tools (`src/mastra/tools/`)

- `ideaGenerationTool.ts` - Structured product idea generation
- `userStoryGeneratorTool.ts` - User story creation with priorities
- `prdGeneratorTool.ts` - Comprehensive PRD content generation in Notion-compatible format
- `notionTool.ts` - General-purpose Notion API integration for creating pages and appending blocks
- `ragKnowledgeTool.ts` - Knowledge base search and retrieval
- `vectorQueryTool.ts` - Pinecone vector operations

#### RAG System (`src/mastra/rag/` & `src/mastra/vectors/`)

- Pinecone vector store for product management knowledge
- `pineconeSetup.ts` - Index initialization and configuration
- Uses OpenAI text-embedding-3-small (1536 dimensions) with cosine similarity

### Data Flow

1. User provides raw product idea
2. Idea Generation Agent refines and structures the concept
3. User Story Generator Agent creates development artifacts
4. PRD Compiler Agent generates comprehensive Product Requirements Document
5. PRD is automatically published to Notion with proper formatting
6. Workflow orchestrates the process and provides recommendations
7. Results stored in LibSQL database with session tracking

### Agent Communication Patterns

- Agents use structured instructions with role-based personas
- Tools provide reusable functionality across agents
- Memory enables context persistence across interactions
- RAG system provides access to product management best practices

## Development Notes

### Testing Strategy

- Individual agent testing via exported test functions
- Workflow testing through `testProductDevelopmentWorkflow()`
- RAG system testing via `npm run test:rag`

### Database

- Uses LibSQL for local development (`product-maestro.db`)
- Memory storage handles agent conversation context
- Vector data stored in Pinecone cloud service

### AI Models

- Primary: Google Gemini 2.0 Flash for agent reasoning
- Embeddings: OpenAI text-embedding-3-small for RAG
- Support for OpenAI and Anthropic models configured but not actively used

### Key Architectural Decisions

- Mastra framework chosen for agent orchestration and workflow management
- Zod schemas provide runtime type safety and structured data validation
- Separation of agents, tools, and workflows enables modularity and reusability
- RAG integration allows agents to access external product management knowledge

## Project Overview - Product Maestro: The Conversational, No-Code IDE for Product Managers

### 1. Problem Statement

Product managers and leaders often face significant friction in translating nascent ideas into actionable development plans. The current process is fragmented, involving:

- Disjointed brainstorming sessions.
- Manual creation of user stories.
- Tedious generation of wireframes and mockups, often requiring design tools or external teams.
- Laborious drafting of Product Requirements Documents (PRDs).
- Manual sprint planning based on features.

This fragmentation leads to:

- **Slow Time-to-Market:** Delays in getting ideas from concept to actionable development.
- **Communication Gaps:** Misalignment between product vision, design, and engineering.
- **Reduced Iteration Speed:** Difficulty in quickly visualizing and refining ideas.
- **High Overhead:** Excessive time spent on documentation and manual processes.

Existing solutions like "Lovable, v0" and "bolt.new" offer glimpses but often lack a comprehensive, integrated, and truly conversational experience for the entire product definition lifecycle, particularly from a PM's perspective.

### 2. Solution Overview

Product Maestro is an AI-powered, no-code/low-code development environment designed specifically for product managers. It provides a seamless, conversational UI that guides PMs from a raw app idea to a comprehensive product plan, including user stories, visual wireframes, a detailed PRD, and a preliminary sprint plan.

Leveraging Mastra.ai's multi-agent framework and intelligent workflows, Product Maestro automates and integrates key stages of product ideation and planning, enabling rapid iteration and clear communication without requiring any coding knowledge from the user.

### 3. Key Features

Product Maestro will empower product managers with the following capabilities:

- **Conversational Idea Brainstorming:** Users explain app ideas in plain English via a chat interface. An AI agent (Idea Generation Agent) engages in a dialogue to ask clarifying questions, refine the concept, suggest features, and identify the core problem/solution.
- **Automated User Story Generation:** Based on the refined app idea and features, an AI agent (User Story Generator Agent) automatically generates well-structured user stories (As a [persona], I want to [action] so that [benefit]). Ability for users to review, edit, and accept generated stories.
- **Dynamic Wireframe & Mockup Generation:** An AI agent (Visual Design Agent) interprets the app idea and user stories to propose visual designs. These designs are dynamically rendered in the UI using Shadcn/UI components, providing instant visual feedback as no-code wireframes/mockups. Users can provide feedback on designs via conversation (e.g., "Change the button to green," "Add a new section for comments"), and the AI will update the visuals accordingly.
- **Comprehensive PRD Generation:** On-demand, an AI agent (PRD Agent) compiles all gathered information (idea, features, user stories, design notes, target audience) into a structured Product Requirements Document. The PRD follows industry-standard formats, ready for sharing with engineering and design teams.
- **Preliminary Sprint Planning:** An AI agent (Sprint Planner Agent) takes the defined features and user stories to propose a realistic, high-level sprint breakdown. This provides a preliminary roadmap for development, assisting in project kickoff.
- **Intuitive User Interface (Next.js):** A single, cohesive web interface where all interactions (chat, visual design, document viewing) occur seamlessly. Real-time updates as AI agents process information.

---

## Architecture & Technology Stack

### Backend & AI Core: Mastra.ai (TypeScript)

- **Mastra.ai Agents:**
  - `Idea Generation Agent`: Focuses on concept refinement and feature identification.
  - `User Story Generator Agent`: Specializes in crafting structured user stories.
  - `Visual Design Agent`: Translates textual descriptions into visual UI component specifications.
  - `PRD Agent`: Structures and populates comprehensive product requirement documents.
  - `Sprint Planner Agent`: Decomposes features into actionable sprint tasks.
  - `Router/Feedback Analysis Agent (Internal)`: Directs user feedback to the appropriate agent for iterative refinement.
- **Mastra.ai Workflows (The central orchestration layer):**
  - Manages the sequence of agent interactions (e.g., Idea -> User Story -> Design -> PRD -> Sprint Plan).
  - Implements conditional branching (e.g., "if user provides design feedback, re-run Visual Design Agent").
  - Handles "human-in-the-loop" scenarios using `suspend()` and `resume()` to wait for user input.
  - Ensures data integrity and type safety between steps using Zod.
- **Mastra.ai Tools:**
  - `ShadcnUIGeneratorTool`: A custom tool to output structured data representing Shadcn/UI components, which the frontend can render.
  - `RAG Query Tool`: For querying internal knowledge bases.
- **Retrieval-Augmented Generation (RAG):**
  - **Vector Database** (e.g., Pinecone): Stores internal knowledge base for agents, including:
    - UI/UX best practices and design patterns.
    - Shadcn/UI component documentation (structured for AI understanding).
    - Common user personas and user story templates.
    - Standard PRD formats and sprint planning methodologies.
  - **Embedding Model:** To convert text into vector embeddings for RAG queries (OpenAI text-embedding-3-small).

## User Experience & Design Philosophy

- **Conversational Simplicity:** The primary mode of interaction is natural language, making it accessible to non-technical users.
- **Single Pane of Glass:** All aspects of product ideation and planning are consolidated into one intuitive UI, eliminating context switching.
- **Visual Feedback:** Instant rendering of wireframes provides tangible progress and facilitates quicker design decisions.
- **Iterative Refinement:** The system is designed to embrace feedback, allowing product managers to easily tweak and refine their ideas until satisfied.
- **Minimalist & Focused:** UI will be clean and uncluttered, focusing on the core task of product definition.

---

## Innovation & Differentiation

- **Truly Conversational & Multi-Agent:** Goes beyond simple chat bots by orchestrating multiple specialized AI agents through sophisticated workflows to handle complex, multi-stage tasks.
- **Integrated Visual Design (No-Code):** Directly generates and displays interactive wireframes using a popular component library (Shadcn/UI), eliminating the need for separate design tools or manual mockups.
- **End-to-End Product Planning:** Covers the entire spectrum from raw idea to sprint plan, providing a holistic solution.
- **Human-in-the-Loop Design:** Workflows are explicitly designed to pause and solicit user feedback, making the AI a collaborative assistant rather than a black box.
- **TypeScript-Native AI (Mastra.ai):** Leverages a modern, type-safe framework, appealing to a broader developer base and enabling robust, production-ready AI applications.

---

## Business Viability

Product Maestro addresses a significant pain point for product-led organizations. Its value proposition includes:

- **Accelerated Product Development:** Significantly reduces the time and effort required to move from concept to a defined product plan.
- **Improved Collaboration:** Provides a shared, living document (the PRD) and visual artifacts that foster better understanding between PMs, designers, and engineers.
- **Empowerment for PMs:** Allows product managers to have greater ownership and direct influence over early-stage product design.
- **Cost Savings:** Reduces reliance on external design resources for initial mockups and streamlines documentation efforts.
- **Scalability:** The modular agent-based architecture built with Mastra.ai allows for easy expansion with new agents, tools, and integrations as needs evolve.

---

## Stretch Goals (if time permits)

- **Voice Mode:** Enable users to speak their ideas and feedback instead of typing.
- **Version Control for Ideas/PRDs:** Basic versioning to track changes in product definitions.
- **Export Options:** Export PRD to Markdown, PDF, or integration with project management tools (e.g., Jira, Asana) for sprint plans.
- **User Testing Insights:** AI suggests potential user testing scenarios based on the defined features.
- **Competitive Analysis Integration:** AI can briefly research competitive products based on the idea.

## Current Implementation Status

### ✅ Completed Components

#### 1. **PRD Agent System** *(FULLY IMPLEMENTED)*
- **PRD Generator Tool** (`prdGeneratorTool.ts`):
  - Generates comprehensive PRDs using Google Gemini 2.0 Flash
  - Creates 100+ content blocks with structured sections
  - Handles Notion's 100-block API limit automatically
  - Converts structured PRD data to Notion-compatible blocks
  - Includes: Executive Summary, Problem Statement, Features, User Personas, Goals & Metrics, Technical Overview, etc.

- **Notion Integration Tool** (`notionTool.ts`):
  - General-purpose Notion API integration
  - Supports page creation and block appending operations
  - Comprehensive error handling for common API issues
  - Helper functions for creating different Notion block types
  - Automatic block batching for large content

- **PRD Compiler Agent** (`prdAgent.ts`):
  - "The PRD Compiler" - Expert persona for PRD generation
  - Orchestrates PRD creation and Notion publishing
  - Integrates with RAG system for knowledge retrieval
  - Uses multiple tools for comprehensive document generation

- **PRD Generation Workflow Step** (`prdGenerationStep.ts`):
  - Integrated into main product development workflow
  - Handles environment validation and error reporting
  - Provides detailed recommendations and next steps
  - Seamless chaining with other workflow components

#### 2. **Core Foundation**
- ✅ Mastra framework integration with multi-agent orchestration
- ✅ Google Gemini 2.0 Flash model integration
- ✅ Comprehensive Zod schemas for type safety
- ✅ LibSQL database for conversation memory
- ✅ Pinecone RAG system for knowledge retrieval
- ✅ Idea Generation Agent ("The Brainstormer")
- ✅ User Story Generator Agent ("The Story Weaver")

#### 3. **End-to-End Pipeline** *(WORKING)*
- Complete workflow: Idea → User Stories → PRD → Notion Publication
- Automated content generation with proper formatting
- Real-time testing and validation system
- Live Notion document creation: [Example PRD](https://notion.so/22e706f0b83a815fa4cdc0daa4d69e75)

### 🧪 Testing Infrastructure

- `npm run test:prd` - Complete PRD system testing
- `npx tsx src/test/testEndToEnd.ts` - End-to-end PRD generation
- `npx tsx src/test/testNotionOnly.ts` - Notion integration testing
- Individual component testing via exported test functions

### 📋 Task Progress

#### ✅ **Completed**
1. ~~PRD Agent (tool + workflow)~~ **DONE** ✅
   - PRD Generator Tool with 109-block content generation
   - Notion Tool with API integration and error handling
   - PRD Compiler Agent with expert persona
   - Workflow step integration with batched content publishing
   - End-to-end testing pipeline

2. ~~Idea generation Agent & workflows~~ **DONE** ✅
3. ~~User story Agent & workflows~~ **DONE** ✅
4. ~~RAG: Pinecone DB setup~~ **DONE** ✅
5. ~~Testing existing agents script~~ **DONE** ✅

#### 🚧 **Next Priorities**
1. **Visual Design Agent (tool + workflow)**
   - Shadcn/UI component generation
   - Wireframe creation from PRD content
   - Dynamic visual feedback system

2. **Sprint Planner Agent (tool + workflow)**
   - Feature decomposition into sprint tasks
   - Timeline estimation and priority assignment
   - Integration with existing PRD data

3. **Router/Feedback Analysis Agent (Internal)**
   - User feedback processing and routing
   - Iterative refinement coordination
   - Multi-agent communication optimization

4. **Frontend Development**
   - Next.js conversational UI
   - Real-time agent interaction display
   - PRD preview and editing interface

5. **Deployment & Demo**
   - Production deployment setup
   - Demo video creation
   - Presentation materials
