# CLAUDE.md - Product Maestro Monorepo

This file provides guidance to Claude Code when working with the Product Maestro monorepo - an AI-powered no-code IDE for product managers.

## Project Overview

Product Maestro is a comprehensive AI-powered platform that transforms raw product ideas into structured development artifacts through specialized AI agents and workflows. The project is organized as a pnpm monorepo with separate frontend and backend packages.

## Monorepo Structure

```
hackfest/
├── backend/           # Mastra-based AI agent system
├── frontend/          # Next.js 15 application
├── package.json       # Root package with workspace scripts
├── pnpm-workspace.yaml # Workspace configuration
└── CLAUDE.md          # This file
```

## Development Commands

### Monorepo Management

```bash
# Install all dependencies across workspaces
pnpm install

# Run both frontend and backend in development
pnpm run dev

# Build both packages
pnpm run build

# Run production servers
pnpm run start

# Type checking across workspaces
pnpm run type-check

# Linting across workspaces
pnpm run lint
```

### Individual Package Commands

```bash
# Backend commands
pnpm run backend:dev          # Start Mastra development server
pnpm run backend:build        # Build backend
pnpm run backend:start        # Start backend production server
pnpm run backend:type-check   # TypeScript checking
pnpm run backend:test         # Run backend tests

# Frontend commands
pnpm run frontend:dev         # Start Next.js development server
pnpm run frontend:build       # Build frontend
pnpm run frontend:start       # Start frontend production server
pnpm run frontend:type-check  # TypeScript checking
pnpm run frontend:lint        # ESLint checking

# Backend testing (individual agents)
pnpm run backend:test:idea    # Test idea generation
pnpm run backend:test:rag     # Test RAG system
pnpm run backend:test:prd     # Test PRD generation
pnpm run backend:test:sprint  # Test sprint planning
pnpm run backend:test:visual  # Test visual design
pnpm run backend:test:feedback # Test feedback routing
```

## Architecture Overview

### Backend (Mastra Framework)

**Location:** `backend/`
**Framework:** Mastra.ai with TypeScript
**Purpose:** AI agent orchestration and business logic

**Key Components:**
- **Agents:** Specialized AI agents for product management tasks
- **Workflows:** Multi-step processes chaining agents together
- **Tools:** Reusable functions for external integrations
- **RAG System:** Pinecone vector store for knowledge retrieval
- **Memory:** LibSQL database for conversation persistence

**Main Agents:**
- `ideaGenerationAgent.ts` - "The Brainstormer"
- `userStoryGeneratorAgent.ts` - "The Story Weaver" 
- `prdAgent.ts` - "The PRD Compiler"
- `sprintPlannerAgent.ts` - "The Sprint Architect"
- `visualDesignAgent.ts` - "The Visual Strategist"
- `feedbackRouterAgent.ts` - "The Workflow Navigator"

### Frontend (Next.js)

**Location:** `frontend/`
**Framework:** Next.js 15 with React 19
**Purpose:** User interface and API integration

**Key Technologies:**
- **UI Library:** Radix UI + shadcn/ui components
- **Styling:** Tailwind CSS with custom configuration
- **State Management:** React hooks and context
- **API Routes:** Next.js API routes for backend communication
- **Forms:** React Hook Form with Zod validation

**Main Components:**
- Chat interface for conversational AI interaction
- Results dashboard for viewing generated artifacts
- Theme system with dark/light mode support
- Comprehensive UI component library

## Integration Points

### API Communication

The frontend communicates with backend agents through Next.js API routes:

```
frontend/app/api/agents/
├── feedback/route.ts      # Feedback routing
├── idea-generation/route.ts # Idea generation
├── prd/route.ts          # PRD generation
├── sprint-planner/route.ts # Sprint planning
├── user-story/route.ts   # User story generation
└── visual-design/route.ts # Visual design
```

### Data Flow

1. **User Input:** Frontend captures user input via chat interface
2. **API Routing:** Next.js API routes forward requests to backend agents
3. **Agent Processing:** Mastra agents process requests using AI models
4. **External Integrations:** Agents integrate with Notion, Linear, Miro
5. **Response Handling:** Frontend displays results and enables iteration

## Environment Configuration

### Required Environment Variables

**Backend (.env in backend/):**
```bash
# AI Model APIs
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_key
ANTHROPIC_API_KEY=your_anthropic_key

# Vector Database
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=product-maestro-knowledge

# Database
DATABASE_URL=file:./product-maestro.db

# External Integrations
NOTION_API_KEY=your_notion_key
NOTION_PRD_DATABASE_ID=your_notion_db_id
LINEAR_API_KEY=your_linear_key
LINEAR_TEAM_ID=your_linear_team_id
MIRO_API_KEY=your_miro_key
```

**Frontend (.env.local in frontend/):**
```bash
# API endpoints (if different from default)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Development Guidelines

### Code Conventions

**Backend:**
- Use TypeScript with strict mode enabled
- Follow Mastra framework patterns for agents/tools/workflows
- Implement comprehensive Zod schemas for type safety
- Use structured error handling with detailed logging
- Write testable functions with clear interfaces

**Frontend:**
- Use TypeScript with React 19 and Next.js 15 patterns
- Follow shadcn/ui component patterns and naming
- Implement responsive design with Tailwind CSS
- Use React Hook Form for form management
- Implement proper error boundaries and loading states

### Testing Strategy

**Backend Testing:**
```bash
# Individual component testing (recommended)
pnpm run backend:test:idea     # ✅ Working
pnpm run backend:test:rag      # ✅ Working  
pnpm run backend:test:prd      # ✅ Working
pnpm run backend:test:sprint   # ✅ Working
pnpm run backend:test:visual   # ✅ Working
pnpm run backend:test:feedback # ✅ Working (83% success rate)

