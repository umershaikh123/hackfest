# 🎨 Product Maestro Frontend

## Next.js Application for AI-Powered Product Management

**Modern React frontend providing conversational interface for Product Maestro's AI agents**

---

## 📋 Overview

The Product Maestro frontend is a Next.js 15 application that provides an intuitive, conversational user interface for product managers to interact with AI agents. It transforms complex product planning workflows into simple chat-based interactions while displaying rich, interactive results.

### 🎯 Core Purpose

Provide product managers with a seamless, no-code interface to transform ideas into comprehensive development artifacts through natural language conversations with specialized AI agents.

---

## ✨ Key Features

### 💬 **Conversational Interface**
- **Natural Language Input** - Chat-based interaction for non-technical users
- **Real-time Agent Responses** - Streaming responses from backend AI agents
- **Context-Aware Conversations** - Maintains conversation history and state
- **Multi-Agent Routing** - Intelligent routing to appropriate specialized agents

### 📊 **Rich Results Dashboard**
- **PRD Preview & Editing** - Interactive Product Requirements Document viewer
- **Visual Design Display** - Embedded Miro boards and design artifacts
- **Sprint Plan Visualization** - Interactive sprint timelines and task management
- **User Story Management** - Organized display of generated user stories with priorities

### 🎨 **Modern UI/UX**
- **Responsive Design** - Mobile-first design with desktop optimization
- **Dark/Light Theme** - Automatic theme switching with user preferences
- **Component Library** - Comprehensive shadcn/ui component system
- **Loading States** - Smooth loading animations and progress indicators

### 🔗 **Backend Integration**
- **API Routes** - Next.js API routes for backend agent communication
- **Error Handling** - Graceful error boundaries and user feedback
- **Session Management** - Persistent conversation state across page reloads
- **Real-time Updates** - Live updates as agents process requests

---

## 🏗️ Technical Architecture

### **Technology Stack**
- **Framework:** Next.js 15 with App Router architecture
- **React:** React 19 with modern hooks and concurrent features
- **TypeScript:** Strict type checking with shared schemas
- **Styling:** Tailwind CSS with custom design system
- **UI Components:** Radix UI primitives + shadcn/ui components
- **Forms:** React Hook Form with Zod validation
- **State Management:** React Context + custom hooks
- **Theme:** next-themes for seamless dark/light mode

### **Project Structure**
```
frontend/
├── app/                    # Next.js App Router
│   ├── api/agents/         # Backend agent integration endpoints
│   │   ├── idea-generation/route.ts
│   │   ├── user-story/route.ts
│   │   ├── prd/route.ts
│   │   ├── sprint-planner/route.ts
│   │   ├── visual-design/route.ts
│   │   └── feedback/route.ts
│   ├── globals.css         # Global styles and CSS variables
│   ├── layout.tsx          # Root layout with theme provider
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ... (40+ components)
│   ├── chat-interface.tsx     # Main conversation interface
│   ├── results-dashboard.tsx  # Artifact display and management
│   ├── theme-provider.tsx     # Theme context wrapper
│   └── theme-switcher.tsx     # Dark/light mode toggle
├── lib/                  # Utilities and configurations
│   ├── agents.ts         # Backend agent integration utilities
│   └── utils.ts          # General utility functions
├── hooks/                # Custom React hooks
├── public/               # Static assets and images
├── styles/               # Additional stylesheets
└── config files          # Next.js, Tailwind, TypeScript configs
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 20.9.0
- **pnpm** >= 8.0.0 (recommended) or npm
- **Backend** running on localhost:3001

### Installation & Setup
```bash
# Navigate to frontend directory (from monorepo root)
cd frontend

# Install dependencies
pnpm install

# Environment setup (optional)
cp .env.local.example .env.local
# Edit .env.local if you need custom configuration

# Start development server
pnpm run dev

# Access application
open http://localhost:3000
```

### Development Commands
```bash
# Development
pnpm run dev              # Start Next.js development server
pnpm run build            # Build for production
pnpm run start            # Start production server

