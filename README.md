# 🚀 Product Maestro - AI-Powered Product Management Platform

> Transform raw product ideas into comprehensive development artifacts through conversational AI

Product Maestro is an innovative no-code IDE designed specifically for product managers. It leverages advanced AI agents to automate the entire product development planning process - from initial brainstorming to detailed PRDs, sprint plans, and visual designs.

## ✨ Key Features

- **💬 Conversational AI Interface** - Natural language interaction with specialized AI agents
- **📋 Automated PRD Generation** - Create comprehensive Product Requirements Documents instantly
- **📝 Smart User Story Creation** - Generate well-structured user stories with acceptance criteria
- **🎯 Sprint Planning Automation** - Intelligent task breakdown and timeline estimation
- **🎨 Visual Design Integration** - Create user journey maps and workflow diagrams with Miro
- **🔄 Iterative Refinement** - Human-in-the-loop feedback system for continuous improvement
- **📊 Real-time Collaboration** - Seamless integration with Notion, Linear, and Miro

## 🏗️ Monorepo Architecture

```
product-maestro/
├── 🤖 backend/              # Mastra AI Agent System
│   ├── src/mastra/agents/   # Specialized AI agents
│   ├── src/mastra/tools/    # External integrations
│   ├── src/mastra/workflows/ # Multi-step processes
│   └── src/types/           # Shared TypeScript schemas
├── 🎨 frontend/             # Next.js Application
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   └── lib/                 # Utilities and agent integration
├── 📦 package.json          # Monorepo workspace configuration
└── 🔧 pnpm-workspace.yaml   # PNPM workspace settings
```

## ⚡ Quick Start

### Prerequisites
- **Node.js** >= 20.9.0
- **PNPM** >= 8.0.0
- **API Keys** for AI services (Google, OpenAI, etc.)

### 1. Installation
```bash
# Clone and install dependencies
git clone <repository-url>
cd product-maestro
pnpm install
```

### 2. Environment Setup
```bash
# Backend configuration
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Frontend configuration (optional)
cp frontend/.env.local.example frontend/.env.local
```

### 3. Development
```bash
# Start both backend and frontend
pnpm run dev

# Access the applications:
# 🎨 Frontend: http://localhost:3000
# 🤖 Backend API: http://localhost:3001
```

## 🎛️ Available Commands

### 🚀 Development
```bash
pnpm run dev              # Start both frontend and backend
pnpm run backend:dev      # Start Mastra AI backend only
pnpm run frontend:dev     # Start Next.js frontend only
```

### 🏗️ Build & Production
```bash
pnpm run build           # Build both projects
pnpm run start           # Start production servers
pnpm run backend:build   # Build backend only
pnpm run frontend:build  # Build frontend only
```

### 🧪 Testing & Validation
```bash
# Backend AI Agent Testing
pnpm run backend:test:idea        # ✅ Idea generation agent
pnpm run backend:test:rag         # ✅ Knowledge retrieval system
pnpm run backend:test:prd         # ✅ PRD generation & Notion integration
pnpm run backend:test:sprint      # ✅ Sprint planning & Linear integration
pnpm run backend:test:visual      # ✅ Visual design & Miro integration
pnpm run backend:test:feedback    # ✅ Feedback routing (83% success)
pnpm run backend:test:conversational # ⚠️ End-to-end workflow (has issues)

# Simple system validation
npx tsx backend/src/test/simpleEndToEndTest.ts
```

### 🔍 Code Quality
```bash
pnpm run type-check      # TypeScript validation
pnpm run lint            # ESLint checking
pnpm run backend:type-check
pnpm run frontend:lint
```

### 🧹 Maintenance
```bash
pnpm run clean           # Clean all build artifacts
pnpm run backend:clean   # Clean backend .mastra directory
pnpm run frontend:clean  # Clean frontend .next directory
```

## 🤖 AI Agent System

### Specialized Agents
- **🧠 The Brainstormer** (`ideaGenerationAgent`) - Refines raw product concepts
- **📝 The Story Weaver** (`userStoryGeneratorAgent`) - Creates structured user stories
- **📋 The PRD Compiler** (`prdAgent`) - Generates comprehensive requirements documents
- **🎯 The Sprint Architect** (`sprintPlannerAgent`) - Plans development sprints with Linear
- **🎨 The Visual Strategist** (`visualDesignAgent`) - Creates user journeys with Miro
- **🔄 The Workflow Navigator** (`feedbackRouterAgent`) - Routes feedback intelligently

### Technology Stack

