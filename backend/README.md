# 🤖 Product Maestro Backend

## AI-Powered Agent System for Product Management

**Mastra.ai backend powering the conversational product development platform**

---

## 📋 Overview

The Product Maestro backend is a sophisticated AI agent system built with Mastra.ai that transforms raw product ideas into comprehensive development artifacts. It features specialized AI agents, intelligent workflows, and seamless integrations with popular product management tools.

### 🎯 Core Mission

Transform the product management workflow from fragmented, manual processes to an integrated, AI-powered experience that reduces planning time from days to minutes while maintaining high quality and consistency.

---

## 🤖 AI Agent System

### Specialized Agents

| Agent | Persona | Function | Integration |
|-------|---------|----------|-------------|
| 🧠 **ideaGenerationAgent** | The Brainstormer | Refines raw product concepts into structured ideas | Memory + RAG |
| 📝 **userStoryGeneratorAgent** | The Story Weaver | Creates user stories with acceptance criteria | Memory + RAG |
| 📋 **prdAgent** | The PRD Compiler | Generates comprehensive PRDs | Notion API |
| 🎯 **sprintPlannerAgent** | The Sprint Architect | Creates development sprints | Linear API |
| 🎨 **visualDesignAgent** | The Visual Strategist | Creates user journey maps | Miro API |
| 🔄 **feedbackRouterAgent** | The Workflow Navigator | Routes feedback intelligently | Session Management |

### Core Capabilities

#### 💬 **Conversational AI Processing**
- **Natural Language Understanding** - Process complex product requirements
- **Context Awareness** - Maintain conversation state across interactions  
- **Intelligent Questioning** - Ask clarifying questions to refine requirements
- **Memory Persistence** - Remember previous interactions and decisions

#### 📊 **Automated Artifact Generation**
- **PRD Creation** - 100+ structured content blocks with industry standards
- **User Story Generation** - Complete with personas, acceptance criteria, and priorities
- **Sprint Planning** - Task breakdown, effort estimation, and timeline planning
- **Visual Design** - User journey maps, process flows, and system diagrams

#### 🔗 **External Tool Integration**
- **Notion API** - Automated PRD publishing with proper formatting
- **Linear API** - Sprint cycle and issue creation with team management
- **Miro API** - Interactive board creation with professional design elements
- **Pinecone Vector DB** - Knowledge retrieval for best practices and patterns

#### 🔄 **Workflow Orchestration**
- **Multi-Step Processes** - Chain agents together for complex workflows
- **Human-in-the-Loop** - Suspend/resume for user feedback and approval
- **Error Handling** - Graceful fallbacks and recovery mechanisms
- **Session Management** - Track conversation state and progress

---

## 🏗️ Technical Architecture

### **Mastra.ai Framework**
```typescript
// Core framework structure
src/mastra/
├── agents/           # Specialized AI agents
├── tools/           # External integration functions  
├── workflows/       # Multi-step processes
├── rag/            # Knowledge retrieval system
├── setup/          # Database and vector store setup
└── index.ts        # Main Mastra configuration
```

### **Technology Stack**

#### **AI & ML**
- **Primary Model:** Google Gemini 2.0 Flash (advanced reasoning)
- **Embeddings:** OpenAI text-embedding-3-small (1536 dimensions)
- **Vector Store:** Pinecone (cosine similarity, knowledge retrieval)
- **Memory:** LibSQL database (conversation persistence)

#### **External Integrations**
- **Notion API v1** - PRD publishing with block-based content
- **Linear API v1** - Sprint management and issue creation  
- **Miro API v2** - Visual design and board creation
- **Pinecone API** - Vector storage and semantic search

#### **Data Management**
- **TypeScript** - Strict type safety with Zod schemas
- **LibSQL** - Local SQLite-compatible database
- **Zod Validation** - Runtime type checking and data validation
- **Error Handling** - Comprehensive error boundaries and logging

