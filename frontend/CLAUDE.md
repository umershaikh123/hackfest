# CLAUDE.md - Product Maestro Frontend

This file provides guidance to Claude Code when working with the Product Maestro frontend - a Next.js application for the AI-powered product management IDE.

## Project Overview

The frontend is a modern Next.js 15 application that provides a conversational user interface for Product Maestro's AI agents. It enables product managers to transform ideas into comprehensive development artifacts through an intuitive chat-based workflow.

## Technology Stack

- **Framework:** Next.js 15 with App Router
- **React:** React 19 with modern hooks and patterns
- **TypeScript:** Strict TypeScript configuration
- **Styling:** Tailwind CSS with custom configuration
- **UI Components:** Radix UI + shadcn/ui component library
- **Forms:** React Hook Form with Zod validation
- **State Management:** React Context + custom hooks
- **Theme:** next-themes for dark/light mode support

## Development Commands

```bash
# Development server
pnpm run dev              # Start Next.js dev server (localhost:3000)

# Production build
pnpm run build           # Build for production
pnpm run start           # Start production server

# Code quality
pnpm run lint            # ESLint checking
pnpm run type-check      # TypeScript validation

# Maintenance
pnpm run clean           # Clean build artifacts
```

## Project Structure

```
frontend/
├── app/                 # Next.js App Router
│   ├── api/            # API route handlers
│   │   └── agents/     # Agent integration endpoints
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout component
│   └── page.tsx        # Main application page
├── components/         # React components
│   ├── ui/            # shadcn/ui base components
│   ├── chat-interface.tsx      # Main chat component
│   ├── results-dashboard.tsx   # Results display
│   ├── theme-provider.tsx      # Theme context
│   └── theme-switcher.tsx      # Dark/light toggle
├── lib/               # Utility libraries
│   ├── agents.ts      # Agent integration utilities
│   └── utils.ts       # General utilities
├── hooks/             # Custom React hooks
├── styles/            # Additional stylesheets
├── public/            # Static assets
├── next.config.mjs    # Next.js configuration
├── tailwind.config.ts # Tailwind configuration
├── components.json    # shadcn/ui configuration
└── tsconfig.json      # TypeScript configuration
```

## Core Components

### Main Application (`app/page.tsx`)

The primary application interface featuring:
- Conversational chat interface for AI agent interaction
- Real-time results display for generated artifacts
- Theme switching and responsive design
- Integration with all backend AI agents

### Chat Interface (`components/chat-interface.tsx`)

**Purpose:** Main user interaction component
**Features:**
- Natural language input processing
- Message history and conversation state
- Agent response streaming and display
- File upload support for context

**Key Functions:**
```typescript
// Send message to specific agent
const sendMessage = async (message: string, agentType: AgentType) => {
  // API integration logic
}

// Handle agent responses
const handleAgentResponse = (response: AgentResponse) => {
  // Response processing logic
}
```

### Results Dashboard (`components/results-dashboard.tsx`)

**Purpose:** Display and manage generated artifacts
**Features:**
- PRD document preview and editing
- Visual design artifact display
- Sprint plan visualization
- Export and sharing capabilities

**Supported Artifacts:**
- Product Requirements Documents (PRDs)
- User stories with acceptance criteria
- Sprint planning with task breakdowns
- Visual design wireframes and user flows
- Miro board integrations

### UI Component Library (`components/ui/`)

Complete shadcn/ui implementation including:
- **Forms:** Input, textarea, select, checkbox, radio
- **Navigation:** Tabs, accordion, breadcrumb, pagination
- **Feedback:** Alert, toast, dialog, sheet
- **Data Display:** Card, table, badge, avatar
- **Layout:** Separator, scroll-area, resizable panels

## API Integration

### Agent API Routes (`app/api/agents/`)

**Endpoint Structure:**
```
/api/agents/
├── idea-generation/route.ts    # Idea refinement and feature identification
├── user-story/route.ts         # User story generation
├── prd/route.ts               # PRD compilation and Notion publishing
├── sprint-planner/route.ts    # Sprint planning with Linear integration
├── visual-design/route.ts     # Visual design with Miro integration
└── feedback/route.ts          # Feedback routing and analysis
```

**Example API Route (`app/api/agents/idea-generation/route.ts`):**
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();
    
    // Integrate with backend Mastra agent
    const response = await callIdeaGenerationAgent(message, context);
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process idea generation' },
      { status: 500 }
    );
  }
}
```

### Agent Integration (`lib/agents.ts`)

**Purpose:** Utilities for backend agent communication
**Functions:**
```typescript
// Agent type definitions
export type AgentType = 
  | 'idea-generation'
  | 'user-story' 
  | 'prd'
  | 'sprint-planner'
  | 'visual-design'
  | 'feedback';

// Call specific agent
export async function callAgent(
  agentType: AgentType,
  message: string,
  context?: any
): Promise<AgentResponse> {
  // Implementation
}

// Stream agent responses
export async function streamAgentResponse(
  agentType: AgentType,
  message: string
): Promise<ReadableStream> {
  // Implementation
}
```

## State Management

### Conversation Context

```typescript
// Context for managing chat state
export const ConversationContext = createContext({
  messages: [],
  currentAgent: null,
  artifacts: {},
  addMessage: (message: Message) => {},
  setCurrentAgent: (agent: AgentType) => {},
  updateArtifact: (type: string, data: any) => {}
});
```

### Theme Management

```typescript
// Theme provider with next-themes
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
```

## Styling Guidelines

### Tailwind CSS Configuration

**Custom Theme Extensions:**
```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // shadcn/ui color system
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      }
    }
  }
}
```

**Component Styling Patterns:**
```typescript
// Use cn() utility for conditional classes
import { cn } from "@/lib/utils";