# Code Quality
pnpm run lint             # ESLint code checking
pnpm run type-check       # TypeScript validation

# Maintenance
pnpm run clean            # Clean build artifacts and cache
```

---

## 🔧 Configuration

### Environment Variables
```bash
# .env.local (optional - most config comes from backend)

# Custom API endpoint (if backend is not on localhost:3001)
NEXT_PUBLIC_API_URL=http://localhost:3001

# App configuration
NEXT_PUBLIC_APP_NAME=Product Maestro
NEXT_PUBLIC_APP_DESCRIPTION=AI-Powered Product Management Platform
```

### Theme Configuration
The app uses a comprehensive theme system with CSS variables:

```css
/* Light theme colors */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  /* ... additional color variables */
}

/* Dark theme colors */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  /* ... additional color variables */
}
```

---

## 🎨 UI Component System

### **Core Components**

#### **ChatInterface** (`components/chat-interface.tsx`)
Main conversation component featuring:
- Message input with multi-line support
- Chat history with agent identification
- Real-time response streaming
- File upload for additional context
- Agent selection and routing

```typescript
interface ChatInterfaceProps {
  initialMessages?: Message[];
  onAgentResponse?: (response: AgentResponse) => void;
  onError?: (error: Error) => void;
}
```

#### **ResultsDashboard** (`components/results-dashboard.tsx`)
Artifact display component featuring:
- PRD document preview and editing
- Interactive Miro board embedding
- Sprint timeline visualization
- User story organization and management
- Export and sharing capabilities

```typescript
interface ResultsDashboardProps {
  artifacts: GeneratedArtifacts;
  onArtifactUpdate?: (type: string, data: any) => void;
  onExport?: (format: ExportFormat) => void;
}
```

### **shadcn/ui Components**
Complete component library including:
- **Form Elements:** Input, Textarea, Select, Checkbox, Radio
- **Navigation:** Tabs, Accordion, Breadcrumb, Pagination
- **Feedback:** Alert, Toast, Dialog, Sheet, Tooltip
- **Data Display:** Card, Table, Badge, Avatar, Progress
- **Layout:** Separator, Scroll Area, Resizable Panels

---

## 🔗 Backend Integration

### **API Route Architecture**
Each AI agent has a dedicated API route:

```typescript
// app/api/agents/idea-generation/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();
    
    // Call backend Mastra agent
    const response = await fetch('http://localhost:3001/api/idea-generation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context })
    });
    
    if (!response.ok) {
      throw new Error(`Agent request failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Idea generation error:', error);
    return NextResponse.json(
      { error: 'Failed to process idea generation request' },
      { status: 500 }
    );
  }
}
```

### **Agent Integration Utilities** (`lib/agents.ts`)
```typescript
export type AgentType = 
  | 'idea-generation'
  | 'user-story'
  | 'prd'
  | 'sprint-planner'
  | 'visual-design'
  | 'feedback';

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    agentType: AgentType;
    processingTime: number;
    confidence: number;
  };
}

// Call specific agent with error handling
export async function callAgent(
  agentType: AgentType,
  message: string,
  context?: any
): Promise<AgentResponse> {
  try {
    const response = await fetch(`/api/agents/${agentType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: { agentType, processingTime: 0, confidence: 0 }
    };
  }
}