### **Project Structure**
```
backend/
├── src/
│   ├── mastra/
│   │   ├── agents/              # AI agent implementations
│   │   │   ├── ideaGenerationAgent.ts
│   │   │   ├── userStoryGeneratorAgent.ts  
│   │   │   ├── prdAgent.ts
│   │   │   ├── sprintPlannerAgent.ts
│   │   │   ├── visualDesignAgent.ts
│   │   │   └── feedbackRouterAgent.ts
│   │   ├── tools/               # Integration tools
│   │   │   ├── ideaGenerationTool.ts
│   │   │   ├── prdGeneratorTool.ts
│   │   │   ├── notionTool.ts
│   │   │   ├── sprintPlannerTool.ts
│   │   │   ├── visualDesignTool.ts
│   │   │   └── feedbackRouterTool.ts
│   │   ├── workflows/           # Multi-step processes
│   │   │   ├── productDevelopmentWorkflow.ts
│   │   │   ├── conversationalProductWorkflow.ts
│   │   │   └── steps/
│   │   ├── rag/                 # Knowledge system
│   │   │   └── pineconeStore.ts
│   │   └── vectors/             # Vector setup
│   │       └── pineconeSetup.ts
│   ├── types/                   # TypeScript schemas
│   │   └── productMaestro.ts
│   ├── test/                    # Testing suite
│   └── scripts/                 # Utility scripts
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration  
└── CLAUDE.md                   # Development documentation
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 20.9.0  
- **pnpm** >= 8.0.0 (recommended) or npm
- **API Keys** for external services

### Installation & Setup
```bash
# Navigate to backend directory (from monorepo root)
cd backend

# Install dependencies  
pnpm install

# Environment configuration
cp .env.example .env
# Edit .env with your API keys (see Configuration section)

# Initialize Mastra and build
pnpm run build
pnpm run dev
```

### Development Commands
```bash
# Development
pnpm run dev              # Start Mastra development server
pnpm run build            # Build the project
pnpm run start            # Start production server

# Code Quality  
pnpm run type-check       # TypeScript validation
pnpm run lint             # Code linting
pnpm run clean            # Clean build artifacts

# Testing Individual Agents (✅ Recommended)
pnpm run test:idea        # Test idea generation (100% working)
pnpm run test:rag         # Test knowledge retrieval (100% working)  
pnpm run test:prd         # Test PRD generation (100% working)
pnpm run test:sprint      # Test sprint planning (100% working)
pnpm run test:visual      # Test visual design (100% working)
pnpm run test:feedback    # Test feedback routing (83% working)

# End-to-End Testing (⚠️ Has workflow issues)
pnpm run test:conversational  # Full workflow test
npx tsx src/test/testEndToEnd.ts  # Complete pipeline test
```

---

## 🔧 Configuration

### Required Environment Variables
```bash
# .env file in backend directory

# AI Models (Required)
GOOGLE_API_KEY=your_google_gemini_key
OPENAI_API_KEY=your_openai_key

# Vector Database (Required for RAG)
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=product-maestro-knowledge

# Database (Optional - defaults to local SQLite)
DATABASE_URL=file:./product-maestro.db

# External Integrations (Optional)
NOTION_API_KEY=your_notion_key
NOTION_PRD_DATABASE_ID=your_notion_database_id
LINEAR_API_KEY=your_linear_key
LINEAR_TEAM_ID=your_linear_team_id
MIRO_API_KEY=your_miro_key
```

### API Key Setup Guide
1. **Google AI Studio** - Get Gemini API key from [aistudio.google.com](https://aistudio.google.com)
2. **OpenAI** - Get API key from [platform.openai.com](https://platform.openai.com)
3. **Pinecone** - Create account and index at [pinecone.io](https://pinecone.io)
4. **Notion** - Create integration at [notion.so/my-integrations](https://notion.so/my-integrations)
5. **Linear** - Generate API key in Linear settings
6. **Miro** - Create app and get token at [miro.com/app/settings](https://miro.com/app/settings)

---

## 🧪 Testing & Validation

### ✅ **Production Ready Components**
| Component | Status | Success Rate | Integration |
|-----------|--------|--------------|-------------|
| 🧠 Idea Generation | ✅ Working | 100% | Memory + RAG |
| 📝 User Stories | ✅ Working | 100% | Memory + RAG |
| 📋 PRD Generation | ✅ Working | 100% | Notion API |
| 🎯 Sprint Planning | ✅ Working | 100% | Linear API |
| 🎨 Visual Design | ✅ Working | 100% | Miro API |
| 🔄 Feedback Router | ✅ Working | 83% | Session Management |
| 📊 RAG Knowledge | ✅ Working | 100% | Pinecone Vector DB |

### ⚠️ **Known Issues**
- **Workflow Chaining:** End-to-end workflows have data flow issues between steps
- **Schema Validation:** Some tools expect different input structures than workflows provide
- **Recommendation:** Use individual agents directly for frontend integration

### 🧪 **Test Examples**
```bash
# Individual agent testing (recommended)
pnpm run test:idea        # Test brainstorming agent
pnpm run test:prd         # Test PRD generation + Notion
pnpm run test:visual      # Test Miro visual design