export function Button({ className, variant, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
```

### Responsive Design

**Breakpoint Strategy:**
- **Mobile First:** Design for mobile, enhance for larger screens
- **Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px)
- **Component Responsiveness:** Use Tailwind responsive utilities

**Example Responsive Component:**
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid layout */}
</div>
```

## Form Management

### React Hook Form Integration

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form schema with Zod
const formSchema = z.object({
  productIdea: z.string().min(10, "Please provide more details"),
  targetAudience: z.string().optional(),
});

// Form component
export function IdeaForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productIdea: "",
      targetAudience: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Handle form submission
  };
}
```

## Error Handling

### Error Boundaries

```typescript
// Error boundary for graceful error handling
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### API Error Handling

```typescript
// Centralized error handling for API calls
export async function handleApiCall<T>(
  apiCall: () => Promise<T>
): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('An unexpected error occurred');
    }
    return null;
  }
}
```

## Performance Optimization

### Code Splitting

```typescript
// Dynamic imports for code splitting
const LazyComponent = dynamic(() => import('@/components/heavy-component'), {
  loading: () => <Skeleton className="h-4 w-full" />,
  ssr: false,
});
```

### Image Optimization

```typescript
// Next.js Image component usage
import Image from 'next/image';

<Image
  src="/placeholder.jpg"
  alt="Description"
  width={500}
  height={300}
  priority={false}
  placeholder="blur"
/>
```

## Testing Guidelines

### Component Testing Setup

```typescript
// Test utilities setup
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/theme-provider';

// Test wrapper with providers
const TestWrapper = ({ children }) => (
  <ThemeProvider>
    {children}
  </ThemeProvider>
);

// Example component test
test('renders chat interface', () => {
  render(<ChatInterface />, { wrapper: TestWrapper });
  expect(screen.getByRole('textbox')).toBeInTheDocument();
});
```

### API Route Testing

```typescript
// API route test example
import { POST } from '@/app/api/agents/idea-generation/route';

test('idea generation API endpoint', async () => {
  const request = new Request('http://localhost:3000/api/agents/idea-generation', {
    method: 'POST',
    body: JSON.stringify({ message: 'Test idea' }),
  });

  const response = await POST(request);
  expect(response.status).toBe(200);
});
```

## Development Best Practices

### Code Organization

1. **Component Structure:** One component per file with co-located tests
2. **Naming Conventions:** PascalCase for components, camelCase for functions
3. **Import Organization:** External imports first, then internal imports
4. **Type Safety:** Use TypeScript strictly, avoid `any` types

### Performance Guidelines

1. **Component Optimization:** Use React.memo for expensive components
2. **State Management:** Keep state as local as possible
3. **Effect Management:** Clean up effects properly with dependency arrays
4. **Bundle Size:** Monitor bundle size and use dynamic imports

### Accessibility

1. **Semantic HTML:** Use proper HTML elements and ARIA attributes
2. **Keyboard Navigation:** Ensure all interactive elements are keyboard accessible
3. **Screen Readers:** Provide meaningful alt text and labels
4. **Color Contrast:** Maintain WCAG 2.1 AA contrast standards

## Environment Configuration

### Environment Variables

```bash
# .env.local (frontend-specific)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME="Product Maestro"

# Development vs Production
NEXT_PUBLIC_VERCEL_ENV=development
```

### Configuration Files

**Next.js Configuration (`next.config.mjs`):**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['placeholder.com'],
  },
};

export default nextConfig;
```

## Integration with Backend

### Agent Communication Patterns

1. **REST API:** Standard HTTP requests to backend agents
2. **Streaming:** Real-time agent response streaming
3. **WebSockets:** For real-time collaboration features
4. **Polling:** For long-running agent processes

### Data Flow Architecture

```
User Input → Chat Interface → API Route → Backend Agent → Response → UI Update
```

### Error Handling Strategy

1. **Network Errors:** Retry logic with exponential backoff
2. **Agent Errors:** Display user-friendly error messages
3. **Validation Errors:** Show form-level validation feedback
4. **System Errors:** Graceful degradation with error boundaries

## Deployment Considerations

### Build Optimization

```bash
# Production build with optimizations
pnpm run build

# Analyze bundle size
npx @next/bundle-analyzer
```

### Static Generation

```typescript
// Static generation for performance
export async function generateStaticParams() {
  return [
    // Static route parameters
  ];
}
```

### Environment-Specific Configuration

- **Development:** Hot reloading, detailed error messages
- **Staging:** Production-like environment for testing
- **Production:** Optimized builds, error reporting integration

## Quick Development Setup

1. **Install Dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your settings
   ```

3. **Start Development:**
   ```bash
   pnpm run dev
   ```

4. **Access Application:**
   - Frontend: http://localhost:3000
   - API Routes: http://localhost:3000/api/

## Key Files for Development

- `app/page.tsx` - Main application entry point
- `components/chat-interface.tsx` - Primary user interface
- `app/api/agents/` - Backend integration endpoints
- `lib/agents.ts` - Agent communication utilities
- `components/ui/` - Reusable UI component library
- `tailwind.config.ts` - Styling configuration