// Stream agent responses for real-time updates
export async function streamAgentResponse(
  agentType: AgentType,
  message: string
): Promise<ReadableStream> {
  const response = await fetch(`/api/agents/${agentType}/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });

  if (!response.body) {
    throw new Error('No response stream available');
  }

  return response.body;
}
```

---

## 🎯 State Management

### **Conversation Context**
```typescript
// contexts/ConversationContext.tsx
interface ConversationState {
  messages: Message[];
  currentAgent: AgentType | null;
  artifacts: GeneratedArtifacts;
  isLoading: boolean;
  sessionId: string;
}

interface ConversationContextType extends ConversationState {
  addMessage: (message: Message) => void;
  setCurrentAgent: (agent: AgentType) => void;
  updateArtifact: (type: string, data: any) => void;
  clearConversation: () => void;
  loadSession: (sessionId: string) => Promise<void>;
}

export const ConversationContext = createContext<ConversationContextType | null>(null);
```

### **Custom Hooks**
```typescript
// hooks/useConversation.ts
export function useConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within ConversationProvider');
  }
  return context;
}

// hooks/useAgent.ts
export function useAgent(agentType: AgentType) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callAgent = useCallback(async (message: string, context?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await callAgent(agentType, message, context);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [agentType]);

  return { callAgent, loading, error };
}
```

---

## 🎨 Styling & Design System

### **Tailwind CSS Configuration**
```typescript
// tailwind.config.ts
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // ... additional color system
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-in-out",
        "slide-in": "slide-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### **Component Styling Patterns**
```typescript
// Using cn() utility for conditional classes
import { cn } from "@/lib/utils";

export function Button({ className, variant = "default", size = "default", ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
          "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
        },
        {
          "h-10 px-4 py-2": size === "default",
          "h-9 rounded-md px-3": size === "sm",
          "h-11 rounded-md px-8": size === "lg",
        },
        className
      )}
      {...props}
    />
  );
}
```

---

## 🧪 Testing Strategy

### **Component Testing Setup**
```typescript
// __tests__/components/ChatInterface.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatInterface } from '@/components/chat-interface';
import { ConversationProvider } from '@/contexts/ConversationContext';

const TestWrapper = ({ children }) => (
  <ConversationProvider>
    {children}
  </ConversationProvider>
);

describe('ChatInterface', () => {
  test('renders message input', () => {
    render(<ChatInterface />, { wrapper: TestWrapper });
    expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
  });

  test('sends message on form submission', async () => {
    const onMessage = jest.fn();
    render(<ChatInterface onMessage={onMessage} />, { wrapper: TestWrapper });
    
    const input = screen.getByPlaceholderText(/type your message/i);
    const submitButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(onMessage).toHaveBeenCalledWith('Test message');
    });
  });
});
```

### **API Route Testing**
```typescript
// __tests__/api/agents/idea-generation.test.ts
import { POST } from '@/app/api/agents/idea-generation/route';

describe('/api/agents/idea-generation', () => {
  test('processes idea generation request', async () => {
    const mockRequest = new Request('http://localhost:3000/api/agents/idea-generation', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Build a fitness app',
        context: { userId: 'test-user' }
      }),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
  });
});
```

---

## 🚀 Deployment & Performance

### **Build Optimization**
```bash
# Production build with analysis
pnpm run build

# Analyze bundle size
npx @next/bundle-analyzer

# Performance testing
pnpm run lighthouse
```

### **Performance Optimizations**
- **Code Splitting:** Dynamic imports for heavy components
- **Image Optimization:** Next.js Image component with lazy loading
- **Bundle Analysis:** Regular bundle size monitoring
- **Caching:** Proper cache headers for static assets
- **Preloading:** Critical resources preloading

### **Environment-Specific Configuration**
```typescript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['miro.com', 'notion.so'],
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
```

---

## 📚 **Development Resources**

### **Documentation**
- **[🏠 Monorepo Guide](../CLAUDE.md)** - Complete project context
- **[🤖 Backend Documentation](../backend/CLAUDE.md)** - Backend integration guide
- **[🎨 Frontend Guide](./CLAUDE.md)** - Detailed frontend development context

### **Component Library**
- **[shadcn/ui Components](https://ui.shadcn.com/)** - Component documentation
- **[Radix UI Primitives](https://www.radix-ui.com/)** - Base component library
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling framework

### **Framework Resources**
- **[Next.js 15 Docs](https://nextjs.org/docs)** - Framework documentation
- **[React 19 Features](https://react.dev/)** - React documentation
- **[TypeScript Guide](https://www.typescriptlang.org/)** - Type system documentation

---

**🎨 Ready to build the future of product management interfaces?** 

Start with `pnpm run dev` and create the conversational experience that will revolutionize how product managers work with AI agents!