# System validation  
npx tsx src/test/simpleEndToEndTest.ts  # 83% success rate
```

---

## 🔗 Integration Examples

### **Agent Usage Pattern**
```typescript
// Import agents from Mastra configuration
import { ideaGenerationAgent, prdAgent } from './src/mastra';

// Direct agent calls (recommended for frontend)
const ideaResult = await ideaGenerationAgent.generate({
  input: "Build a fitness app for busy professionals",
  context: { userId: "user123" }
});

const prdResult = await prdAgent.generate({
  input: ideaResult.data,
  context: { format: "notion", userId: "user123" }
});
```

### **Tool Integration Pattern**
```typescript
// Import tools for specific functionality
import { notionTool, visualDesignTool } from './src/mastra/tools';

// Create PRD in Notion
await notionTool.execute({
  action: "createPage",
  databaseId: process.env.NOTION_PRD_DATABASE_ID,
  content: prdData
});

// Generate Miro board
await visualDesignTool.execute({
  boardType: "userJourney",
  productData: ideaResult
});
```

### **Session Management**
```typescript
// Use feedback router for conversation state
import { feedbackRouterAgent } from './src/mastra';

const routingResult = await feedbackRouterAgent.generate({
  input: userFeedback,
  sessionId: "session_123",
  previousContext: conversationHistory
});

// Route to appropriate agent based on feedback analysis
const targetAgent = routingResult.data.recommendedAgent;
```

---

## 📚 **Live Examples**

### **Generated Artifacts**
- **[📋 Sample PRD](https://notion.so/22e706f0b83a815fa4cdc0daa4d69e75)** - Auto-generated in Notion
- **[🎨 Miro Board](https://miro.com/app/board/uXjVJeytRqY=)** - Visual design example
- **[🎯 Linear Sprint](example-link)** - Sprint planning integration

### **Development Resources**
- **[📖 CLAUDE.md](./CLAUDE.md)** - Comprehensive development guide
- **[🔧 Mastra Docs](https://mastra.ai/docs)** - Framework documentation
- **[🧪 Test Suite](./src/test/)** - Complete testing examples

---

## 🚀 **Frontend Integration Guide**

### **Recommended Architecture**
1. **API Layer:** Create Next.js API routes that call individual agents
2. **State Management:** Use React context for conversation state
3. **Error Handling:** Implement proper error boundaries for agent failures
4. **Session Management:** Use feedback router for conversation orchestration

### **Example API Route** (`pages/api/agents/idea.ts`)
```typescript
import { ideaGenerationAgent } from '../../../backend/src/mastra';

export default async function handler(req, res) {
  try {
    const result = await ideaGenerationAgent.generate(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### **Deployment Considerations**
- **Environment Variables:** Ensure all API keys are configured
- **Database:** LibSQL works in serverless environments
- **Memory Management:** Implement proper cleanup for long conversations
- **Rate Limiting:** Add rate limiting for AI API calls

---

**🔧 Ready to integrate?** Check the [CLAUDE.md](./CLAUDE.md) file for complete development context and examples.