# End-to-end testing (has workflow chaining issues)
pnpm run backend:test:conversational # ⚠️ Workflow issues
```

**Frontend Testing:**
- Use Next.js built-in testing capabilities
- Implement component testing with React Testing Library
- Test API route integration with mock data
- Validate responsive design across devices

### Known Issues & Workarounds

**✅ RESOLVED: Backend Workflow Integration**
- Individual agents work perfectly ✅
- Frontend now fully integrated with live Mastra backend server ✅
- Sequential workflow implemented and tested ✅
- **Status:** All major workflow issues resolved as of latest update

**✅ Production-Ready Components:**
- All individual agents and tools are fully functional
- RAG system and external integrations working
- Frontend UI components are complete and tested
- Live backend integration with robust error handling
- Sequential and parallel agent execution workflows

## Deployment Notes

### Development Deployment

```bash
# Start both frontend and backend
pnpm run dev

# Backend runs on: http://localhost:3001
# Frontend runs on: http://localhost:3000
```

### Production Considerations

- **Backend:** Deploy as Node.js application with Mastra runtime
- **Frontend:** Deploy as static Next.js application or with SSR
- **Database:** Use LibSQL or SQLite for backend persistence
- **Vector Store:** Ensure Pinecone API access for RAG functionality
- **External APIs:** Verify all integration API keys and permissions

## Key Files for Development

### Backend Entry Points
- `backend/src/mastra/index.ts` - Main Mastra configuration
- `backend/src/mastra/agents/` - Individual AI agents
- `backend/src/mastra/tools/` - External integration tools
- `backend/src/types/productMaestro.ts` - Type definitions

### Frontend Entry Points  
- `frontend/app/page.tsx` - Main application page with live Mastra integration
- `frontend/app/api/` - API route handlers (proxy to backend server)
- `frontend/components/` - UI component library
- `frontend/lib/mastra-client.ts` - Live Mastra server client
- `frontend/hooks/use-mastra-agents.ts` - React Query hooks for agent interaction
- `frontend/app/test-mastra/page.tsx` - Comprehensive testing interface

## Quick Start for New Developers

1. **Setup Environment:**
   ```bash
   pnpm install
   # Configure environment variables in backend/.env
   ```

2. **Start Development:**
   ```bash
   pnpm run dev
   ```

3. **Test Backend Agents:**
   ```bash
   pnpm run backend:test:idea
   ```

4. **Access Applications:**
   - Frontend: http://localhost:3001 (auto-adjusts if 3000 is taken)
   - Backend Mastra Server: http://localhost:4111
   - Test Interface: http://localhost:3001/test-mastra

## Latest Integration Updates (January 2025)

### ✅ Complete Frontend-Backend Integration

**What was implemented:**
1. **Live Mastra Server Integration**: Frontend now directly communicates with the backend Mastra server running on localhost:4111
2. **Sequential Workflow System**: Users can run all agents sequentially with real data flow between steps
3. **Individual Agent Testing**: Each agent can be called independently through both main app and test interface
4. **Robust Error Handling**: Comprehensive error handling with fallback messages and retry logic
5. **Real-time Progress Tracking**: Live updates as each agent completes its task

**Key Files Updated:**
- `frontend/app/page.tsx` - Integrated with `useMastraAgents` hooks
- `frontend/hooks/use-mastra-agents.ts` - React Query integration for live backend
- `frontend/lib/mastra-client.ts` - Direct communication with Mastra server
- `frontend/app/api/agents/*` - Updated to proxy requests to backend server
- `frontend/components/chat-interface.tsx` - Added sequential workflow option

**Architecture Flow:**
```
User Input → Chat Interface → useMastraAgents Hook → Mastra Client → Backend Server (localhost:4111) → AI Agents → External Tools (Notion/Miro/Linear) → Response → Frontend Display
```

**Agent Status:**
- ✅ Idea Generation: Working with comprehensive analysis
- ✅ User Story Generation: Working with structured output
- ✅ PRD Generation: Working with Notion integration
- ✅ Sprint Planning: Working with development estimates
- ✅ Visual Design: Working with Miro board creation
- ✅ Feedback Routing: Working with intelligent routing

**Testing Commands:**
```bash
# Test individual agents (backend)
npm run backend:test:idea
npm run backend:test:prd
npm run backend:test:visual

# Test frontend integration
# Visit http://localhost:3001/test-mastra for comprehensive testing interface
```

### Development Workflow

1. **Start Backend Server:**
   ```bash
   cd backend && npm run dev
   # Server starts on localhost:4111
   ```

2. **Start Frontend:**
   ```bash
   cd frontend && npm run dev
   # Frontend starts on localhost:3001
   ```

3. **Test Individual Agents:**
   - Use main app for conversational interface
   - Use `/test-mastra` route for comprehensive testing
   - Each agent button triggers live backend calls

4. **Run Sequential Workflow:**
   - Click "Sequential" button in chat interface
   - All agents run in order with real data flow
   - Progress updates appear in conversation

## Platform & Tool Requirements

- **Node.js:** >= 20.9.0
- **Package Manager:** pnpm >= 8.0.0 (or npm)
- **Development OS:** Windows, macOS, or Linux
- **External Services:** Pinecone, Notion, Linear, Miro (optional)
- **AI APIs:** OpenAI, Google, or Anthropic for model access