#### 🤖 Backend (`/backend`)
- **Framework:** Mastra.ai for AI agent orchestration
- **Language:** TypeScript with strict type checking
- **AI Models:** Google Gemini 2.0 Flash, OpenAI embeddings
- **Database:** LibSQL for conversation memory & persistence
- **Vector Store:** Pinecone for knowledge retrieval (RAG)
- **Integrations:** Notion, Linear, Miro APIs

#### 🎨 Frontend (`/frontend`)
- **Framework:** Next.js 15 with App Router
- **UI Library:** React 19 + Tailwind CSS + shadcn/ui
- **Language:** TypeScript with shared schemas
- **State Management:** React Context + custom hooks
- **Styling:** Responsive design with dark/light theme support

## 🔧 Environment Configuration

### Required API Keys
```bash
# AI Services
GOOGLE_API_KEY=your_google_gemini_key
OPENAI_API_KEY=your_openai_key (for embeddings)

# Vector Database
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=product-maestro-knowledge

# External Integrations (Optional)
NOTION_API_KEY=your_notion_key
NOTION_PRD_DATABASE_ID=your_notion_database_id
LINEAR_API_KEY=your_linear_key
LINEAR_TEAM_ID=your_linear_team_id
MIRO_API_KEY=your_miro_key

# Database
DATABASE_URL=file:./product-maestro.db
```

## 📚 Documentation & Resources

### 📖 Developer Guides
- **[🏠 Monorepo Guide](./CLAUDE.md)** - Complete development context
- **[🤖 Backend Documentation](./backend/CLAUDE.md)** - AI agent architecture
- **[🎨 Frontend Documentation](./frontend/CLAUDE.md)** - UI component guide

### 🔗 Live Examples
- **[📋 Sample PRD](https://notion.so/22e706f0b83a815fa4cdc0daa4d69e75)** - Auto-generated in Notion
- **[🎨 Miro Board](https://miro.com/app/board/uXjVJeytRqY=)** - Visual design example

## 🧪 Current Status & Testing

### ✅ Production Ready
| Component | Status | Success Rate | Notes |
|-----------|--------|-------------|-------|
| 🧠 Idea Generation | ✅ Working | 100% | Fully functional |
| 📝 User Stories | ✅ Working | 100% | Complete implementation |
| 📋 PRD Generation | ✅ Working | 100% | Notion integration working |
| 🎯 Sprint Planning | ✅ Working | 100% | Linear integration working |
| 🎨 Visual Design | ✅ Working | 100% | Miro integration working |
| 🔄 Feedback Router | ✅ Working | 83% | Minor routing edge cases |
| 📊 RAG Knowledge | ✅ Working | 100% | Pinecone vector search |

### ⚠️ Known Issues
- **Workflow Chaining:** End-to-end workflows have data flow issues between steps
- **Recommendation:** Use individual agents directly for best results
- **Workaround:** Frontend should integrate with agents individually

## 🚀 Getting Started Guide

### For Product Managers
1. **Install & Setup:** Follow the Quick Start guide above
2. **Configure APIs:** Add your API keys to backend/.env
3. **Start Developing:** Run `pnpm run dev` and access http://localhost:3000
4. **Test Agents:** Use the working test commands to validate functionality

### For Developers
1. **Study Documentation:** Read CLAUDE.md files for comprehensive context
2. **Understand Architecture:** Individual agents work perfectly
3. **Frontend Integration:** Connect to agents via API routes
4. **Avoid Workflows:** Use individual agents until chaining is fixed

## 💡 Key Benefits

### For Product Teams
- **⚡ 10x Faster:** Reduce planning time from days to minutes
- **📊 Consistent Quality:** AI-generated artifacts follow best practices
- **🔄 Iterative:** Easy refinement through conversational feedback
- **📈 Scalable:** Handle multiple product initiatives simultaneously

### For Development
- **🏗️ Monorepo:** Unified codebase with shared types and utilities
- **🔧 TypeScript:** End-to-end type safety and developer experience
- **🧪 Testable:** Comprehensive testing for all components
- **📦 Modular:** Easy to extend with new agents and integrations

## 🛣️ Roadmap

### Phase 1: Core Platform (Current)
- ✅ AI agent system with external integrations
- ✅ Individual agent testing and validation
- 🔄 Frontend development and agent integration

### Phase 2: Enhanced Workflows
- 🔧 Fix workflow step chaining issues
- 🔧 Advanced conversation management
- 🔧 Multi-user collaboration features

### Phase 3: Enterprise Features
- 🔧 Docker containerization
- 🔧 Cloud deployment guides
- 🔧 Enterprise authentication
- 🔧 Advanced analytics and reporting

---

**Ready to transform your product development process?** Start with `pnpm run dev` and experience the future of AI-powered product management! 🚀